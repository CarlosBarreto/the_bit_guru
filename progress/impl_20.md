# impl_20 — redesign_page_practica (feature 20, Phase 3)

> Log de implementación del subagente implementer (workflow). Fecha 2026-06-09.
> NO marca `done` ni llama a reviewer: el orquestador revisa y cierra.

## Feature

- **id:** 20 — `redesign_page_practica`
- **title:** Phase 3 — Áreas de Práctica (`/practica`): ServiceCard + FrameworkDiagram
- **acento:** Burgundy (una sola familia de acento en la página)
- **status al iniciar:** `in_progress` (única in_progress; no fue necesario cambiarlo, ya venía así)

## Contexto leído

- `AGENTS.md`, `docs/architecture.md`, `docs/conventions.md`, `feature_list.json`, `progress/current.md`.
- `docs/design/redesign_advisory_spec.md` §§ PAGE-BY-PAGE (/practica), REQUIRED COMPONENTS
  (ServiceCard, FrameworkDiagram), VISUAL IDENTITY, LAYOUT, VOICE & COPY, HARD PROHIBITIONS,
  DESIGN TOKENS, CSS TOKEN SYSTEM, IMAGES & ILUSTRACIÓN, ACCESSIBILITY.
- Tokens en `frontend-astro/src/layouts/Layout.astro` (el remapeo `[data-accent="burgundy"]` ya existe).
- Primitivos reusados: `PageShell.astro` (prop `accent`), `EditorialHero.astro`, `SectionDivider.astro`,
  `Container.astro`, `Prose.astro`. Referencia de tarjeta editorial: `InsightCard.astro`.
  Referencia de SVG a una tinta no-facial: `PartnerBiographyBlock.astro`.
- Patrón de testing del repo (doble): Container API (`experimental_AstroContainer`) + lectura del
  source `.astro` con `readFileSync`. Espejados en `tests/pages/index.test.ts`,
  `tests/components/insight-card.test.ts`, `tests/components/page-shell.test.ts`.
- PERSONA §5 (temas) y §3–§4 (voz cínica-cómplice) para derivar las líneas de servicio y el copy.

## Cambios

### 1. `frontend-astro/src/components/ServiceCard.astro` (nuevo)
- `<article class="service-card">` con `<h3>` título serif (`--step-2`), `<p>` descripción deadpan
  (serif, `--measure`) y `<ul class="deliverables">` con `<li>` por entregable.
- Props: `title` (req), `description?`, `deliverables?: string[]` (cada bloque condicional;
  `deliverables` vacío también se omite).
- Borde hairline `1px solid var(--ink-rule)` + filete superior `border-top: 2px solid var(--accent)`.
  Marcador de entregable = filete corto de acento (no bullet redondo; estructura, no solo color).
- SIN sombra/glow/gradiente. Solo tokens. Alineado a la izquierda.

### 2. `frontend-astro/src/components/FrameworkDiagram.astro` (nuevo)
- `<figure>` + `<svg>` inline geométrico a DOS tintas estrictas (`--ink` + `--accent`).
- Columna izquierda: cajas hairline de áreas de práctica con etiqueta `<text>` real y filete de acento;
  conectores ortogonales en `--ink` hacia un nodo de convergencia (rombo `--accent`).
- Columna derecha: rejilla de 22 celdas (11×2) = "Marco · 22 dimensiones"; celdas rellenas de acento
  intercaladas (`i % 3 === 0`), resto hairline `--ink`.
- INFORMATIVO: `role="img"` + `aria-labelledby="framework-title framework-desc"` con `<title>`/`<desc>`.
- Props: `areas: string[]`, `dimensions = 22`. SIN gradiente, SIN sombra, SIN glow. Solo tokens.

### 3. `frontend-astro/src/pages/practica.astro` (nuevo)
- `<Layout title="Áreas de Práctica — Bit Gurú">` → `<PageShell accent="burgundy">` → `<Container>`.
- Bloques: `EditorialHero` (eyebrow "Áreas de Práctica" + H1 + deck) → `SectionDivider label="Líneas de
  Servicio"` + rejilla de 4 `ServiceCard` → `SectionDivider label="El Marco"` + párrafo intro + `FrameworkDiagram`.
- 4 líneas de servicio derivadas de PERSONA §5 con jerga de consultora (spec § VOICE & COPY):
  Diligencia Kármica · Optimización del Karma Operativo · Transformación Digital del Alma ·
  Gestión de Deuda Técnica Espiritual. Copy deadpan, registro usted, catchphrases canónicas
  ("Si llegó hasta aquí, ya sabe con quién trata."; "Y si eso le tranquiliza, créalo.").
- Una sola familia de acento (burgundy en `<main>`; nav/footer siguen Navy por estar fuera del `<main>`).

### 4. Tests (nuevos)
- `frontend-astro/tests/components/service-card.test.ts` — `<article>`, `<h3>`, descripción/entregables
  condicionales, conteo de `<li>`, sin `<img>`, source: borde hairline + filete de acento, sin hex/gradiente/glow.
- `frontend-astro/tests/components/framework-diagram.test.ts` (opcional) — SVG en `<figure>`, accesibilidad
  `role="img"` + title/desc, etiquetas de área, rejilla 22 dimensiones, dos tintas vía tokens, sin gradiente/sombra/img.
- `frontend-astro/tests/pages/practica.test.ts` — `data-accent="burgundy"` (única familia; un solo data-accent),
  un solo `<h1>`, 4 `<article>`, `<li>` de entregables, divisor "El Marco" + FrameworkDiagram, sin gradiente,
  sin `<img>`, orden de bloques; source: PageShell con accent burgundy, reuso de primitivos, líneas de servicio, title.

## Verificación

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1` → **verde**.
  - `feature_list.json` válido (26 features).
  - Test Files: 31 passed (31). Tests: 304 passed (304).
- `npm run build --prefix frontend-astro` → **verde** (output server, adapter @astrojs/vercel, "Complete!").

## Alcance respetado

- NO se tocó `Layout.astro`, `lib/` ni `pages/api/`.
- NO se modificó ningún otro componente/página existente.
- Solo archivos nuevos: 2 componentes + 1 página + 3 tests.
- Cero hex de marca en los nuevos archivos; sin gradiente/glow/dark mode/emoji/Tailwind CDN; todo a la izquierda.

## Pendiente (orquestador)

- Revisión y cierre (cambiar status 20 a `done`, mover resumen a history.md).
