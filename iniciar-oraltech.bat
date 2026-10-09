@echo off
setlocal
title OralTech - Servidor Principal (No cerrar esta ventana)

set "ROOT_DIR=%~dp0"

if not defined JAVA_HOME (
    if exist "C:\Program Files\Java\jdk-21" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    )
)

echo ============================================================================
echo   Iniciando OralTech - Consultorio Odontologico JG
echo   Por favor espere mientras cargan los servicios...
echo ============================================================================
echo.

echo [1/2] Iniciando interfaz web Frontend (Puerto 5173)...
start "OralTech - Frontend (No cerrar)" /MIN /D "%ROOT_DIR%frontend" cmd /k "npm run dev"

echo [2/2] Preparando apertura automatica del navegador cuando el servidor este listo...
start "" /B powershell -NoProfile -WindowStyle Hidden -Command "for ($i=0; $i -lt 90; $i++) { Start-Sleep -Seconds 2; try { $c = New-Object System.Net.Sockets.TcpClient('localhost', 8080); $c.Close(); Start-Process 'http://localhost:5173'; break } catch {} }"

echo Iniciando servidor Backend (Puerto 8080)...
echo Cuando aparezca el recuadro de [OK] EL SISTEMA ORALTECH YA ESTA LISTO al final,
echo el navegador se abrira automaticamente y ya podras usar la aplicacion.
echo.
cd /d "%ROOT_DIR%backend\oraltech"
call .\mvnw.cmd spring-boot:run
echo.
echo El servidor se ha detenido.
pause