# Review — feature 20 (redesign_page_practica)

> Revisor (reviewer, workflow). Fecha 2026-06-09. Ciclo 1.
> Veredicto sobre el trabajo del implementer descrito en `progress/impl_20.md`.

**Veredicto:** APPROVED

## Archivos revisados (files_changed)

- `frontend-astro/src/components/ServiceCard.astro` (nuevo)
- `frontend-astro/src/components/FrameworkDiagram.astro` (nuevo)
- `frontend-astro/src/pages/practica.astro` (nuevo)
- `frontend-astro/tests/components/service-card.test.ts` (nuevo)
- `frontend-astro/tests/components/framework-diagram.test.ts` (nuevo)
- `frontend-astro/tests/pages/practica.test.ts` (nuevo)

`git status` confirma que los 6 archivos son los únicos untracked de código,
más `feature_list.json` y `progress/current.md` (esperados). NO se tocó
`frontend-astro/src/lib/` ni `frontend-astro/src/pages/api/`
(`git diff --name-only HEAD` sobre ambas rutas: vacío).

## Checkpoints

- C1: [x] Arnés completo. init.ps1 valida los 4 archivos base + 3 docs y termina exit 0.
- C2: [x] Estado coherente. Solo la feature 20 en `in_progress`; el implementer NO la marcó `done` (correcto: lo hace el orquestador al cerrar). `current.md` describe la sesión activa, sin basura.
- C3: [x] Arquitectura respetada. Solo componentes/páginas en `src/components` y `src/pages` (espejo previsto). Sin dependencias externas nuevas. Sin logs/prints de debug ni TODOs sin contexto. Cero hex sueltos en los 3 archivos (no solo en `<style>`).
- C4: [x] Verificación real. Cada módulo nuevo tiene su test espejo en `tests/`. `npm test --prefix frontend-astro`: 31 test files / 304 tests, todos verdes. Tests usan Container API + lectura de source (sin servicios externos).
- C5: [x] Cierre de sesión sano en lo que toca al implementer. Sin archivos untracked sospechosos (caches/builds). La entrada de `history.md` la añade el orquestador al cerrar (flujo correcto: append-only, el implementer no la escribe).

## Acceptance de la feature 20 (feature_list.json)

1. `data-accent='burgundy'; una sola familia de acento` — [x]
   - El acento se aplica en `<main data-accent="burgundy">` vía `PageShell accent="burgundy"`
     (practica.astro:79). El acceptance dice literalmente `body`, pero el remapeo en `<main>`
     es el patrón canónico del repo, establecido en la feature 19 (home, ya `done`) y en
     `PageShell.astro`. La regla de mayor rango de la spec (HARD PROHIBITIONS: "no más de una
     familia de acento por página") se cumple: el test verifica que existe EXACTAMENTE un
     `data-accent` y que es `burgundy` (practica.test.ts:32-38); nav/footer quedan fuera del
     `<main>` y usan Navy neutro. NO bloqueante.
2. `ServiceCard lista líneas de servicio con descripción deadpan y entregables` — [x]
   `<article>` + `<h3>` serif (--step-2) + `<p class="description">` + `<ul>/<li>` de entregables;
   4 líneas de servicio derivadas de PERSONA §5 con jerga de consultora (practica.astro:32-73).
3. `FrameworkDiagram geométrico a dos colores, sin gradiente ni sombra` — [x]
   SVG inline a dos tintas estrictas (`var(--ink)` + `var(--accent)`); sin gradiente, sin
   box-shadow/drop-shadow/filter (verificado en source y en render). `role="img"` +
   `<title>`/`<desc>` vinculados con aria-labelledby (FrameworkDiagram.astro:65-80).
4. `Solo tokens de la spec; WCAG AA` — [x]
   Cero hex en los 3 archivos (grep `#[0-9a-fA-F]{3,8}`: sin coincidencias). Solo `--accent*`,
   `--ink*`, `--paper*`, `--space-*`, `--step-*`, `--font-*`, `--radius`, `--measure`. Foco/landmarks
   los aporta PageShell (skip-link, `<main>`). El acento solo porta estructura (filetes/marcador),
   no texto; los textos van en --ink/--ink-deep/--ink-muted (AA sobre paper y sobre paper-pure).
   Marcador de entregable no depende solo del color (filete + sangrado estructural).
5. `tests/ valida render de la página y de ServiceCard` — [x]
   `practica.test.ts` (markup: burgundy único, un solo `<h1>`, 4 `<article>`, `<li>`, divisor
   "El Marco" + diagrama, orden de bloques, sin `<img>`, sin gradiente; source: PageShell burgundy,
   reuso de primitivos, líneas de servicio, title) + `service-card.test.ts` + `framework-diagram.test.ts`.
6. `init.ps1 verde y npm test pasa` — [x] 31 test files / 304 tests verdes.

## Prohibiciones duras (spec § HARD PROHIBITIONS) — verificadas

- Sin gradiente / glow / box-shadow / text-shadow / drop-shadow: solo aparecen en comentarios
  negativos ("Sin gradiente, sin glow…"). [x]
- Sin dark mode / prefers-color-scheme. [x]
- Sin emoji (scan de rangos Unicode: sin coincidencias). [x]
- Sin hype marketinero ("revolucionario", "disruptivo", "potencia tu…"): copy deadpan en
  registro consultora. [x]
- Cero hex de marca fuera de tokens. [x]
- Registro consultora en el copy: trato de usted, jerga weaponizada (pasivo espiritual,
  diligencia kármica, stakeholders cósmicos, deuda técnica espiritual), catchphrases canónicas
  adaptadas ("Si llegó hasta aquí, ya sabe con quién trata."; "Y si eso le tranquiliza, créalo."). [x]
- Reuso de primitivos existentes (PageShell, EditorialHero, SectionDivider, Container), sin
  reimplementarlos. [x]

## Convenciones (docs/conventions.md)

- 2 espacios, sin tabs. [x]
- Line endings LF (file: sin CRLF en los 6 archivos). [x]
- Comillas dobles para strings; simples para atributos JSX/Astro. [x]
- Nombres: componentes PascalCase, archivos test `*.test.ts` espejo de la ruta de src. [x]
- Comentarios mínimos con porqué; sin TODO/FIXME sueltos. [x]

## Cambios requeridos

(ninguno)
