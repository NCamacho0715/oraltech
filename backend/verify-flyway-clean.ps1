# ==============================================================================
# Script PowerShell de verificación de inicialización de Flyway en base limpia
# ==============================================================================

param (
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbUser = "postgres",
    [string]$DbPassword = "p0stgr3s2026",
    [string]$DbName = "oraltech_clean_verify",
    [int]$ServerPort = 8099
)

$ErrorActionPreference = "Stop"

$env:PGPASSWORD = $DbPassword

$psqlCmd = "psql"
if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe"
    )
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $psqlCmd = $path
            break
        }
    }
}

function Invoke-Psql {
    param([string[]]$ArgsList)
    & $psqlCmd @ArgsList
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [1/5] Preparando base de datos limpia: $DbName" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Invoke-Psql -ArgsList @("-h", $DbHost, "-p", $DbPort, "-U", $DbUser, "-c", "DROP DATABASE IF EXISTS $DbName;")
Invoke-Psql -ArgsList @("-h", $DbHost, "-p", $DbPort, "-U", $DbUser, "-c", "CREATE DATABASE $DbName;")

$backendDir = Join-Path $PSScriptRoot "oraltech"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [2/5] Levantando Spring Boot contra $DbName en puerto $ServerPort..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$processInfo = New-Object System.Diagnostics.ProcessStartInfo
$processInfo.FileName = "powershell.exe"
$processInfo.Arguments = "-Command `"cd '$backendDir'; .\mvnw.cmd spring-boot:run '-Dspring-boot.run.arguments=--spring.datasource.url=jdbc:postgresql://$($DbHost):$($DbPort)/$($DbName) --server.port=$($ServerPort)'`""
$processInfo.UseShellExecute = $false
$processInfo.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($processInfo)

try {
    Write-Host "Esperando a que la aplicación inicie y responda en http://localhost:$ServerPort/api/auth/login..." -ForegroundColor Yellow
    $started = $false
    for ($i = 0; $i -lt 45; $i++) {
        Start-Sleep -Seconds 2
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:$ServerPort/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"test@example.com","password":"bad"}' -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
                $started = $true
                break
            }
        } catch {
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -ge 200 -and $_.Exception.Response.StatusCode.value__ -lt 500) {
                $started = $true
                break
            }
        }
    }

    if (-not $started) {
        Write-Error "La aplicación no respondió a tiempo."
    }

    Write-Host "¡La aplicación está en línea y respondió al endpoint de autenticación!" -ForegroundColor Green

    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [3/5] Verificando historial de migraciones Flyway..." -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Invoke-Psql -ArgsList @("-h", $DbHost, "-p", $DbPort, "-U", $DbUser, "-d", $DbName, "-c", "SELECT installed_rank, version, description, type, script, success FROM flyway_schema_history;")

    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [4/5] Verificando tablas creadas..." -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Invoke-Psql -ArgsList @("-h", $DbHost, "-p", $DbPort, "-U", $DbUser, "-d", $DbName, "-c", "\dt")

    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [5/5] ¡Verificación completada con éxito!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
}
finally {
    Write-Host "Deteniendo proceso de prueba y limpiando base de datos..." -ForegroundColor Yellow
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*$ServerPort*" -or $_.CommandLine -like "*$DbName*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Invoke-Psql -ArgsList @("-h", $DbHost, "-p", $DbPort, "-U", $DbUser, "-c", "DROP DATABASE IF EXISTS $DbName;")
}
