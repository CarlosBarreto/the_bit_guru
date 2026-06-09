# impl_17.md — Log de implementación · Feature 17

- **Feature:** 17 — `redesign_editorial_components_a`
- **Título:** Phase 2 — Componentes editoriales: EditorialHero + PullQuote
- **Fecha:** 2026-06-08
- **Agente:** implementer (workflow)
- **Estado al cierre:** implementada y verde (revisión/cierre los hace el orquestador)

## Alcance ejecutado

Creados dos componentes reusables de presentación, consumiendo SOLO tokens de
`Layout.astro`. No se tocó `lib/` ni `pages/api/` ni se crearon páginas/Nav/Footer/tarjetas.

### Archivos creados

- `frontend-astro/src/components/EditorialHero.astro`
- `frontend-astro/src/components/PullQuote.astro`
- `frontend-astro/tests/components/editorial-hero.test.ts`
- `frontend-astro/tests/components/pull-quote.test.ts`

### Archivos modificados

- `feature_list.json` — feature 17 `pending` → `in_progress` (única in_progress).
- `progress/current.md` — encabezado de sesión + plan.

## Decisiones de diseño

### EditorialHero.astro
- `<section>` + `<h1>` semánticos, alineado a la IZQUIERDA, sin imagen de fondo.
- Props: `eyebrow?`, `title` (requerido), `deck?`, `ctaLabel?`, `ctaHref?`.
- Eyebrow: `--font-mono`, MAYÚSCULAS, `letter-spacing 0.08em`, `--step--1`, `color var(--accent)`. Omitido del DOM sin `eyebrow`.
- H1 display: `--font-serif`, `font-size: clamp(var(--step-4), 5vw, var(--step-5))`, `line-height 1.2`, `color var(--ink-deep)`.
- Deck: `--font-serif`, `--step-1`, `color var(--ink-muted)`, dentro de la medida `--measure`. Omitido sin `deck`.
- CTA: botón sobrio con `background var(--accent)`, `border-radius var(--radius)` (<= 2px), foco visible (`outline 2px solid var(--accent)` + `outline-offset 2px`), hover a `--accent-bright`. **Omitido del DOM si no hay `ctaHref`** (aunque venga `ctaLabel`).
- Reusable: NO fija familia de acento; usa `--accent` (lo fija la página con `data-accent`).

### PullQuote.astro
- `<blockquote>` + `<cite>` semánticos.
- Props: `quote` (requerido), `cite?`.
- Filete de acento a la IZQUIERDA: `border-left: 3px solid var(--accent)` + `padding-left: var(--space-5)`.
- Cita serif: `--font-serif`, `font-size: clamp(var(--step-2), 3vw, var(--step-3))`, `line-height 1.4`, `color var(--ink-deep)`.
- `<cite>`: `--font-sans`, `--step--1`, `color var(--ink-muted)`, `font-style: normal`. Omitido del DOM sin `cite`.
- Sobrio: sin comillas decorativas gigantes (sin pseudo-elementos `content:`).

## Reglas de diseño verificadas

- Solo tokens (`--accent*`, `--ink*`, `--paper*`, `--space-*`, `--step-*`, `--font-*`, `--radius`, `--measure`). Cero hex de marca en el CSS.
- Sin gradiente, sin glow/box-shadow/text-shadow, sin dark mode, sin emoji, sin Tailwind CDN.
- Todo a la izquierda; prosa no centrada.
- Copy de ejemplo en los tests en registro consultora (usted, deadpan): "Asesoría estratégica para organizaciones que ya agotaron las soluciones racionales.", "Hoy las cartas indican que…", "Si llegó hasta aquí, ya sabe con quién trata.", firma "El Gurú de Bits — Socio Fundador".

## Tests (patrón doble del repo)

Réplica del patrón de `tests/components/layout-primitives.test.ts`:
- Método 1 — `experimental_AstroContainer`: valida MARKUP (H1 con title + serif vía clase, eyebrow/deck/CTA presentes SOLO con sus props, CTA ausente sin `ctaHref`; `<blockquote>` con quote, `<cite>` solo con `cite`).
- Método 2 — `readFileSync` del source `.astro`: valida el `<style>` (familia serif, escala de display, filete `border-left 3px solid var(--accent)`, tokens, ausencia de hex/gradiente/glow). La auditoría de paleta se acota al bloque `<style>` (helper `styleBlock`) para no falsar por la palabra "gradiente" en los comentarios de cabecera.

### Incidencia resuelta (no fue rojo entregado)
Primera corrida: 2 tests rojos porque `not.toContain("gradient")` corría sobre TODO el
source y la cabecera de comentarios decía "sin gradiente". Arreglado acotando esas
aserciones al bloque `<style>` (intención real de la prohibición: CSS, no prosa).

## Verificación

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1` → **VERDE**. Tests: **223 passed (223)**, 23 test files.
- `npm run build --prefix frontend-astro` → **VERDE**. Build server + client completados, adapter `@astrojs/vercel`.

## Pendiente (orquestador)

- Revisión y, si aprueba: marcar feature 17 `done`, mover resumen a `progress/history.md`, commit.
