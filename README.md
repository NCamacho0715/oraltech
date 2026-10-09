# OralTech — Sistema de Gestión Odontológica

**OralTech** es una aplicación web pensada para facilitar el trabajo diario en el **Consultorio Odontológico JG**. Permite llevar en un solo lugar el control de pacientes, historias clínicas digitales, agendamiento de citas y copias de seguridad de la información, funcionando directamente dentro de la red local del consultorio.

---

## ¿Qué puedes hacer con OralTech?

- **Usuarios y Permisos:** Ingreso seguro con usuario y contraseña, diferenciando las funciones del **Odontólogo** (atención clínica y agenda) y del **Administrador** (gestión de cuentas del personal y respaldos del sistema).
- **Gestión de Pacientes:** Registro de pacientes nuevos, actualización de sus datos de contacto y búsqueda inmediata por nombre o número de documento.
- **Historia Clínica y Odontograma Digital:** Registro completo de antecedentes médicos, exámenes clínicos, diagnósticos, planes de tratamiento, evoluciones por consulta, consentimientos firmados y odontograma interactivo. Todo el historial queda protegido para conservar la trazabilidad de cada atención sin sobrescribir registros pasados.
- **Agenda de Citas y Recordatorios por Correo:** Calendario visual para programar, reprogramar o cancelar citas validando automáticamente que no se crucen los horarios. Envía correos automáticos de confirmación al agendar y recordatorios el día anterior a las 9:00 AM (y si el consultorio no tiene internet en ese momento, el sistema continúa funcionando con total normalidad).
- **Respaldos Automáticos y Recuperación (Backups):** Generación automática de copias de seguridad de la base de datos todos los días (o al encender el computador si han pasado más de 24 horas desde el último respaldo), guardado de copia en unidad externa, limpieza automática de respaldos con más de 30 días y restauración segura con respaldo preventivo previo.

---

## ¿Qué necesitas tener instalado en el computador servidor?

1. **Java 21 (JDK 21)**
2. **Node.js** (versión 18 o superior)
3. **PostgreSQL** (versión 15 o superior, corriendo en el puerto `5432`)
4. **Git** (para descargar el proyecto)

---

## Paso a paso para poner en marcha el sistema

### 1. Descargar el proyecto
Abre una terminal y ejecuta:
```bash
git clone https://github.com/NCamacho0715/oraltech.git
cd oraltech
```

### 2. Crear la base de datos en PostgreSQL
Solo necesitas crear la base de datos vacía en PostgreSQL (por ejemplo desde **pgAdmin** o `psql`). **No necesitas crear las tablas manualmente**, ya que el sistema las crea y actualiza por sí solo la primera vez que arranca:

```sql
CREATE DATABASE oraltech;
CREATE DATABASE oraltech_test;
```

> **Nota:** Si la contraseña de tu usuario `postgres` o la versión instalada de PostgreSQL cambia en el computador servidor, puedes ajustarla fácilmente en el archivo:
> `backend/oraltech/src/main/resources/application.properties`

### 3. Iniciar el Backend (Servidor de datos)
Abre una terminal de **PowerShell**, entra a la carpeta del backend e inicia el servidor:

```powershell
cd backend/oraltech
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd spring-boot:run
```
El servidor quedará activo en `http://localhost:8080`.

### 4. Iniciar el Frontend (Interfaz visual)
Abre **otra terminal**, entra a la carpeta `frontend`, instala las dependencias (solo la primera vez) e inicia la pantalla web:

```bash
cd frontend
npm install
npm run dev
```
Listo, ya puedes abrir el navegador en el computador e ingresar a:
👉 **`http://localhost:5173`**

---

## Cómo entrar desde otros computadores, tablets o celulares del consultorio

El sistema está configurado para que varios dispositivos puedan usarlo al mismo tiempo siempre que estén conectados a la **misma red local (Wi-Fi o cable Ethernet)**:

1. Averigua la dirección IP local del computador servidor ejecutando `ipconfig` en PowerShell (por ejemplo: `192.168.10.15`).
2. Desde el navegador de cualquier otro computador, tablet o celular del consultorio, entra a:
   ```text
   http://192.168.10.15:5173
   ```
   *(Cambiando `192.168.10.15` por la IP real del servidor).*
3. **Si la página no carga desde otro dispositivo la primera vez**, habilita el permiso en el Firewall de Windows ejecutando este comando en PowerShell **como Administrador** en el computador servidor:
   ```powershell
   New-NetFirewallRule -DisplayName "OralTech LAN" -Direction Inbound -LocalPort 5173,8080 -Protocol TCP -Action Allow
   ```

---

## Comandos útiles de verificación y empaquetado

- **Ejecutar todas las pruebas automáticas del Backend y generar reporte de cobertura (JaCoCo):**
  ```powershell
  cd backend/oraltech
  $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
  .\mvnw.cmd clean test
  ```
  *(El reporte visual de cobertura queda en `backend/oraltech/target/site/jacoco/index.html`).*

- **Generar el archivo ejecutable `.jar` del Backend para producción:**
  ```powershell
  cd backend/oraltech
  .\mvnw.cmd clean package
  ```

- **Compilar el Frontend para producción:**
  ```bash
  cd frontend
  npm run build
  ```

- **Probar desde cero la creación automática de tablas en una base limpia:**
  ```powershell
  .\backend\verify-flyway-clean.ps1
  ```

---

## Documentación adicional

En la carpeta [`docs/`](./docs) encontrarás información detallada sobre el funcionamiento interno de los módulos clínicos, la trazabilidad de auditoría y el [Plan de Pruebas del Sistema](./docs/plan_de_pruebas_oraltech.md).
