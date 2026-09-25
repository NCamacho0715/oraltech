@echo off
setlocal

set "PGDUMP=C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
set "HOST=localhost"
set "PORT=5432"
set "USER=postgres"
set "DATABASE=oraltech"
set "BACKUP_DIR=C:\Oraltech\oraltech\Backups\PostgreSQL"
set "RETENTION_DAYS=30"

REM Configura aqui una ruta EXTERNA si existe. Ejemplo:
REM set "EXTERNAL_BACKUP_DIR=\\SERVIDOR\Backups\OralTech"
set "EXTERNAL_BACKUP_DIR="

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f %%a in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set "DATETIME=%%a"
set "BACKUP_FILE=%BACKUP_DIR%\%DATABASE%_%DATETIME%.backup"
set "CHECKSUM_FILE=%BACKUP_FILE%.sha256"
set "LOG_FILE=%BACKUP_DIR%\backup.log"

echo [%date% %time%] Iniciando backup de %DATABASE%>>"%LOG_FILE%"

"%PGDUMP%" -h "%HOST%" -p "%PORT%" -U "%USER%" -F c -f "%BACKUP_FILE%" "%DATABASE%"
if errorlevel 1 (
    echo [%date% %time%] ERROR: El backup fallo.>>"%LOG_FILE%"
    if exist "%BACKUP_FILE%" del "%BACKUP_FILE%"
    exit /b 1
)

powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 -LiteralPath '%BACKUP_FILE%').Hash | Set-Content -NoNewline -LiteralPath '%CHECKSUM_FILE%'"

if errorlevel 1 (
    echo [%date% %time%] ERROR: No se pudo generar el checksum.>>"%LOG_FILE%"
    exit /b 1
)

if defined EXTERNAL_BACKUP_DIR (
    if not exist "%EXTERNAL_BACKUP_DIR%" mkdir "%EXTERNAL_BACKUP_DIR%"
    copy /Y "%BACKUP_FILE%" "%EXTERNAL_BACKUP_DIR%\" >nul
    if errorlevel 1 (
        echo [%date% %time%] ERROR: Copia externa fallida.>>"%LOG_FILE%"
        >"%BACKUP_FILE%.external.error" echo ERROR
    ) else (
        copy /Y "%CHECKSUM_FILE%" "%EXTERNAL_BACKUP_DIR%\" >nul
        >"%BACKUP_FILE%.external.ok" echo OK
        echo [%date% %time%] Copia externa realizada correctamente.>>"%LOG_FILE%"
    )
) else (
    echo [%date% %time%] ADVERTENCIA: Copia externa no configurada.>>"%LOG_FILE%"
)

forfiles /p "%BACKUP_DIR%" /s /m *.backup /d -%RETENTION_DAYS% /c "cmd /c del @path" >nul 2>&1
forfiles /p "%BACKUP_DIR%" /s /m *.backup.sha256 /d -%RETENTION_DAYS% /c "cmd /c del @path" >nul 2>&1

echo [%date% %time%] BACKUP EXITOSO: %BACKUP_FILE%>>"%LOG_FILE%"
exit /b 0
