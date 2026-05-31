# init.ps1 — Verificacion e inicializacion del entorno (Windows / PowerShell)
#
# Este script lo ejecuta el agente al COMENZAR una sesion y antes de
# declarar cualquier tarea como `done`. Si falla, la sesion no debe avanzar.
#
# Compatible con Windows PowerShell 5.1 y PowerShell 7+.
# Para correrlo en Linux/Mac: `pwsh ./init.ps1`.

$ErrorActionPreference = 'Continue'
$ExitCode = 0

function Ok    { param($m) Write-Host "[OK]    $m" -ForegroundColor Green }
function Warn  { param($m) Write-Host "[WARN]  $m" -ForegroundColor Yellow }
function Fail  { param($m) Write-Host "[FAIL]  $m" -ForegroundColor Red }

Write-Host ""
Write-Host "-- 1. Proyecto: bit_guru (TypeScript) ----------"
Ok "Stack declarado: TypeScript"

Write-Host ""
Write-Host "-- 2. Verificando archivos base del arnes ------------"

$Base = @(
  'AGENTS.md',
  'CLAUDE.md',
  'CHECKPOINTS.md',
  'feature_list.json',
  'progress/current.md',
  'docs/architecture.md',
  'docs/conventions.md',
  'docs/verification.md'
)

foreach ($f in $Base) {
  if (Test-Path $f) {
    Ok "Existe $f"
  } else {
    Fail "Falta archivo base: $f"
    $ExitCode = 1
  }
}

Write-Host ""
Write-Host "-- 3. Validando feature_list.json --------------------"

try {
  $data = Get-Content 'feature_list.json' -Raw | ConvertFrom-Json
  $valid = @('pending','in_progress','done','blocked')
  $inProgress = @($data.features | Where-Object { $_.status -eq 'in_progress' })
  if ($inProgress.Count -gt 1) {
    Fail "Hay $($inProgress.Count) features en in_progress (maximo 1)"
    $ExitCode = 1
  }
  foreach ($feat in $data.features) {
    if ($feat.status -notin $valid) {
      Fail "Estado invalido en feature $($feat.id): $($feat.status)"
      $ExitCode = 1
    }
  }
  Ok "feature_list.json valido ($($data.features.Count) features)"
} catch {
  Fail "feature_list.json invalido: $($_.Exception.Message)"
  $ExitCode = 1
}

Write-Host ""
Write-Host "-- 4. Ejecutando tests -------------------------------"

$TestCmd = 'npm test --prefix frontend-astro'
if ([string]::IsNullOrWhiteSpace($TestCmd) -or $TestCmd -eq 'none') {
  Warn "No hay comando de tests configurado (TEST_CMD vacio en init.ps1)"
} else {
  Write-Host "> $TestCmd"
  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $TestCmd `
    -NoNewWindow -Wait -PassThru
  if ($proc.ExitCode -eq 0) {
    Ok "Todos los tests pasan"
  } else {
    Fail "Hay tests rotos (exit code $($proc.ExitCode))"
    $ExitCode = 1
  }
}

Write-Host ""
Write-Host "-- 5. Resumen ----------------------------------------"

if ($ExitCode -eq 0) {
  Ok "Entorno listo. Puedes empezar a trabajar."
} else {
  Fail "Entorno NO esta listo. Resuelve los errores antes de avanzar."
}

exit $ExitCode
