# Informe de implementación — feature 1: setup_astro_unified

- **Fecha:** 2026-05-29
- **Agente:** implementer
- **Feature:** 1 — setup_astro_unified (Setup base Astro unified + Vitest + adapter Vercel)
- **Estado al cerrar:** implementada y autoverificada, `init.ps1` verde. Pendiente review.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `feature_list.json` | feature 1 → `status: "in_progress"` |
| `frontend-astro/astro.config.mjs` | `output: "server"` + `adapter: vercel()` (import de `@astrojs/vercel`) |
| `frontend-astro/package.json` | scripts añadidos: `test` (`vitest run`), `test:watch` (`vitest`), `lint` (`eslint .`); deps nuevas (ver abajo) |
| `frontend-astro/eslint.config.js` | **nuevo** — flat config ESLint: `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-astro` recommended + globals browser/node |
| `frontend-astro/tests/smoke.test.ts` | **nuevo** — test trivial Vitest (`1 + 1 === 2`) que pasa |
| `frontend-astro/.gitignore` | añadido `.vercel/` (output del adapter) |
| `progress/current.md` | sesión + plan + notas |

NO se tocó ningún archivo del scaffold preexistente (`src/pages/*.astro`, `src/layouts/`, `src/utils/api.js`) — fuera de scope.

## Dependencias instaladas (`npm install --prefix frontend-astro`)

- Runtime: `@astrojs/vercel@^9` (pineado), `@google/genai@^2`
- Dev: `vitest`, `@types/node`, `eslint`, `eslint-plugin-astro`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `typescript-eslint`, `@eslint/js`

### Decisión de versión del adapter

`@astrojs/vercel@10` (latest) exige `peer astro@^6.0.0`; el proyecto está en `astro@^5.13.5`, lo que produce `ERESOLVE`. Se pineó a `@astrojs/vercel@^9` cuyo peer es `astro@^5.0.0`. Compatible y sin `--force`/`--legacy-peer-deps`. `docs/architecture.md` lista `@astrojs/vercel` sin pin de versión, así que esto no contradice el doc.

## Comandos ejecutados y resultado

| Comando | Resultado |
|---|---|
| `npm install --prefix frontend-astro @astrojs/vercel@^9 @google/genai` | OK |
| `npm install --prefix frontend-astro --save-dev vitest @types/node eslint eslint-plugin-astro @typescript-eslint/* typescript-eslint @eslint/js` | OK |
| `npm install --prefix frontend-astro` (re-check) | OK, sin errores de resolución |
| `npm test --prefix frontend-astro` | 1 Test File / 1 test passed |
| `npm run build --prefix frontend-astro` | OK — `mode: "server"`, `adapter: @astrojs/vercel`, sin endpoints (no existe `src/pages/api/`). Build completo |
| `npm run lint --prefix frontend-astro` | exit 1 — ver nota de scope abajo |
| `init.ps1` (powershell.exe) | **exit 0 — verde**. Pasos 1-5 OK, tests verdes |

## Nota sobre lint (scope)

El script `lint` existe y la toolchain corre. Tras configurar globals browser/node en `eslint.config.js`, quedan **3 errores en archivos del scaffold preexistente**:

- `src/pages/mini-oraculo.astro` (2×): `buttonText is defined but never used`
- `src/pages/zoltar.astro`: parse error en bloque `<script>`/`</head>`

Estos archivos están **fuera del scope de la feature 1** (instrucción explícita: no migrar ni editar el scaffold). El acceptance de la feature 1 exige que `package.json` *incluya* el script `lint` (cumplido), no que el scaffold legacy esté lint-clean. La verificación canónica (`init.ps1` / `docs/verification.md`) corre `npm test`, no `npm run lint`. La deuda de lint del scaffold corresponde a otra feature/scope.

## Verificación de acceptance (feature 1)

1. `astro.config.mjs` declara `output: 'server'` + `@astrojs/vercel` — OK
2. `package.json` incluye `dev`/`build`/`preview`/`test`/`lint` — OK
3. `npm install --prefix frontend-astro` sin errores — OK
4. `npm run build` genera output sin endpoints (no se creó `src/pages/api/`) — OK
5. Existe `tests/smoke.test.ts` con test trivial que pasa — OK
6. `init.ps1` termina verde (exit 0) — OK
