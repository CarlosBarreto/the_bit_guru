# Review — feature 23 (`redesign_page_archivo`)

**Fecha:** 2026-06-11 · **Agente:** reviewer · **Baseline:** a9a8356 (38 files / 409 tests)
**Veredicto:** APPROVED

---

## Resumen

Feature 23 (Phase 4, `/archivo`, acento Burgundy) implementada como 6 archivos nuevos,
cero modificaciones a código existente. `init.ps1` verde (exit 0), 41 test files / 451
tests verdes (+3 files / +42 tests sobre baseline, exactamente lo reportado por el
implementer). Scope respetado, arquitectura y convenciones cumplidas, spec de `/archivo`
satisfecha. La brecha "CaseStudyCard inexistente" se verificó y la decisión del
implementer es correcta.

---

## Checkpoints

- **C1 — El arnés está completo:** [x]
  - 4 archivos base presentes (AGENTS.md, init.ps1, feature_list.json, progress/current.md). 3 docs presentes (architecture/conventions/verification). `init.ps1` termina en **exit 0** (verificado en PowerShell desde repo root).

- **C2 — El estado es coherente:** [x]
  - Una sola feature `in_progress` en feature_list.json: la 23 (línea 333). El otro match de `"in_progress"` es el enum del schema (línea 7), no un estado. Feature 23 NO se marcó `done` prematuramente (correcto: pendiente de esta review).
  - `progress/current.md` describe la sesión activa (no es basura de sesiones previas).

- **C3 — El código respeta la arquitectura:** [x]
  - `src/` solo gana 2 componentes + 1 página, todos en las carpetas previstas (`components/`, `pages/`). No se tocó `lib/`, `pages/api/` ni `Layout.astro` (spec ANCLAJE AL BACKEND + archivo CLAUDE.md respetados).
  - Cero dependencias externas nuevas. Sin logs/prints de debug ni TODOs sin contexto en los 3 fuentes.
  - Reuso real: `OutcomeMetricsTable` importa y compone `<MetricTable>` (no duplica la tabla); `EngagementCard` calca el patrón editorial canónico de `InsightCard` (borde hairline 1px `--ink-rule` + `border-top 2px --accent`, eyebrow mono, h3 serif `--step-2`).

- **C4 — La verificación es real:** [x]
  - Cada archivo nuevo tiene su test espejo: `outcome-metrics-table.test.ts` (14), `engagement-card.test.ts` (15), `archivo.test.ts` (13). Patrón doble del repo (Container API + readFileSync del source), checks escopados a `<style>` / HTML renderizado, igual que `service-card.test.ts` / `practica.test.ts`.
  - Tests sin servicios externos (UI estática, disclosure nativo sin JS).
  - `npm test` → 451 > 0, todos verdes.

- **C5 — La sesión se cerró bien:** [x] (en lo que toca al implementer)
  - Sin untracked sospechosos (cache/build/temp): los únicos untracked son los 6 archivos esperados + `impl_23.md`. `feature_list.json` y `current.md` modificados los posee el leader.
  - `history.md` + commit + flip a `done` quedan correctamente para el orquestador POST-aprobación (no es responsabilidad del implementer cerrarlos).

---

## Punto de escrutinio especial (CaseStudyCard)

- **(a) CaseStudyCard NO existe.** `grep -rl CaseStudyCard src/` solo hace match en el
  comentario de cabecera de `EngagementCard.astro`. No hay archivo `CaseStudyCard.astro`.
  La spec lo lista (REQUIRED COMPONENTS) y el plan lo cita como base, pero ninguna fase
  previa lo creó. **La decisión 1 del implementer es correcta:** modelar sobre el patrón
  editorial canónico y reportar la brecha, sin crear un componente nuevo (sería otra
  feature, fuera de alcance).
- **(b) Basarse en InsightCard es coherente.** Mismo borde hairline + filete superior de
  acento, mismo eyebrow mono (`--step--1`, `0.08em`, `--accent`), mismo h3 serif
  (`--step-2`, `line-height 1.2`, `--ink-deep`). No fija familia de acento (usa `--accent`).
  No rompe patrones.
- **(c) OutcomeMetricsTable REUSA MetricTable de verdad.** Importa `MetricTable` y lo
  renderiza con `<MetricTable .../>`; solo fija las 4 columnas canónicas + caption por
  defecto + envoltura `overflow-x`. Cero lógica de tabla duplicada. El `<th scope="row">`
  y la semántica de tabla los aporta MetricTable. Test lo fija.

## Spec `/archivo` (REQUIRED COMPONENTS + tokens + a11y)

- **Acento Burgundy único:** `<PageShell accent="burgundy">` → `<main data-accent="burgundy">`.
  nav/footer quedan Navy por estar FUERA del `<main>` (PageShell). Test verifica un único
  `data-accent` == burgundy. HARD PROHIBITION "una familia de acento" cumplida.
- **Tokens:** los 3 fuentes consumen solo `--accent*` / `--ink*` / `--paper*` / `--space*`
  / `--step*` / `--font*`. Cero hex de marca; cero `--burgundy/--olive/--forest` nombrados.
- **Accesibilidad del `<details>/<summary>`:** disclosure nativo sin JS, contenido estático
  en DOM vía slot; `<h3>` FUERA del `<summary>` (no aplana la jerarquía — test `iH3 < iSummary`);
  marcador `+`/`−` propio `aria-hidden` (el texto del summary comunica la acción); marker
  nativo oculto (`list-style:none` + `::-webkit-details-marker`); `:focus-visible` con
  `--accent`. El `−` es `\2212` inyectado por CSS `content` (no aparece en HTML renderizado).
- **NO duplica el disclaimer del Footer:** la frase "Resultados obtenidos en líneas temporales
  anteriores…" vive solo en `Footer.astro`; la página no la repite. Test escopa ≤1 ocurrencia.
- **Convenciones:** 2 espacios, comillas dobles en strings / simples en atributos Astro,
  PascalCase en componentes, kebab-case en tests, `*.test.ts` espejo. Copy en registro
  consultora (usted, deadpan), catchphrases canónicas, sin hype/emoji, todo a la izquierda.

## Verificación ejecutada

- `.\init.ps1` (PowerShell, repo root) → **exit 0**. feature_list válido (26 features).
  **41 test files / 451 tests, todos verdes.**
- `git diff --stat a9a8356` → solo feature_list.json + current.md trackeados (leader);
  los 6 archivos de la feature + impl_23.md untracked. Sin archivos fuera de scope.

## Cambios requeridos

Ninguno.

## Observaciones (no bloqueantes, para el orquestador)

1. La brecha **CaseStudyCard** queda abierta como deuda: la spec lo lista como componente
   propio y EngagementCard "variante de". Hoy no existe base que heredar. Si se quiere
   cerrar la spec al pie de la letra, vale una feature futura que extraiga el patrón
   editorial común (InsightCard/EngagementCard) a CaseStudyCard. No bloquea la 23.
2. Post-aprobación pendiente (orquestador): flip a `done` en feature_list.json, entrada en
   `history.md`, commit `feat:`. Correctamente NO hechos por el implementer.
