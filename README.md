# OralTech

## Descripción
OralTech es un sistema web de gestión de historias clínicas y agendamiento de citas odontológicas, construido con **Spring Boot (Java 17)** y **PostgreSQL** en el backend, y **React + Vite** en el frontend. La arquitectura está dividida en capas (presentación, lógica de negocio, persistencia) y organizada en módulos por dominio.

## Prerrequisitos
- **Java 21** (el wrapper `mvnw.cmd` usará el `JAVA_HOME` configurado).
- **Maven** (wrapper incluido en el proyecto).
- **Node.js** >= 18 (LTS) y **npm**.
- **PostgreSQL** (puerto 5432) con base de datos `oraltech`.
- **Git** para clonar el repositorio.

## Configuración del entorno

### 1. Clonar el proyecto
```bash
git clone https://github.com/NCamacho0715/oraltech.git
cd oraltech
```

### 2. Crear la base de datos (Arranque desde cero)
OralTech utiliza **Flyway** para gestionar y versionar el esquema de base de datos automáticamente al iniciar. Por ello, solo requiere crear una base de datos PostgreSQL vacía:

```sql
CREATE DATABASE oraltech;
CREATE DATABASE oraltech_test;
CREATE USER oraltech WITH PASSWORD 'oraltech';
GRANT ALL PRIVILEGES ON DATABASE oraltech TO oraltech;
GRANT ALL PRIVILEGES ON DATABASE oraltech_test TO oraltech;
```
> **Nota:** Al arrancar el backend por primera vez contra la base de datos vacía `oraltech`, Flyway aplicará automáticamente todas las migraciones estructuradas (`V20260412_1148` y posteriores), creando las tablas requeridas y dejando la base de datos lista para su uso sin necesidad de scripts manuales previos.
> 
> Ajuste las credenciales en [`backend/oraltech/src/main/resources/application.properties`](file:///backend/oraltech/src/main/resources/application.properties) si su configuración local difiere.

### 3. Verificación automatizada de arranque en base limpia
Para evaluar o reproducir el aprovisionamiento automático desde cero:
- **En Linux / macOS / Git Bash:**
  ```bash
  chmod +x backend/verify-flyway-clean.sh
  ./backend/verify-flyway-clean.sh
  ```
- **En Windows PowerShell:**
  ```powershell
  .\backend\verify-flyway-clean.ps1
  ```
Este script crea una base de datos limpia temporal, inicia Spring Boot, valida la ejecución exitosa de todas las migraciones de Flyway, valida las tablas creadas y comprueba la disponibilidad del servicio respondiendo en `/api/auth/login`.

## Backend (Spring Boot)

### Compilación y pruebas unitarias
Ejecute todas las pruebas y genere el reporte de cobertura con JaCoCo:
```powershell
cd backend/oraltech
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd clean test
```
El reporte HTML de cobertura se genera en `target/site/jacoco/index.html`.

### Ejecutar el servidor
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd spring-boot:run
```
El backend se iniciará en `http://localhost:8080`.

### Generar el artefacto JAR
```powershell
.\mvnw.cmd clean package
```
El JAR resultante se encontrará en `target/oraltech-0.0.1-SNAPSHOT.jar`.

## Frontend (React + Vite)

### Instalar dependencias
```bash
cd frontend
npm install
```

### Ejecutar en modo desarrollo
```bash
npm run dev
```
La interfaz estará disponible en `http://localhost:5173` y se comunicará con el backend en `http://localhost:8080`.

### Compilar para producción
```bash
npm run build
```
Los archivos estáticos generados se ubican en `frontend/dist/`.

## Otros recursos
- **Plan de pruebas**: `docs/plan_de_pruebas_oraltech.md`
- **Frontend**: código fuente en el directorio `frontend/`
