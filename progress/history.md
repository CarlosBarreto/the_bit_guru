# progress/history.md — Bitácora append-only

> Cada sesión cerrada deja aquí una entrada. No se edita el pasado, solo se
> añade al final.

---

<!--
Plantilla de entrada (copiar al cerrar sesión):

## YYYY-MM-DD — feature <id> <name>

- **Veredicto:** done | blocked
- **Resumen:** (1-3 líneas)
- **Archivos tocados:** lista breve
- **Notas para la próxima sesión:** (si las hay)

---
-->

## 2026-05-29 — feature 1 setup_astro_unified

- **Veredicto:** done
- **Resumen:** Astro habilitado en modo SSR (`output: 'server'`) con adapter `@astrojs/vercel` (pineado a `^9` por peer astro@^5); instaladas deps `@google/genai`, `vitest` + toolchain de lint; scripts npm `dev/build/preview/test/lint`. Build verde sin endpoints, smoke test verde, `init.ps1` exit 0. Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/astro.config.mjs`, `frontend-astro/package.json`, `frontend-astro/package-lock.json`, `frontend-astro/eslint.config.js`, `frontend-astro/tsconfig.json`, `frontend-astro/tests/smoke.test.ts`, `.gitignore`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 2 `lib_persona_and_tarot` (capa de dominio: `lib/persona.ts` + `lib/tarot.ts`). Deuda fuera de scope: `eslint.config.js` importa `globals` sin declararlo como devDependency explícita, y `npm run lint` deja 3 errores en scaffold preexistente (`mini-oraculo.astro`, `zoltar.astro`).
