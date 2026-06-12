# Review — feature 17 (redesign_editorial_components_a)

**Veredicto:** APPROVED

**Fecha:** 2026-06-09 · **Agente:** reviewer (workflow) · **Ciclo:** 1

## Resumen

Phase 2 — Componentes editoriales `EditorialHero.astro` + `PullQuote.astro` y sus
dos tests (`tests/components/editorial-hero.test.ts`, `pull-quote.test.ts`).
`init.ps1` verde: 223 tests pasan (23 test files). Sin tocar `lib/` ni `pages/api/`.

## Checkpoints

- C1: [x]  Arnés completo (4 base + 3 docs presentes); `init.ps1` exit 0.
- C2: [x]  Una sola feature `in_progress` (17, pending -> in_progress). `current.md`
            describe la sesión activa, sin basura previa.
- C3: [x]  Componentes en `src/components/` (módulo previsto). Cero deps externas
            nuevas. Sin logs de debug ni TODOs sueltos.
- C4: [x]  Cada componente tiene su test espejo en `tests/components/`. Sin
            servicios externos (render puro vía Container API + readFileSync).
            `npm test` muestra 223 tests, todos verdes.
- C5: [x]  Sin archivos sin trackear sospechosos (solo los 2 componentes, 2 tests,
            impl_17.md y los 2 cambios de estado). Estado de la feature coherente.
            (Nota: `progress/history.md` lo actualiza el orquestador al cerrar.)

## Acceptance de la feature 17

1. [x] `EditorialHero` acepta `eyebrow?`, `title`, `deck?`, `ctaLabel?`, `ctaHref?`;
       `text-align: left`, sin `background-image`/`url(`; CTA omitido del DOM sin
       `ctaHref` (EditorialHero.astro:13-37, 42-44).
2. [x] `PullQuote` cita serif con filete de acento a la izquierda
       (`border-left: 3px solid var(--accent)` + `padding-left`, PullQuote.astro:33-34).
3. [x] Solo tokens de la spec (`--accent*`/`--ink*`/`--paper*`/`--space-*`/`--step-*`/
       `--font-*`/`--radius`/`--measure`); jerarquía editorial (H1 serif display,
       eyebrow mono, deck serif). Cero hex sueltos (verificado por grep y por test).
4. [x] Tests validan render y props de ambos (patrón doble del repo, igual a
       layout-primitives.test.ts).
5. [x] `init.ps1` verde y `npm test` pasa (223/223).

## Reglas duras verificadas

- [x] Cero hex de marca en el CSS (grep + aserción `not.toMatch(/#[0-9a-f]{3,8}/)`).
      Los únicos matches de "gradiente"/"glow"/"dark"/"emoji" están en los comentarios
      de cabecera que DECLARAN las prohibiciones, no en CSS.
- [x] Sin gradiente, sin glow/box-shadow/text-shadow, sin dark mode, sin emoji.
- [x] Sin Tailwind por CDN.
- [x] Todo alineado a la izquierda; sin centrado de prosa.
- [x] `border-radius: var(--radius)` (<= 2px). Foco visible
      (`outline: 2px solid var(--accent); outline-offset: 2px`).
- [x] No fija familia de acento (usa `--accent`; lo remapea la página con `data-accent`).
      Reuso correcto de tokens existentes de `Layout.astro`.
- [x] Copy de ejemplo en registro consultora (usted, deadpan): catchphrases canónicas
      de la spec (VOICE & COPY) — "Asesoría estratégica para organizaciones que ya
      agotaron las soluciones racionales.", "Hoy las cartas indican que…", "Si llegó
      hasta aquí, ya sabe con quién trata.", firma "El Gurú de Bits — Socio Fundador".

## Convenciones

- [x] 2 espacios, comillas dobles en strings, semicolons.
- [x] Line endings: en el repo se almacenan como LF (`git show HEAD` -> 0 CR;
      `core.autocrlf=true` normaliza al commitear). El CRLF visible en el working tree
      de Windows es idéntico al de todos los archivos ya aprobados (Container.astro,
      Layout.astro, Nav.astro). No es un fallo introducido por esta feature.
- [x] Nombres PascalCase para componentes `.astro`; tests `*.test.ts` espejo de ruta.

## Cambios requeridos

(ninguno)
