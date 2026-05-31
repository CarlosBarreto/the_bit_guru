# Load-Env.ps1 — Carga variables de un archivo .env al proceso actual
#
# Uso:
#   .\Load-Env.ps1            # carga .env del directorio actual
#   .\Load-Env.ps1 -Path .env.local
#
# Después de cargar, lanza VS Code / Claude Code desde la misma terminal para
# que hereden el environment. No persiste — al cerrar la terminal, las
# variables desaparecen.

[CmdletBinding()]
param(
  [string]$Path = ".env"
)

if (-not (Test-Path $Path)) {
  Write-Host "[Load-Env] No existe '$Path'. Copia .env.example a .env y rellena valores." -ForegroundColor Yellow
  exit 1
}

$loaded = 0
Get-Content $Path | ForEach-Object {
  $line = $_.Trim()
  if ([string]::IsNullOrWhiteSpace($line)) { return }
  if ($line.StartsWith("#")) { return }
  if ($line -notmatch "^[A-Za-z_][A-Za-z0-9_]*\s*=") { return }

  $eqIdx = $line.IndexOf("=")
  $name  = $line.Substring(0, $eqIdx).Trim()
  $value = $line.Substring($eqIdx + 1).Trim()

  # Quitar comillas envolventes si las hay
  if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))) {
    $value = $value.Substring(1, $value.Length - 2)
  }

  if ([string]::IsNullOrEmpty($value)) {
    Write-Host "[Load-Env] $name está vacía en $Path — se omite." -ForegroundColor DarkYellow
    return
  }

  [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
  $loaded++
  Write-Host "[Load-Env] $name cargada." -ForegroundColor Green
}

Write-Host "[Load-Env] Listo. $loaded variable(s) cargada(s) en esta sesión." -ForegroundColor Cyan
