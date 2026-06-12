# impl_18.md — Log de implementación · Feature 18 (redesign_editorial_components_b)

- **Fecha:** 2026-06-09
- **Agente:** implementer (workflow)
- **Feature:** 18 — redesign_editorial_components_b (Phase 2)
- **Estado al cierre:** done (pendiente revisión/cierre por el orquestador)

## Alcance entregado

Tres componentes editoriales reusables + sus tests espejo. No se tocaron páginas,
Nav, Footer, Hero, `lib/` ni `pages/api/`. Se reutilizaron los tokens de
`Layout.astro` y se siguió el patrón de los primitivos ya existentes
(`Container`, `Prose`, `SectionDivider`, `EditorialHero`, `PullQuote`).

### Componentes creados

1. **`frontend-astro/src/components/InsightCard.astro`**
   - `<article>` con borde hairline `1px var(--ink-rule)` + filete superior de
     acento (`border-top: 2px solid var(--accent)`), `--radius`, fondo
     `--paper-pure`. Sin sombra/glow.
   - Props: `eyebrow?`, `title` (req), `excerpt?`, `date?`, `href?`.
   - Eyebrow mono MAYÚSCULAS `--step--1` color `--accent`; título serif `--step-2`
     color `--ink-deep`; extracto serif `--ink`; fecha mono `--step--1`
     `--ink-muted`.
   - Si hay `href`, el título es enlace (`.title-link`) con subrayado (no solo
     color) y foco visible (`outline: 2px solid var(--accent)`).

2. **`frontend-astro/src/components/MetricTable.astro`**
   - Semántica de tabla REAL: `<table>` + `<caption>` opcional + `<thead>` con
     `<th scope="col">` por columna + `<tbody>` con `<th scope="row">` en la
     primera celda de cada fila y `<td class="value">` en el resto. Cero divs
     estructurales.
   - Props: `caption?`, `columns: string[]`, `rows: (string|number)[][]`.
   - Hairlines `1px var(--ink-rule)` + `border-collapse`; banda de encabezado
     `background: var(--ink-wash)`; valores numéricos en `--font-mono`
     (`tabular-nums`). Alineado a la izquierda.

3. **`frontend-astro/src/components/PartnerBiographyBlock.astro`**
   - Retrato NO-FACIAL: SVG inline a una tinta = silueta encapuchada SIN rostro
     + monograma "BG" tipo sello de informe, colores `var(--ink)` /
     `var(--accent)` / `var(--ink-rule)` sobre `var(--paper)`. `aria-hidden="true"`
     (decorativo); la identidad va como texto. CERO `<img>`, cero fotorrealismo.
   - Props: `name?` ("El Gurú de Bits"), `role?` ("Socio Fundador"), `bio?`
     (default canónico en registro consultora). La bio también acepta slot.
   - Dos columnas en desktop (`grid-template-columns: 120px 1fr`), apilado en
     móvil (`1fr`). Nombre serif `--step-2`; cargo mono MAYÚSCULAS `--accent`;
     bio serif a `--measure`.

### Tests creados (patrón doble del repo: Container API + lectura de source)

- `frontend-astro/tests/components/insight-card.test.ts` — 11 tests: `<article>`
  con título; eyebrow/excerpt/date/href condicionales; enlace de título con foco;
  borde hairline + filete; mono en fecha; sin hex/gradiente/glow.
- `frontend-astro/tests/components/metric-table.test.ts` — 9 tests: `<table>`,
  `<caption>` condicional, `<th scope="col">` por columna, `<th scope="row">` por
  fila, filas correctas, NO usa divs estructurales; hairlines, banda `--ink-wash`,
  números en mono; sin hex/gradiente/glow.
- `frontend-astro/tests/components/partner-biography.test.ts` — 9 tests:
  nombre/cargo (defaults y props), NO contiene `<img>`, SVG inline `aria-hidden`,
  slot; sello a una tinta sin rostro; dos columnas/apilado; cargo mono `--accent`;
  sin hex/gradiente/glow.

## Reglas de diseño verificadas

- Solo tokens (`--accent*`, `--ink*`, `--paper*`, `--space-*`, `--step-*`,
  `--measure`, `--radius`, `--font-*`). Cero hex de marca en el CSS de los 3
  componentes (asserted en tests).
- Sin gradiente, sin glow/box-shadow/text-shadow, sin dark mode, sin emoji, sin
  Tailwind CDN. Todo a la izquierda; prosa no centrada.
- Reusables: no fijan familia de acento; consumen `--accent` (lo fija la página
  vía `<body data-accent="...">`).
- Copy en registro consultora (usted, deadpan, español canónico).

## Incidencias y arreglos durante la sesión

1. **ENOSPC transitorio:** el disco C: llegó a 100% (0 bytes) durante la primera
   escritura de `metric-table.test.ts`, dejándolo vacío. El espacio se recuperó
   solo (otro proceso liberó ~17 GB). Se reescribió el archivo completo y se
   continuó. No fue un bloqueo definitivo.
2. **4 tests rojos en la primera corrida → arreglados:**
   - `PartnerBiographyBlock`: las aserciones `not.toContain("<img")` fallaban
     porque la cadena literal `<img` aparecía en comentarios (frontmatter y un
     comentario HTML del template que Astro conserva en el output). Arreglo:
     reescribir esos comentarios para no usar el literal `<img>` ("imagen
     rasterizada"). El componente nunca tuvo un elemento `<img>` real.
   - `MetricTable`: Astro inyecta atributos `data-astro-cid-*` en `<thead>`,
     `<tbody>`, `<tr>`, por lo que `toContain("<thead>")` y `/<tbody>...<\/tbody>/`
     no matcheaban. Arreglo: matchear la etiqueta de apertura
     (`/<thead[\s>]/`, `/<tbody[^>]*>/`, `/<tr[\s>]/`).

## Verificación final

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1` → VERDE.
  Test Files 26 passed (26), Tests 252 passed (252). "Entorno listo."
- `npm run build --prefix frontend-astro` → "Complete!" (server + client +
  adapter Vercel, sin errores).

## Archivos cambiados

- `frontend-astro/src/components/InsightCard.astro` (nuevo)
- `frontend-astro/src/components/MetricTable.astro` (nuevo)
- `frontend-astro/src/components/PartnerBiographyBlock.astro` (nuevo)
- `frontend-astro/tests/components/insight-card.test.ts` (nuevo)
- `frontend-astro/tests/components/metric-table.test.ts` (nuevo)
- `frontend-astro/tests/components/partner-biography.test.ts` (nuevo)
- `feature_list.json` (status feature 18: pending → in_progress)
- `progress/current.md` (encabezado de sesión)
- `progress/impl_18.md` (este log)
