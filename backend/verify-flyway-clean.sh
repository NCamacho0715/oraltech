#!/usr/bin/env bash
set -e

# ==============================================================================
# Script de verificación de inicialización de Flyway en base de datos limpia
# ==============================================================================

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-oraltech_clean_verify}"
export PGPASSWORD="${PGPASSWORD:-p0stgr3s2026}"
SERVER_PORT="${SERVER_PORT:-8099}"

echo "=========================================================="
echo " [1/5] Preparando base de datos limpia: $DB_NAME"
echo "=========================================================="
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

echo "=========================================================="
echo " [2/5] Levantando Spring Boot contra $DB_NAME en puerto $SERVER_PORT..."
echo "=========================================================="
cd "$(dirname "$0")/oraltech"
mvn spring-boot:run \
  -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME --server.port=$SERVER_PORT" &
SPRING_PID=$!

cleanup() {
  echo "Deteniendo Spring Boot (PID: $SPRING_PID)..."
  kill $SPRING_PID 2>/dev/null || true
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
}
trap cleanup EXIT

echo "Esperando a que la aplicación inicie..."
for i in {1..40}; do
  if curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:$SERVER_PORT/api/auth/login" -H "Content-Type: application/json" -d '{"username":"test@example.com","password":"bad"}' | grep -E "401|400|200" > /dev/null; then
    echo "¡La aplicación está en línea y respondió al endpoint de auth!"
    break
  fi
  sleep 2
done

echo "=========================================================="
echo " [3/5] Verificando historial de migraciones Flyway..."
echo "=========================================================="
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT installed_rank, version, description, type, script, success FROM flyway_schema_history;"

echo "=========================================================="
echo " [4/5] Verificando tablas creadas..."
echo "=========================================================="
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"

echo "=========================================================="
echo " [5/5] ¡Verificación completada con éxito!"
echo "=========================================================="
