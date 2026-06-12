# impl_26a_cleanup.md — Informe sub-tarea A (LIMPIEZA) de feature #26

> Agente: `implementer`. Fecha: 2026-06-11.
> Alcance: SOLO limpieza de UI neón obsoleta. Las auditorías a11y/motion/palette
> son la sub-tarea B (NO ejecutadas aquí).

## Resultado

**done** — 17 archivos borrados con `git rm` (staged limpio), sin referencias
colgantes, init.ps1 exit 0 con todos los tests verdes, build verde.
Feature #26 permanece `in_progress` (no la cambié a done).

## Archivos borrados (17, todos huérfanos)

Páginas neón (6):
- `frontend-astro/src/pages/hoy.astro`
- `frontend-astro/src/pages/mini-oraculo.astro`
- `frontend-astro/src/pages/oraculo.astro`
- `frontend-astro/src/pages/quejas.astro`
- `frontend-astro/src/pages/sobre.astro`
- `frontend-astro/src/pages/zoltar.astro`

Componentes neón (5):
- `frontend-astro/src/components/Hero.astro`
- `frontend-astro/src/components/TarotSection.astro`
- `frontend-astro/src/components/Consulta.astro`
- `frontend-astro/src/components/Sabiduria.astro`
- `frontend-astro/src/components/Nav.astro`

Tests de esos componentes (5):
- `frontend-astro/tests/components/Hero.test.ts`
- `frontend-astro/tests/components/TarotSection.test.ts`
- `frontend-astro/tests/components/Consulta.test.ts`
- `frontend-astro/tests/components/Sabiduria.test.ts`
- `frontend-astro/tests/components/Nav.test.ts`

Util huérfano (1):
- `frontend-astro/src/utils/api.js`

Todos quedaron staged como `D ` (deleted en el index) vía `git rm`. No se usó
`Remove-Item` suelto.

## Búsqueda de referencias colgantes

### Antes de borrar (baseline)

- Imports de `(Hero|TarotSection|Consulta|Sabiduria|Nav).astro`: las únicas
  referencias estaban DENTRO de los propios componentes neón y de sus propios
  tests neón (todos en la lista de borrado). Los matches de `EditorialHero.astro`
  son un componente DISTINTO (conservado, feature 17) — no afectado, fue ruido
  del patrón de búsqueda.
- Imports de `utils/api.js`: SOLO en `zoltar/oraculo/mini-oraculo/hoy.astro`
  (las 4 se borran). Cero importadores conservados.
- Links `/hoy /mini-oraculo /oraculo /quejas /sobre /zoltar`: único href era
  `/oraculo` dentro de `sobre.astro` (también borrado).

### Tests conservados (zona de riesgo — revisados explícitamente)

- `tests/smoke.test.ts`: cero referencias neón.
- `tests/components/foundation.test.ts`: las palabras `Hero/Nav/...` aparecen
  SOLO en comentarios que explican los dos métodos de testeo (markup vs source).
  Sus imports reales son únicamente `vitest`, `astro/container`, `node:fs`,
  `node:url` y `Layout.astro` (conservado). **No hubo asserts de componente
  muerto que quitar** — no fue necesario editar ningún test conservado.
- `Footer.test.ts` / `TopNavigation.test.ts`: no aparecieron en ninguna
  búsqueda de referencias neón.

### Después de borrar (confirmación)

Re-búsqueda en todo `frontend-astro` (src + tests) de imports a componentes
borrados, `utils/api` y rutas neón: **No matches found**. Cero referencias
colgantes.

**Conclusión: ninguna referencia colgante. No se requirió ningún workaround
ni edición de archivo conservado. No hubo bloqueo.**

## Conteo de tests antes/después

- Archivos de test: 44 → **39** (bajaron los 5 tests de componentes neón
  borrados). ✔ coincide con lo esperado por el leader.
- Tests: baseline declarada por el leader = 508; conteo real post-borrado =
  **471 passed**. La diferencia frente al estimado del leader (~503) es una
  discrepancia de la cifra-baseline estimada, NO una regresión: cero tests
  rojos, cero archivos rotos. Los 471 corresponden a los 39 archivos
  conservados ejecutándose verdes. (Nota: no medí el conteo exacto pre-borrado;
  el delta de archivos -5 es exacto y los tests eliminados eran solo de los 5
  componentes neón.)

## init.ps1

```
-- 4. Ejecutando tests --
 Test Files  39 passed (39)
      Tests  471 passed (471)
[OK] Todos los tests pasan
[OK] Entorno listo.
EXIT_CODE=0
```

Exit 0. Validó también: 8 archivos base del arnés presentes, feature_list.json
válido (26 features). Sin rojos, sin archivos rotos.

## Build (npm run build --prefix frontend-astro)

```
[build] output: "server"  mode: "server"  adapter: @astrojs/vercel
[vite] ✓ built (server entrypoints)
prerendering static routes ✓
[@astrojs/vercel] Bundling function entry.mjs ✓
[build] Complete!
EXIT_CODE=0
```

Verde. Server + adapter Vercel sin errores de import faltante.

## git status (estado al cierre)

17 archivos como `D ` (deleted, staged). `feature_list.json` y
`progress/current.md` aparecen como ` M` (modificados, NO staged por mí) —
preexistentes a mi trabajo; no los toqué. Feature #26 sigue `in_progress`.

## Deuda / observaciones

- **Feature #26 NO marcada `done`** (correcto: solo se completó la mitad —
  la sub-tarea B de auditorías a11y/motion/palette queda pendiente).
- **Site map vigente intacto**: no se tocó ninguna de las 7 páginas conservadas
  (`index, practica, metodologia, memos, archivo, la-firma, admision`) ni los 7
  endpoints `src/pages/api/*`, ni componentes editoriales/primitivos, ni
  `utils/{memos-client.ts, admision-client.ts}`, ni `layouts/Layout.astro`.
- **Recuperación**: la UI neón es recuperable desde el tag `v0.2-mystic-cyber`
  creado por el leader; el borrado es seguro.
- El commit del borrado lo hará el leader/cierre de feature (no commiteé;
  solo dejé el index staged limpio).
