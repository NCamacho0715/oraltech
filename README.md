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

### 2. Crear la base de datos
```sql
CREATE DATABASE oraltech;
CREATE DATABASE oraltech_test;
CREATE USER oraltech WITH PASSWORD 'oraltech';
GRANT ALL PRIVILEGES ON DATABASE oraltech TO oraltech;
GRANT ALL PRIVILEGES ON DATABASE oraltech_test TO oraltech;
```
Ajustar `backend/oraltech/src/main/resources/application.properties` si su configuración difiere.

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
