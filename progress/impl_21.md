# Informe de implementación — Feature 21: `redesign_page_metodologia`

- **Fecha:** 2026-06-09
- **Agente:** implementer
- **Plan seguido:** `~/.claude/plans/virtual-foraging-clock-agent-aea624b8a96b0e90a.md` (aprobado)
- **Estado:** implementado y verificado; pendiente de reviewer (NO marcado done)

---

## Archivos creados (6, cero modificaciones a código existente)

| Archivo | Qué es |
|---|---|
| `frontend-astro/src/components/WhitePaperLayout.astro` | Layout de documento largo: portada (código mono + H1 serif + deck + `<dl>` de metadatos), índice (`<nav aria-label="Índice">` con enlaces `#id` y números en mono/acento) y secciones numeradas (`<section id>` + `aria-labelledby`, número mono en `--accent`, nota al margen opcional como `<aside>`). El cuerpo de cada sección llega por slot nombrado dinámico resuelto con `await Astro.slots.render(section.id)` e inyectado con `set:html`. |
| `frontend-astro/src/components/TwoColorDiagram.astro` | Diagrama del marco completo: rejilla 11×2 con 22 celdas (rect hairline en `var(--ink)`, código romano en `--font-mono` fill `var(--accent)`, `<title>` por celda con el nombre canónico completo), línea de convergencia + rombo "DIAGNÓSTICO PRELIMINAR". `figure > svg role="img"` con `<title>/<desc>` accesibles (patrón FrameworkDiagram). Dentro del SVG solo existen `var(--ink)` y `var(--accent)`. |
| `frontend-astro/src/pages/metodologia.astro` | Página `/metodologia`: `Layout title="Metodología — Bit Gurú"` → `PageShell accent="forest"` → `Container` → `WhitePaperLayout`. Portada "El Marco de los 22 Arcanos™" (código BG/WP-001 · REV. 2, meta: Clasificación/Práctica/Autor/Vigencia). 5 secciones: Resumen ejecutivo, Fundamento metodológico, Las 22 dimensiones diagnósticas, El marco completo (con `TwoColorDiagram dimensions={ARCANOS}`), Limitaciones y descargos. |
| `frontend-astro/tests/components/white-paper-layout.test.ts` | 11 tests (Container API + source). |
| `frontend-astro/tests/components/two-color-diagram.test.ts` | 10 tests (Container API con `ARCANOS` real + source). |
| `frontend-astro/tests/pages/metodologia.test.ts` | 15 tests (Container API + source). |

Además: `progress/current.md` (bitácora de avance) y este informe. `feature_list.json` ya estaba `in_progress` (lo puso el leader); no se tocó.

## Decisiones de implementación

1. **Slots nombrados dinámicos confirmados.** El riesgo señalado en el plan (que `Astro.slots.render(id)` fallara bajo la Container API) NO se materializó: los slots se resuelven en el frontmatter con `Promise.all` y el primer test pasó a la primera. No se usó el fallback.
2. **Derivación del canon sin renombrar.** `DIMENSIONS = ARCANOS.map(...)` parte el string canónico en `code` (romano) y `name` con `split(" - ")`. Las 22 descripciones deadpan viven en `DIMENSION_NOTES`, keyed por el **string canónico literal completo** — el propio source es evidencia de que ningún arcano se renombró, y el test lo explota (busca cada clave literal).
3. **Orden canónico preservado.** Las dimensiones se presentan en el orden del array `ARCANOS` (incluye IX antes de V, etc.); no se reordenó nada.
4. **Dos tintas más estrictas que FrameworkDiagram.** Los fills/strokes van como atributos inline dentro del SVG (no vía clases CSS), para que el test pueda extraer el bloque `<svg>...</svg>` del source y asertar que TODOS los `var(--*)` que aparecen ahí son `--ink` o `--accent`. El `<style>` solo aporta tipografía (`--font-mono`) y layout del `figure` (tokens `--ink-rule`/`--paper`/`--radius`, fuera del SVG, igual que el marco de FrameworkDiagram).
5. **Checks de prohibiciones escopados como en feature 20.** El test de "sin gradiente/hex" se aplica a los bloques `<style>` y `<svg>`, no al source completo: los comentarios en español contienen la palabra "gradiente" (substring "gradient") y daban falso positivo. Es exactamente el mismo escopado que usa `framework-diagram.test.ts`.
6. **Voz.** Copy en español mexicano, registro de usted, deadpan consultora Tier-1 (PERSONA §4 + spec § VOICE & COPY): catchphrases adaptadas al registro institucional ("Hoy las cartas indican que…", "…y si eso le tranquiliza, créalo."), jerga de consultoría weaponizada en las 22 notas, descargos cínico-institucionales. Sin emojis (el `™` del H1 es glifo tipográfico, sancionado por la spec), sin hex sueltos, sin gradientes/glow, todo a la izquierda.
7. **Jerarquía de encabezados.** Un único `<h1>` (portada). `<h2>` para índice y secciones; `<h3>` para los nombres de las dimensiones dentro de la sección 3.

## Verificación de acceptance criteria

| AC | Cómo se verificó |
|---|---|
| `data-accent='forest'`; una sola familia | Test markup: `<main data-accent="forest">` presente y conteo total de `data-accent` en el documento == 1 (mismo criterio con el que se aprobó la feature 20: el atributo vive en el `<main>` de PageShell). Source: `<PageShell accent="forest">` y ausencia de `accent="burgundy"`/`accent="olive"`. |
| 22 arcanos desde `lib/tarot.ts`, sin renombrar | `metodologia.test.ts` y `two-color-diagram.test.ts` importan el `ARCANOS` real y verifican `toHaveLength(22)`; loop por las 22 entradas exige nombre canónico + `ARCANO <código>` en el HTML; el `<title>` de cada celda del SVG contiene el string canónico completo; las claves de `DIMENSION_NOTES` son los strings literales; conteo de `<li class="dimension">` == 22. |
| WhitePaperLayout (portada, secciones numeradas, índice) + TwoColorDiagram dos tintas | `white-paper-layout.test.ts`: portada (código, un `<h1>`, deck, `<dl>`), `<nav aria-label="Índice">` con `href="#id"`, números "1."/"2.", slot por sección en su `<section>`, `<aside>` condicional. `two-color-diagram.test.ts`: 22 celdas, códigos romanos como `<text>`, dos tintas estrictas en el SVG, sin gradiente/sombra/filtro/`<img>`. |
| No se modifica `lib/tarot.ts` ni endpoints | `git status`: solo 6 archivos nuevos + `progress/` (+ `feature_list.json` que ya venía tocado por el leader). Cero ediciones en `src/lib/`, `src/pages/api/`, `Layout.astro` o features done. |
| `tests/` valida las 22 dimensiones desde lib | Los dos tests citados importan `{ ARCANOS } from "../../src/lib/tarot"` y derivan las expectativas del array real (no de fixtures copiados). |
| `init.ps1` verde y `npm test` pasa | `.\init.ps1` final: **34 archivos, 340/340 tests** (baseline 304 + 36 nuevos: 11+10+15). `npm run build --prefix frontend-astro`: build Vercel completo sin errores. |

## Comandos de verificación ejecutados

1. `.\init.ps1` baseline → verde (304 tests).
2. `npx vitest run tests/components/white-paper-layout.test.ts` (desde `frontend-astro/`) → 11/11.
3. `npx vitest run tests/components/two-color-diagram.test.ts` → 10/10.
4. `npx vitest run tests/pages/metodologia.test.ts` → 15/15.
5. `.\init.ps1` final → verde (340 tests).
6. `npm run build --prefix frontend-astro` → verde.

Nota operativa para el reviewer: vitest debe correrse desde `frontend-astro/`; desde la raíz del repo el plugin de Astro no se aplica y los `.astro` no parsean.

## Pendiente (fuera de mi alcance)

- Review (reviewer → `progress/review_21.md`).
- Marcar `done` en `feature_list.json` + mover resumen a `history.md` (post-aprobación).
- Commit (no se hizo ninguno, por instrucción).
