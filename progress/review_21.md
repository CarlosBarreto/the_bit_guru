# Review — feature 21 `redesign_page_metodologia`

- **Fecha:** 2026-06-09
- **Agente:** reviewer
- **Insumos:** `docs/architecture.md`, `docs/conventions.md`, `CHECKPOINTS.md`, `docs/design/redesign_advisory_spec.md`, `feature_list.json` (feature 21), `progress/impl_21.md`, `progress/current.md`, los 6 archivos nuevos, `git status`/`git diff`, `.\init.ps1`.

**Veredicto:** APPROVED

---

## Checkpoints

- C1: [x] — Existen `AGENTS.md`, `init.ps1`, `feature_list.json`, `progress/current.md` y los 3 docs. `.\init.ps1` exit code 0.
- C2: [x] — Exactamente una feature `in_progress` (la 21; `git diff feature_list.json` = solo `pending`→`in_progress`, puesto por el leader). 340/340 tests verdes. `progress/current.md` describe solo la sesión activa.
- C3: [x] — Archivos nuevos en las rutas previstas (`src/components/`, `src/pages/`, espejo en `tests/`). Cero dependencias nuevas (solo `astro/container`, `vitest`, `node:fs`, `node:url`, ya en uso). Sin `console.log`, sin TODOs (grep verificado: las únicas apariciones de "box-shadow"/"lorem" son comentarios de prohibición, no usos).
- C4: [x] — Cada módulo nuevo tiene su test espejo (`white-paper-layout.test.ts`, `two-color-diagram.test.ts`, `metodologia.test.ts`). Sin servicios externos (Container API + readFileSync, sin red). `npm test --prefix frontend-astro`: 34 archivos, 340 tests, todos verdes.
- C5: [x] — `git status`: solo los 6 archivos nuevos declarados + `progress/` + `feature_list.json`; sin basura sin trackear. `progress/history.md` tiene la entrada de la última sesión cerrada (feature 20). Feature 21 reflejada en su estado correcto (`in_progress`, pendiente de marcar `done` post-aprobación — mismo flujo que features 19–20).

## Verificación de perímetro (regla "no tocar")

`git status --porcelain` muestra **únicamente**:
- `M feature_list.json` (1 línea: status de la 21), `M progress/current.md`, `?? progress/impl_21.md`
- `??` los 6 archivos nuevos declarados.

`frontend-astro/src/lib/tarot.ts`, `src/pages/api/*`, `Layout.astro`, `PageShell.astro` y todas las features done: **intactos**. ✔

## Acceptance criteria de la feature 21

1. **`data-accent='forest'`, una sola familia** — ✔. `metodologia.astro:111` usa `<PageShell accent="forest">`; PageShell lo aplica en `<main data-accent>` (patrón canónico aprobado en features 19–20). `metodologia.test.ts:28-38` asierta `<main data-accent="forest">` y que hay EXACTAMENTE 1 `data-accent` en el documento; `:117-118` excluye burgundy/olive en el source.
2. **22 arcanos desde `lib/tarot.ts`, sin renombrar** — ✔. `metodologia.astro:22` importa `ARCANOS`; `:76-84` deriva las dimensiones con `ARCANOS.map()` (orden canónico preservado, IX antes de V, etc.). Las 22 claves de `DIMENSION_NOTES` (`:27-72`) son los strings canónicos literales — cotejadas una a una contra `src/lib/tarot.ts:11-34`: coinciden las 22. Código romano citado en mono (`.dimension-code`, `metodologia.astro:248-255`, y `.cell-code` del SVG, `TwoColorDiagram.astro:143-156`).
3. **WhitePaperLayout (portada, secciones numeradas, índice) + TwoColorDiagram a dos tintas** — ✔. Portada con código mono + único `<h1>` + deck + `<dl>` de metadatos (`WhitePaperLayout.astro:48-64`); índice `<nav aria-label="Índice">` con anclas y números (`:67-81`); secciones `<section id>` + `aria-labelledby` + número mono en `--accent` + `<aside>` condicional (`:85-102`). En `TwoColorDiagram.astro` TODOS los `var(--*)` dentro del `<svg>` son `--ink` o `--accent` (verificado por lectura y por el test `two-color-diagram.test.ts:89-103`, que extrae el bloque SVG y valida el set completo de tokens).
4. **No se modifica `lib/tarot.ts` ni endpoints** — ✔ (ver perímetro arriba).
5. **`tests/` valida las 22 dimensiones desde lib** — ✔. `metodologia.test.ts:6` y `two-color-diagram.test.ts:6` importan el `ARCANOS` real (no fixtures): `toHaveLength(22)`, loop por nombre canónico + `ARCANO <código>` (`metodologia.test.ts:54-65`), conteo exacto de 22 `<li class="dimension">` (`:67-71`), 22 celdas SVG + `<title>` canónico completo por celda (`two-color-diagram.test.ts:48-68`), claves literales en el source (`metodologia.test.ts:128-132`).
6. **`init.ps1` verde y `npm test` pasa** — ✔. Ejecutado por este reviewer desde la raíz: exit 0, 34 archivos, **340/340** tests (baseline 304 + 36 nuevos = 11+10+15, cuadra con `impl_21.md`).

## Conformidad con `redesign_advisory_spec.md`

- **Tokens:** cero hex de marca en los 3 `.astro` (grep limpio); solo `--ink*`, `--accent*`, `--paper*`, `--space-*`, `--step-*`, `--font-*`, `--radius`, `--measure`. ✔
- **Prohibiciones duras:** sin gradiente, sin glow/sombra, sin dark mode, sin emoji (el `™` del H1 es glifo tipográfico y es parte del nombre canónico de la página en la spec § SITE MAP), sin hype, sin Tailwind CDN, prosa a la izquierda. ✔
- **Tipografía:** serif para prosa/headlines, mono para códigos/eyebrows/metadatos con `letter-spacing: 0.08em`, medida `--measure` en todos los bloques de prosa. ✔
- **Voz:** registro de usted, deadpan consultora, catchphrases canónicas adaptadas ("Hoy las cartas indican que…" en `metodologia.astro:124`; "…y si eso le tranquiliza, créalo." en `:134`), descargos cínico-institucionales (sección 5). Sin lorem ipsum, sin guiños que señalen el chiste. ✔
- **Accesibilidad:** un solo `<h1>`; jerarquía h1→h2→h3 sin saltos; `<nav aria-label="Índice">`; `<section>` con `aria-labelledby`; SVG `role="img"` + `<title>`/`<desc>` vía `aria-labelledby` + `<title>` por celda; foco visible `outline: 2px solid var(--accent)` en el índice. ✔

## Observaciones no bloqueantes

1. `WhitePaperLayout.astro:112` — la portada usa `border-top: 3px solid var(--ink-deep)` (regla gruesa editorial, no hairline). No viola la spec (las hairlines son "el principal recurso", no el único, y el color es token de tinta); se anota solo como registro de estilo.
2. `WhitePaperLayout.astro:272` — `border-radius: var(--radius)` en `.margin-note` no tiene efecto visible con solo `border-left`. Inocuo.
3. Herencia de features 19–20 (ya sancionada): `data-accent` vive en `<main>` (PageShell), no en `<body>`; nav/footer permanecen Navy. Patrón canónico del repo.

## Cambios requeridos

Ninguno.

## Siguiente paso (leader)

Marcar feature 21 `done` en `feature_list.json`, mover el resumen de sesión a `progress/history.md` y commitear (`feat:`), según protocolo.
