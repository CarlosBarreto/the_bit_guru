# Review — feature 19 (redesign_page_home)

**Veredicto:** APPROVED

**Fecha:** 2026-06-09 · **Agente:** reviewer (workflow) · **Ciclo:** 1
**Rama:** feat/migrate-to-vercel

## Alcance revisado

Archivos del alcance (coinciden con `files_changed` del log `impl_19.md`):

- `frontend-astro/src/components/PageShell.astro` — NUEVO (cascarón reusable).
- `frontend-astro/src/pages/index.astro` — REESCRITO (home, 4 bloques).
- `frontend-astro/tests/components/page-shell.test.ts` — NUEVO.
- `frontend-astro/tests/pages/index.test.ts` — NUEVO.
- `feature_list.json` (id 19 → in_progress), `progress/current.md`, `progress/impl_19.md`.

No se tocó `frontend-astro/src/lib/`, `frontend-astro/src/pages/api/` ni
`Layout.astro` (confirmado con `git diff --name-only HEAD` + `git ls-files --others`).
Sin archivos sin trackear sospechosos (cache/build).

## Acceptance de la feature 19 (feature_list.json)

1. "Exactamente esos 4 bloques en ese orden" — CUMPLE. `index.astro`:
   (1) Partner Letter = `EditorialHero` (L61-65) + carta en `<Prose>` (L67-94);
   (2) About = `SectionDivider label="Sobre la Firma"` (L97) + `<Prose>` (L98-107);
   (3) 3 Insights = `SectionDivider label="Memos Destacados"` (L110) + map de
   `InsightCard` (L112-122); (4) Principal Portrait =
   `SectionDivider label="El Socio Principal"` (L126) + `PartnerBiographyBlock`
   (L127-131). Sin secciones extra.
2. "Exactamente 3 InsightCard" — CUMPLE. `FEATURED_INSIGHTS` tiene 3 entradas
   (index.astro L31-53); el test cuenta exactamente 3 `<article>` (los únicos
   `<article>` del árbol los emite InsightCard).
3. "Registro consultora (usted, deadpan) y voz canónica" — CUMPLE. Trato de
   usted en toda la carta (L68-89), catchphrases canónicas: "Hoy las cartas
   indican que…" (L36), "Si llegó hasta aquí, ya sabe con quién trata." (L130),
   "y si eso le tranquiliza, créalo." (L88). Firma exacta del Socio Fundador
   (L91-92), idéntica a la de la spec § VOICE & COPY.
4. "Sin familia de acento (solo Navy); sin elemento prohibido" — CUMPLE.
   `<PageShell>` se abre sin prop `accent` (L57) → `<main>` sin `data-accent`
   → `--accent*` resuelve al default Navy de Layout.astro. Test verifica
   ausencia de `data-accent` en el render.
5. "tests/ valida 4 bloques y conteo de 3 insights" — CUMPLE. `index.test.ts`
   valida orden de los 4 bloques (markup y source) y conteo exacto de 3 article.
6. "init.ps1 verde y npm test pasa" — CUMPLE (ver Checkpoints).

## Verificaciones específicas solicitadas

- **Cero hex sueltos** — CUMPLE. `rg '#[0-9a-fA-F]{3,8}'` en `index.astro` y
  `PageShell.astro`: 0 coincidencias. Todo el CSS consume tokens
  (`--accent*`, `--ink*`, `--paper*`, `--space-*`, `--step-*`, `--font-*`,
  `--radius`, `--measure`).
- **Sin gradiente / glow / dark mode** — CUMPLE. Las únicas coincidencias de
  "gradient/glow/dark/box-shadow" son comentarios que afirman su ausencia.
- **Sin emoji / sin hype / sin exclamación** — CUMPLE. No hay `!` en copy ni UI;
  las flechas `→` aparecen solo en comentarios de cabecera, no en el render.
  Sin lenguaje marketinero.
- **Reuso de primitivos** — CUMPLE. Importa y reusa `Layout`, `EditorialHero`,
  `SectionDivider`, `Prose`, `InsightCard`, `PartnerBiographyBlock`,
  `Container` (features 14-18) y el nuevo `PageShell`. No reimplementa nada;
  firmas de props verificadas contra cada componente.
- **Retrato no-facial** — CUMPLE. `PartnerBiographyBlock` usa sello SVG a una
  tinta sin rostro (aria-hidden); no hay `<img>` ni `background-image`
  (verificado en el test).
- **Jerarquía editorial** — CUMPLE. Exactamente un `<h1>` (lo emite
  EditorialHero); InsightCard usa `<h3>`.
- **Estilo / convenciones** — CUMPLE. Indentación 2 espacios, comillas dobles
  en strings TS, line endings LF (no CRLF), nombres en inglés
  (`PageShell`, PascalCase componente; archivo .astro PascalCase como el resto
  de components/), espejo de ruta en tests (`tests/pages/index.test.ts`,
  `tests/components/page-shell.test.ts`).

## Checkpoints

- C1: [x] Arnés completo. init.ps1 verifica los 8 archivos base/docs y termina
  exit code 0.
- C2: [x] Estado coherente. Solo la feature 19 en `in_progress`; el resto
  `done`/`pending`. `progress/current.md` describe la sesión 19 activa.
- C3: [x] Arquitectura respetada. Cambios solo en `src/components/` y
  `src/pages/index.astro`; sin dependencias externas nuevas; sin logs de debug
  ni TODOs sin contexto. No se tocó `lib/`, `api/` ni `Layout.astro`.
- C4: [x] Verificación real. Cada módulo nuevo tiene su test espejo;
  `npm test` muestra 274 tests, todos verdes; no hay dependencia de servicios
  externos sin mock (el home es estático).
- C5: [x] Sesión sana. Sin archivos sin trackear sospechosos; la feature 19
  queda en su estado correcto (`in_progress`, pendiente de cierre por el
  orquestador). `progress/impl_19.md` documenta la sesión.

## Observaciones no bloqueantes (no afectan al veredicto de la feature 19)

1. `PageShell.astro` aplica `data-accent` en `<main>` y no en `<body>` como
   sugiere la spec § CSS TOKEN SYSTEM. Para el Inicio (Navy, sin `accent`) es
   irrelevante. Para páginas con familia de acento (features 20+), el remapeo
   sobre `<main>` deja `TopNavigation`/`Footer` (fuera del `<main>`) con el
   `--accent` Navy del `:root`. Conviene revisarlo al implementar la primera
   página con acento; no es un defecto del Inicio.
2. `PartnerBiographyBlock` (feature 18) declara el SVG con `role="img"` y
   `aria-hidden="true"` a la vez — redundancia menor heredada, fuera del
   alcance de esta feature.

## Cambios requeridos

Ninguno.
