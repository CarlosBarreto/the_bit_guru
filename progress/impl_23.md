# Informe de implementación — Feature 23: `redesign_page_archivo`

- **Fecha:** 2026-06-11
- **Agente:** implementer
- **Feature:** 23 — Phase 4, Archivo de Compromisos (`/archivo`): EngagementCard + OutcomeMetricsTable (acento Burgundy)
- **Estado:** implementado y verificado; pendiente de reviewer (NO marcado `done`, sin commits)
- **Baseline:** commit a9a8356 — 38 test files / 409 tests verdes.

---

## Archivos creados (6, cero modificaciones a código existente)

| Archivo | Qué es |
|---|---|
| `frontend-astro/src/components/OutcomeMetricsTable.astro` | Wrapper temático DELGADO sobre `MetricTable` (REUSO, no duplica la tabla). Fija las 4 columnas canónicas (`Indicador / Línea base / Resultado / Variación`, exportadas como `OUTCOME_COLUMNS`), un `caption` deadpan por defecto (`DEFAULT_OUTCOME_CAPTION`, sustituible por prop pero no eliminable), y envuelve la tabla en un `<div class="outcome-metrics-table">` con `overflow-x: auto` para que no rompa el ancho dentro de una tarjeta angosta. El caller pasa SOLO `rows` ([indicador, líneaBase, resultado, variación]); `MetricTable` pone el `<th scope="row">` de la primera celda. No fija familia de acento. |
| `frontend-astro/src/components/EngagementCard.astro` | Variante de la tarjeta editorial (familia InsightCard/CaseStudyCard): sector ficticio (eyebrow mono `--accent`), título de caso serif (`<h3>` `--step-2`), métrica destacada (valor mono `--step-3` `--accent-deep` + etiqueta sans `--ink-muted`). Cada caso "abre a" su tabla vía `<details>/<summary>` NATIVO — sin JS, contenido estático en el DOM (`<slot/>`), accesible. El encabezado del caso (eyebrow+h3+métrica) va FUERA del `<summary>` para no aplanar el `<h3>`. Summary = "Resultados del compromiso" (sustituible). Marcador nativo reemplazado: `list-style:none` + `::-webkit-details-marker{display:none}` + indicador `+`/`−` propio `aria-hidden` (el texto del summary comunica la acción). `focus-visible` con `--accent`. Borde hairline + filete superior de acento. No fija familia de acento. |
| `frontend-astro/src/pages/archivo.astro` | Página `/archivo`: `Layout title="Archivo de Compromisos — Bit Gurú"` → `PageShell accent="burgundy"` → `Container` → EditorialHero + SectionDivider "Casos Seleccionados" + nota de registro (`Prose as="section"`) + rejilla 2-col de 4 EngagementCard, cada una con su OutcomeMetricsTable (datos estáticos). 4 sectores absurdos derivados de PERSONA §5 + ejemplos de la spec ("Una DAO en duelo", "Un fondo de inversión poseído", "Una startup de bienestar laboral", "Un unicornio de IA generativa"). Copy deadpan, registro usted, catchphrases canónicas. NO duplica el disclaimer del Footer. |
| `frontend-astro/tests/components/outcome-metrics-table.test.ts` | 14 tests (Container API + source). |
| `frontend-astro/tests/components/engagement-card.test.ts` | 15 tests (Container API + source). |
| `frontend-astro/tests/pages/archivo.test.ts` | 13 tests (Container API + source). |

Además: este informe. `feature_list.json` ya estaba `in_progress` (lo dejó el leader); no se tocó.

## Decisiones de implementación

1. **`CaseStudyCard` no existe como componente.** El task lo nombra como base de reuso y la spec lo lista, pero nunca se creó en fases previas (solo `InsightCard`/`ServiceCard`/`MemoCard`). EngagementCard se modela sobre el **patrón de tarjeta editorial canónico** (InsightCard): mismo borde hairline + filete superior de acento, eyebrow mono, h3 serif. Se reporta esta brecha al reviewer; no se creó CaseStudyCard (sería una segunda feature → fuera de alcance).
2. **OutcomeMetricsTable es un wrapper, no una tabla nueva.** REUSA `MetricTable` (que ya cumple `<caption>`/`<th scope>`/semántica real). El wrapper solo fija las 4 columnas fijas y el caption por defecto, y añade el `overflow-x`. Cero duplicación de la lógica de tabla. Test lo fija (`import MetricTable` + `<MetricTable` presentes en el source).
3. **Disclosure NATIVO sin JS.** `<details>/<summary>` con el contenido (la tabla) estático en el DOM vía slot. Funciona sin scripts y es accesible por defecto. El `<h3>` queda FUERA del summary (test verifica `iH3 < iSummary` y que el summary no contiene `<h3>`).
4. **Marcador accesible.** El triángulo del UA se oculta (`list-style:none` + `::-webkit-details-marker`), y se pinta un `+`/`−` propio en `--accent` que es `aria-hidden`. El texto "Resultados del compromiso" es lo que anuncia el lector de pantalla. `−` es el signo menos tipográfico (`\2212`) inyectado por CSS (`content`), así que no aparece en el HTML renderizado — el check de prohibiciones de la página no lo ve.
5. **`as const` rompía el transform de Astro.** `OUTCOME_COLUMNS = [...] as const` sobre array multilínea provocó `Expected ";" but found "const"` en esbuild. Se cambió a `: string[]` explícito. (Único tropiezo; resuelto sin workaround sucio.)
6. **No duplicar el disclaimer del Footer.** El Footer ya pone "Resultados obtenidos en líneas temporales anteriores no garantizan…". La página NO repite esa frase en su copy; un test escopa que la frase aparezca ≤1 vez en el documento renderizado (el Footer la aporta una sola vez).
7. **Checks de prohibiciones escopados (regla del repo).** En componentes: hex/gradiente/glow auditados sobre el bloque `<style>` extraído (no sobre comentarios de cabecera). En la página: sobre el HTML renderizado (`gradient`/`box-shadow`/`text-shadow`/`<img>`/`background-image` ausentes; el `−` CSS no se renderiza).
8. **Una sola familia de acento.** burgundy vive en `<main data-accent="burgundy">` vía PageShell; nav/footer siguen Navy por estar fuera del `<main>`. Test: único `data-accent` del documento == burgundy; los dos componentes nuevos no nombran `--burgundy`/`--olive`/`--forest`, solo `--accent*`.
9. **Contenido en-character, sin placeholder muerto.** Las 4 fichas son casos editoriales de la firma con cifras secas (líneas base vs. resultado vs. variación), sectores absurdos y copy deadpan en registro usted. Cero lorem, cero hype.

## Verificación

- **`.\init.ps1` desde repo root → verde.** feature_list.json válido (26 features). **Test Files: 41 passed (41). Tests: 451 passed (451).**
- **`npm run build --prefix frontend-astro` → verde** (output server, adapter @astrojs/vercel, "Complete!"). archivo.astro entra en el bundle sin script de cliente (disclosure nativo, cero JS de página).
- Corrida focalizada de los 3 nuevos archivos: 42/42 verdes.

### Conteo y deltas vs baseline

| | Baseline (a9a8356) | Final | Delta |
|---|---|---|---|
| Test files | 38 | 41 | +3 |
| Tests | 409 | 451 | +42 |

(14 OutcomeMetricsTable + 15 EngagementCard + 13 archivo = 42.)

## Alcance respetado

- NO se tocó `Layout.astro`, `lib/`, `pages/api/`, ni ningún componente/página existente.
- NO se modificó `MetricTable` (se reusa tal cual).
- Solo archivos nuevos: 2 componentes + 1 página + 3 tests.
- Cero hex de marca en los nuevos archivos; sin gradiente/glow/dark mode/emoji/Tailwind CDN; todo a la izquierda.

## Pendiente (orquestador / reviewer)

- Review (reviewer → `progress/review_23.md`). Punto de atención: CaseStudyCard inexistente (decisión 1).
- Marcar `done` en `feature_list.json` + mover resumen a `history.md` (post-aprobación).
- Commit (no se hizo ninguno, por instrucción).
