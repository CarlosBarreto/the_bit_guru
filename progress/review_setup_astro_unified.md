# Review — feature 1 (setup_astro_unified)

**Veredicto:** APPROVED

Revisado por: reviewer · Fecha: 2026-05-29 · Branch: feat/migrate-to-vercel

## Acceptance (feature_list.json #1)

1. `astro.config.mjs` con `output: 'server'` + `@astrojs/vercel` — OK
   (`frontend-astro/astro.config.mjs:7-8`: `output: "server"`, `adapter: vercel()`).
2. `package.json` incluye `dev`/`build`/`preview`/`test`/`lint` — OK
   (`frontend-astro/package.json:6-12`: los 5 scripts presentes; `test` = `vitest run`, `lint` = `eslint .`).
3. `npm install --prefix frontend-astro` sin errores — OK
   (re-ejecutado en init.ps1 sin ERESOLVE; adapter pineado a `@astrojs/vercel@^9.0.5` por peer astro@^5, decisión correcta).
4. `npm run build --prefix frontend-astro` sin endpoints — OK
   (build exit 0, modo server + adapter Vercel; `frontend-astro/src/pages/api/` no existe).
5. `frontend-astro/tests/smoke.test.ts` existe y pasa — OK
   (`tests/smoke.test.ts`: 1 test verde).
6. `init.ps1` verde — OK (exit code 0, tests 1/1).

## Conformidad con docs/conventions.md

- Indentación 2 espacios: OK en astro.config.mjs, package.json, eslint.config.js, smoke.test.ts.
- Comillas dobles: OK.
- Semicolons: OK.
- Line endings LF: OK (0 bytes CR en los archivos creados/modificados; el warning de git "LF will be replaced by CRLF" proviene de core.autocrlf local, no del contenido — el working tree es LF).
- Archivo de test `*.test.ts`: OK.

## Arquitectura (docs/architecture.md)

- No se crearon endpoints (`pages/api/`) ni `lib/` — correcto, fuera de scope de feature 1.
- Páginas `.astro` preexistentes conservadas (index, zoltar, hoy, oraculo, mini-oraculo, quejas, sobre) — no borradas.
- Dependencias instaladas dentro de lo permitido: `astro`, `@astrojs/vercel`, `@google/genai`, `vitest`, `@types/node` + toolchain de lint (eslint, eslint-plugin-astro, typescript-eslint). Sin imports fuera de la lista.
- `.gitignore` añade `.vercel/` y secretos (`.env`, `.env.local`, `.harness_init.log`) — build no deja artefactos sin trackear.

## Checkpoints (CHECKPOINTS.md)

- C1: [x] (4 archivos base + 3 docs presentes; init.ps1 exit 0).
- C2: [x] (solo feature 1 en in_progress; current.md describe la sesión activa).
- C3: [x] (src/ no introduce módulos fuera de lo previsto; deps justificadas; sin debug/TODOs nuevos).
- C4: [x] para el alcance de feature 1 (no hay módulos en src/lib aún; smoke test verde; >0 tests; sin servicios externos sin mock).
- C5: [ ] parcial — pendiente al CIERRE de sesión, no del implementer:
        falta entrada en `progress/history.md` (la sesión sigue abierta).
        Sin artefactos sospechosos sin trackear (verificado).

## Observaciones menores (NO bloqueantes)

1. `frontend-astro/eslint.config.js:4` importa `globals` pero el paquete `globals`
   NO está declarado en `package.json` (solo presente como transitiva en package-lock).
   Debería declararse como devDependency explícita. No bloquea: `npm run lint` no es
   parte de la verificación canónica (init.ps1 corre solo `npm test`).
2. `npm run lint` deja 3 errores en scaffold preexistente
   (`src/pages/mini-oraculo.astro`, `src/pages/zoltar.astro`). Confirmado fuera de
   scope de feature 1 — esos archivos no fueron tocados. Deuda para otra feature.

## Cierre

Todos los criterios de acceptance de la feature 1 se cumplen, init.ps1 verde,
build verde sin endpoints, tests verdes, convenciones respetadas, scaffold
preexistente intacto. Se aprueba.

Al cerrar la sesión: registrar entrada en `progress/history.md` (C5) y marcar
feature 1 como `done` en `feature_list.json`.
