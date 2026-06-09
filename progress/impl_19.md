# impl_19.md — Log de implementación · feature 19 (redesign_page_home)

- **Fecha:** 2026-06-09
- **Agente:** implementer (workflow)
- **Feature:** 19 — redesign_page_home (Phase 3, Inicio `/`)
- **Rama:** feat/migrate-to-vercel
- **Estado al cierre:** implementado y verificado (verde). NO marcado `done`
  (el orquestador hace revisión y cierre).

---

## Alcance ejecutado

Reescritura de la home neón obsoleta (feature 13) al registro editorial de
consultora deadpan de `docs/design/redesign_advisory_spec.md`. Se mantuvo el
alcance estricto: solo `src/pages/index.astro` (reescrito) + un componente
shell reusable nuevo + dos tests. No se tocó `Layout.astro`, `lib/` ni
`pages/api/`. No se crearon otras páginas.

## Archivos cambiados

1. `frontend-astro/src/components/PageShell.astro` — **NUEVO**. Cascarón de
   página reusable:
   - Skip-link "Saltar al contenido" (`href="#main"`) oculto hasta recibir foco.
   - `<TopNavigation />` (header+nav) → UN solo `<main id="main">` (landmark) →
     `<Footer />`.
   - Prop opcional `accent?: 'burgundy' | 'olive' | 'forest'`. Si NO se pasa,
     el `<main>` NO lleva `data-accent` → acento neutro Navy (default global de
     Layout.astro). Las páginas siguientes lo reusan pasando su familia.
   - Consume SOLO tokens (`--accent*`, `--ink*`, `--paper*`, `--space-*`,
     `--font-*`, `--radius`). Foco visible con `--accent`. Sin gradiente, glow,
     dark mode ni hex de marca. No toca `Layout.astro` (el remapeo
     `[data-accent="..."]` ya vive en su `<style is:global>`).

2. `frontend-astro/src/pages/index.astro` — **REESCRITO**. `<Layout
   title="Bit Gurú — Asesoría Estratégica">` → `<PageShell>` (sin accent → Navy)
   → `<Container>`. Contenido EXACTAMENTE 4 bloques, en orden:
   - **(a) Partner Letter:** `EditorialHero` (eyebrow "Carta del Socio" + H1
     serif de marca + deck) + carta del Socio Fundador en `<Prose>` (4 párrafos
     serif, registro usted/deadpan, voz cínica-cómplice PERSONA §3–§4), firmada
     "El Gurú de Bits — Socio Fundador. Operando desde los espacios muertos
     entre paquetes."
   - **(b) About the Firm:** `SectionDivider label="Sobre la Firma"` + párrafo
     institucional breve en `<Prose>`.
   - **(c) 3 Featured Insights:** `SectionDivider label="Memos Destacados"` +
     EXACTAMENTE 3 `InsightCard` (títulos/extractos deadpan, fechas en mono
     coherentes, `href="/memos"`).
   - **(d) Principal Portrait:** `SectionDivider label="El Socio Principal"` +
     `PartnerBiographyBlock` (retrato no-facial = sello SVG a una tinta).
   - Copy de marca real (sin lorem, sin emoji, sin hype). Sin acento de familia.

3. `frontend-astro/tests/components/page-shell.test.ts` — **NUEVO**. Patrón
   doble del repo (Container API + lectura del source): skip-link a `#main`,
   UN solo `<main id="main">`, render del slot, chrome (header/nav/footer),
   `data-accent` ausente sin prop y presente con prop (burgundy/olive/forest),
   sin `<img>`, foco visible, sin hex/gradiente/glow en CSS.

4. `frontend-astro/tests/pages/index.test.ts` — **NUEVO**. Patrón doble:
   - Markup (Container API): EXACTAMENTE un `<h1>`; EXACTAMENTE 3 `<article>`
     (los InsightCard); los 4 bloques presentes y EN ORDEN por sus
     labels/encabezados; PartnerBiographyBlock presente; firma del Socio; NO
     `data-accent` (Navy); NO `<img>` ni `background-image`; sello SVG
     decorativo (`aria-hidden`).
   - Source: compone con `PageShell` sin familia de acento; reusa los
     componentes clave (sin reimplementar); orden de los 4 SectionDivider;
     EXACTAMENTE 3 memos con `href="/memos"`; título de página correcto.

## Decisiones de implementación

- La carta del socio se envolvió en `<Prose>` por defecto (`<div>`), NO
  `as="article"`, para que el conteo de `<article>` quede EXACTAMENTE en 3 (los
  InsightCard), tal como exige el acceptance. Falso positivo inicial corregido.
- El test de "sin rostro/fotorrealismo" se ajustó: el comentario HTML
  `<!-- ... sin rostro ... -->` de `PartnerBiographyBlock` se renderiza en el
  output, así que la verificación significativa es ausencia de `<img>` /
  `background-image` + presencia del sello SVG `aria-hidden`. La garantía de "no
  `data-accent`" se prueba sobre el HTML renderizado (no sobre el source, que
  menciona el concepto en comentarios).
- El contenido editorial ocupa el ancho del `Container` (`grid-column: 1 / -1`)
  y se alinea a la izquierda; cada bloque de prosa se autolimita a `--measure`
  vía sus componentes. Los 3 memos van en una rejilla 3→2→1 responsiva.

## Verificación

- **Tests (canónico):**
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1`
  → **VERDE**. `Test Files 28 passed (28)` · `Tests 274 passed (274)`.
- **Build:** `npm run build --prefix frontend-astro` → **VERDE**.
  `[build] Complete!` (server + client + adapter Vercel).

## Resultado

- `tests_green = true`
- `build_green = true`
- Sin tocar archivos fuera de alcance. Sin elementos prohibidos (gradiente,
  glow, dark mode, emoji, hype, Tailwind CDN, hex de marca, prosa centrada).
