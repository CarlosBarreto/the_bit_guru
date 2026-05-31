# Implementación — Feature 12: drop_legacy_php

- **Fecha:** 2026-05-30
- **Agente:** implementer
- **Branch:** feat/migrate-to-vercel
- **Snapshot histórico:** preservado por tag `v0.1-php-final` (NO tocado).

## Qué borré

### Archivos trackeados (vía `git rm -r legacy/backend-php/`)
- legacy/backend-php/.env.example
- legacy/backend-php/.gitignore
- legacy/backend-php/app/Controllers/TarotController.php
- legacy/backend-php/composer.json
- legacy/backend-php/composer.lock
- legacy/backend-php/public/.htaccess
- legacy/backend-php/public/index.php

### Restos no trackeados (vía `rm -rf legacy/backend-php`)
- legacy/backend-php/vendor/ (ignorado)
- legacy/backend-php/.env (ignorado)

### Directorio contenedor
- `legacy/` quedó vacío tras borrar `backend-php/` (sin otros contenidos) → removido con `rmdir legacy`.

Confirmado: `legacy/` ya NO existe en disco.

## Cómo quedó .gitignore

Se eliminó el bloque:

```
# Ignorar dependencias y archivos sensibles del backend (legacy PHP)
legacy/backend-php/vendor/
legacy/backend-php/.env
```

El resto quedó intacto. Estado final del archivo:

```
# Ignorar dependencias del frontend
frontend-astro/node_modules/
frontend-astro/dist/

# Caché de vitest si se corre desde la raíz por error
/node_modules/

# Secrets locales (MCPs, integraciones)
.env
.env.local
.harness_init.log

# Archivos de sistema operativo
.DS_Store
Thumbs.db
```

Verificación: `grep -i legacy .gitignore` → sin coincidencias.

## git status

```
On branch feat/migrate-to-vercel
Your branch is up to date with 'origin/feat/migrate-to-vercel'.

Changes to be committed:
	deleted:    legacy/backend-php/.env.example
	deleted:    legacy/backend-php/.gitignore
	deleted:    legacy/backend-php/app/Controllers/TarotController.php
	deleted:    legacy/backend-php/composer.json
	deleted:    legacy/backend-php/composer.lock
	deleted:    legacy/backend-php/public/.htaccess
	deleted:    legacy/backend-php/public/index.php

Changes not staged for commit:
	modified:   .gitignore
	modified:   feature_list.json
	modified:   progress/current.md
```

## init.ps1

Verde / exit 0:
- Archivos base del arnés: todos OK.
- feature_list.json válido (13 features).
- Tests: 11 archivos, **63/63 pasan**.
- Resumen: "Entorno listo. Puedes empezar a trabajar."

## Pendiente (NO ejecutado por mí, lo hace el leader)

- `git commit` con referencia al tag `v0.1-php-final` en el mensaje.
- Marcar feature 12 como `done` tras review (sigue en `in_progress`).
