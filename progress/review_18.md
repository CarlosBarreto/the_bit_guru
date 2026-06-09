# Review — feature 18 (redesign_editorial_components_b)

**Veredicto:** APPROVED

**Ciclo:** 1
**Fecha:** 2026-06-09
**Revisor:** reviewer (workflow)

## Resumen

Tres componentes editoriales reusables nuevos + sus tests espejo:
`InsightCard.astro`, `MetricTable.astro`, `PartnerBiographyBlock.astro` en
`frontend-astro/src/components/`, con tests en `frontend-astro/tests/components/`.
No se tocó `lib/`, `pages/api/`, páginas, Nav/Footer/Hero (diff vacío confirmado).
Verificación verde: `init.ps1` exit 0, 252/252 tests (26 archivos).

## Checkpoints (C1–C5)

- C1: [x] Arnés completo — los 4 base + 3 docs presentes; `.\init.ps1` exit 0.
- C2: [x] Estado coherente — feature 18 es la única `in_progress` en
  `feature_list.json` (init.ps1 §3 OK); `progress/current.md` describe la sesión
  18 sin basura previa.
- C3: [x] Respeta arquitectura — solo `frontend-astro/src/components/` (capa de
  presentación, prevista). Sin imports externos (los .astro no importan nada).
  Sin logs/prints de debug ni TODO/FIXME. Cero hex sueltos / gradiente / glow /
  dark mode / `<img>` / Tailwind CDN (grep solo encuentra las palabras en los
  comentarios que DECLARAN las prohibiciones, no en el CSS).
- C4: [x] Verificación real — cada nuevo módulo tiene su test espejo
  (`insight-card.test.ts` 11, `metric-table.test.ts` 9, `partner-biography.test.ts` 9).
  Tests sin servicios externos. `npm test --prefix frontend-astro` → 252 verdes.
- C5: [x] Sesión bien cerrada — sin untracked sospechosos (solo los 6 archivos
  de la feature + `feature_list.json`/`current.md`/`impl_18.md`). La feature
  queda `in_progress` (correcto: el implementer no marca `done`; lo cierra el
  orquestador tras este review). Entrada de historia pendiente del cierre.

## Acceptance de la feature 18

- [x] InsightCard renderiza eyebrow + título + extracto + fecha mono
  (`InsightCard.astro:26–33`; `.date` en `var(--font-mono)`, `:97–104`).
- [x] MetricTable usa `<table>`/`<th scope>`/`<caption>` reales con hairlines y
  banda `--ink-wash`; números en `--font-mono`
  (`MetricTable.astro:29–51` markup; `:78` banda, `:87` hairline, `:101–106`
  `.value` mono + tabular-nums). Cero divs estructurales (test "NO usa divs").
- [x] PartnerBiographyBlock usa retrato no-facial (SVG sello a una tinta:
  silueta encapuchada SIN rostro + monograma "BG"), sin `<img>` ni
  fotorrealismo (`PartnerBiographyBlock.astro:39–77`, `aria-hidden="true"`).
- [x] Solo tokens de la spec; cero hex sueltos (grep + asserts en los 3 tests).
- [x] tests/ valida semántica de MetricTable y render de las tarjetas.
- [x] `init.ps1` verde y `npm test` pasa.

## Reglas duras de la spec verificadas

- [x] CERO hex sueltos: solo `--accent*`, `--ink*`, `--paper*`, `--space-*`,
  `--step-*`, `--font-*`, `--radius`, `--measure`.
- [x] Sin gradiente / glow / box-shadow / text-shadow / dark mode / emoji / hype
  ("revolucionario/disruptivo/¡!" sin coincidencias).
- [x] Registro consultora en el copy por defecto: "El Gurú de Bits / Socio
  Fundador", "Opera desde los espacios muertos entre paquetes", "diligencia
  kármica", "Marco de los 22 Arcanos", "Si llegó hasta aquí, ya sabe con quién
  trata." (usted, deadpan).
- [x] Reuso del patrón de los primitivos existentes: mismo andamiaje de test
  (Container API + lectura de source, réplica de `editorial-hero.test.ts`),
  misma disciplina token-only y no-fija-acento (consumen `--accent`, remapeable
  por página vía `data-accent`). Son hojas de presentación; correctamente NO
  envuelven `Container`/`Prose` (esos los compone la página, features 19–25).
- [x] Sin rostro humano / sin foto: retrato es SVG line-art encapuchado sin cara.
- [x] No se modificó `lib/` ni `pages/api/` (diff vacío).

## Estilo / convenciones

- [x] Line endings LF en los 6 archivos.
- [x] Indentación 2 espacios, comillas dobles en strings, atributos Astro con
  comillas dobles.
- [x] Nombres: componentes `PascalCase.astro`, tests `kebab-case.test.ts` espejo
  de la ruta en `src/` (`tests/components/`).

## Observaciones (no bloqueantes)

1. El SVG del sello lleva a la vez `role="img"` y `aria-hidden="true"`
   (`PartnerBiographyBlock.astro:42–43`). `aria-hidden` lo retira del árbol de
   accesibilidad, por lo que `role="img"` queda inerte (no daña). La estrategia
   "identidad como texto" está permitida por la spec § IMAGES & ILUSTRACIÓN.
   Limpieza opcional: quitar `role="img"`. No requiere cambio para aprobar.

## Cambios requeridos

(ninguno)
