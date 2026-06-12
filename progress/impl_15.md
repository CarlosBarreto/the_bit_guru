# impl_15.md — Log de implementación · feature 15 (redesign_layout_primitives)

> Phase 1 del rediseño (spec § LAYOUT / TYPOGRAPHY). Primitivos de layout
> editorial reusables + sus tests. Alcance acotado: SOLO primitivos en
> `frontend-astro/src/components/` y tests en `frontend-astro/tests/components/`.
> No se tocó Nav/Footer/Hero/páginas, ni `lib/`, ni `pages/api/` (features 16–26).

---

## Contexto leído

- `AGENTS.md`, `docs/architecture.md`, `docs/conventions.md`.
- `docs/design/redesign_advisory_spec.md` § LAYOUT (líneas 238–258) y § TYPOGRAPHY
  (líneas 201–234), más HARD PROHIBITIONS (líneas 79–97).
- `frontend-astro/src/layouts/Layout.astro` (feature 14, done): tabla canónica de
  tokens — consumida por los primitivos vía `var(--...)`.
- Patrón de testing existente: `tests/components/foundation.test.ts`,
  `tests/components/Nav.test.ts` y `tests/layouts/layout-tokens.test.ts`.

## Decisión sobre el mecanismo de test (replicado, no inventado)

El repo ya usa un patrón doble para componentes `.astro`:

1. **Método 1 — Container API** (`experimental_AstroContainer` de `astro/container`):
   renderiza el MARKUP y se assertea sobre el HTML (slots, props, estructura, role).
2. **Método 2 — `readFileSync` del SOURCE**: el contenido de `<style>` NO aparece
   en `renderToString` (el pipeline de Astro lo extrae a CSS aparte), así que el
   contrato de tokens / CSS (filete, eyebrow, ausencia de hex/gradiente/glow) se
   valida leyendo el código fuente del `.astro`.

`layout-primitives.test.ts` usa exactamente ese patrón doble. No se introdujo
ningún mecanismo nuevo.

## Archivos creados

### `frontend-astro/src/components/Container.astro`
- Rejilla `grid-template-columns: repeat(12, 1fr)` (12 columnas).
- `max-width: 1200px` + `margin-inline: auto` (centrado del bloque en el viewport;
  el contenido interior se mantiene a la izquierda con `text-align: left`).
- Gutter de la escala: `column-gap`/`row-gap: var(--space-5)` (24px).
- Márgenes laterales de la escala: `padding-inline: var(--space-7)`, con
  `var(--space-6)` en tablet (≤1023px) y `var(--space-5)` en móvil (≤640px), donde
  además colapsa a 1 columna (spec § LAYOUT breakpoints).
- Props: `as` (etiqueta semántica, default `div`) y `class` (clase extra). Acepta `<slot/>`.

### `frontend-astro/src/components/Prose.astro`
- Wrapper de medida de lectura: `max-width: var(--measure)` (68ch), alineado a la
  IZQUIERDA (`text-align: left`, sin `center`), `line-height: 1.6` (cuerpo),
  `font-family: var(--font-serif)` (prosa larga → serif, spec § TYPOGRAPHY).
- `margin-inline: 0` (no centrado). Resetea margin del primer/último hijo.
- Props: `as` (default `div`) y `class`. Acepta `<slot/>`.

### `frontend-astro/src/components/SectionDivider.astro`
- Filete: `border-top: 1px solid var(--ink-rule)`, alineado a la izquierda.
- Eyebrow OPCIONAL (prop `label: string`): `var(--font-mono)`, `text-transform:
  uppercase`, `letter-spacing: 0.08em`, `font-size: var(--step--1)`,
  `color: var(--accent)`. Cuando no hay `label`, el `<span class="eyebrow">` se
  omite del DOM (`{label && ...}`).
- `role="separator"` para semántica accesible del divisor.

### `frontend-astro/tests/components/layout-primitives.test.ts`
- Container (markup): slot renderiza, clase `container`, default `<div>`, prop `as`
  cambia a `<section>`, prop `class` añade clase extra.
- Container (source): rejilla 12-col, max-width 1200px centrado, gutter `--space-5`,
  márgenes `--space-*`; sin hex sueltos, sin gradiente, sin `box-shadow`, sin Tailwind CDN.
- Prose (markup): slot renderiza, clase `prose`. (source): `max-width: var(--measure)`,
  izquierda (no centrado), `line-height: 1.6`, `font-serif`.
- SectionDivider (markup): sin label → filete con `role="separator"` y SIN eyebrow;
  con label → eyebrow con el texto y `class="eyebrow"`.
- SectionDivider (source): filete `1px solid var(--ink-rule)`; eyebrow en mono,
  uppercase, `0.08em`, `--step--1`, `--accent`; izquierda; sin hex/gradiente/glow.

## Cumplimiento de reglas de diseño (spec § LAYOUT + HARD PROHIBITIONS)

- Consume SOLO `--space-*`, `--measure`, `--ink-rule`, `--accent`, `--ink`,
  `--font-mono`, `--font-serif`, `--step--1`, `--step-0`. Cero hex de marca
  (verificado por test con regex `#[0-9a-f]{3,8}`).
- Sin gradiente, sin `box-shadow`/glow, sin dark mode.
- Radii: ninguno definido en los primitivos (≤ `--radius` = 2px se respeta trivialmente).
- Todo a la izquierda; la prosa no se centra.
- Los primitivos NO fijan familia de acento: usan `--accent` (por defecto Navy en
  `Layout.astro`), que cada página remapeará vía `<body data-accent="...">`.

## Verificación

- **Comando canónico:** `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1`
  → VERDE. `Test Files 20 passed (20)`, `Tests 190 passed (190)`.
  (`powershell.exe` disponible en este entorno; no se usó el fallback.)
- **Build:** `npm run build --prefix frontend-astro` → `Complete!` (server + client,
  adapter Vercel OK).

## Resultado

- `tests_green = true`
- `build_green = true`
- Sin tocar nada fuera del alcance. Listo para revisión por el reviewer (no se
  marca `done` ni se mueve a history desde esta sesión de implementer).
