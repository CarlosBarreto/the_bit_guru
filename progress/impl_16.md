# Implementación — Feature 16: redesign_nav_footer

- **Fecha:** 2026-06-08
- **Agente:** implementer (workflow)
- **Feature:** 16 — redesign_nav_footer (Phase 2 — TopNavigation 6 enlaces + Footer)
- **Estado al cerrar la sesión:** implementada y verde (pendiente de revisión/cierre por el orquestador; NO marqué `done`).

---

## Alcance ejecutado

Reescritura del chrome compartido al registro consultora deadpan de
`docs/design/redesign_advisory_spec.md` (§ VISUAL IDENTITY, § LAYOUT,
§ VOICE & COPY, § SITE MAP, § REQUIRED COMPONENTS, § HARD PROHIBITIONS):

1. **`TopNavigation.astro`** (componente nuevo, nombre de la spec § REQUIRED COMPONENTS).
2. **`Footer.astro`** (reescrito in-place; la spec conserva el nombre `Footer`).
3. **`nav-links.ts`** (fuente de verdad única de las 6 rutas, compartida por nav y footer).

No se tocó `index.astro`, `src/lib/` ni `src/pages/api/`.

---

## Archivos

### Creados

- `frontend-astro/src/components/nav-links.ts`
  - `NAV_LINKS` (EXACTAMENTE 6 enlaces, orden autoritativo de la spec § SITE MAP:
    `/practica`, `/metodologia`, `/memos`, `/archivo`, `/la-firma`, `/admision`).
  - `HOME_HREF = "/"` (destino del wordmark).
  - `normalizePath()` (recorta barra final para el estado activo; `/memos/` == `/memos`).
- `frontend-astro/src/components/TopNavigation.astro`
  - `<header id="top">` sticky + `<nav aria-label="Navegación principal">`.
  - Wordmark "Bit Gurú · Asesoría Estratégica" → `/` (serif + sufijo mono).
  - 6 enlaces desde `NAV_LINKS`; estado activo con `aria-current="page"` y refuerzo
    no-cromático (peso 600 + filete inferior), por accesibilidad.
  - Prop `pathname` (default `Astro.url.pathname`) para testar el activo bajo Container API.
  - Foco visible `outline: 2px solid var(--accent)`; transiciones de color ≤150ms (§ MOTION).
  - Solo tokens `--ink*/--paper*/--accent*/--space-*/--step-*/--font-*`.
- `frontend-astro/tests/components/TopNavigation.test.ts`
  - Patrón doble del repo (Container API + readFileSync del source).
  - Valida: 6 enlaces exactos + orden/rutas (sobre `NAV_LINKS`), wordmark→/,
    `aria-current` solo en la ruta actual (1 ocurrencia), barra final, sin activo en `/`,
    sticky, foco visible, sin hex sueltos / gradiente / box-shadow / backdrop-filter /
    Tailwind CDN, sin tokens neón (`--morado/--cyan/--rosa`).

### Modificados

- `frontend-astro/src/components/Footer.astro` (reescrito; antes era el footer neón de la feature 13)
  - `<footer id="footer" aria-label="Pie de página">`, alineado a la izquierda.
  - Directorio `<nav aria-label="Directorio de secciones">` con las mismas 6 rutas.
  - Disclaimer cínico-institucional (§ VOICE & COPY):
    "Resultados obtenidos en líneas temporales anteriores no garantizan rendimientos
    futuros. Si llegó hasta aquí, ya sabe con quién trata."
  - Firma del Socio Fundador (§ VOICE & COPY):
    "El Gurú de Bits — Socio Fundador. Operando desde los espacios muertos entre paquetes."
  - SIN año, sin "©". Solo tokens de la spec (`--paper-deep`, `--ink-rule`, `--accent*`, etc.).
- `frontend-astro/tests/components/Footer.test.ts` (reescrito al contrato del rediseño;
  antes asertaba el contrato neón de la feature 13)
- `feature_list.json` — feature 16 `pending` → `in_progress` (única in_progress).
- `progress/current.md` — encabezado de sesión + plan.

---

## Decisiones de diseño

- **Nav nuevo, no in-place.** `Nav.astro` (feature 13, UI neón) sigue importado por
  `index.astro` (página neón obsoleta). Crear `TopNavigation.astro` (nombre de la spec)
  evita romper esa página y respeta que su limpieza/recableado es alcance de la
  feature 26 (Phase 5). `Nav.astro` y su test neón quedan intactos para esa fase.
- **Footer in-place.** La spec conserva el nombre `Footer`, así que se reescribe el
  componente y se reemplaza su test neón por el contrato del rediseño.
- **Fuente de verdad única (`nav-links.ts`).** Nav y Footer comparten el array de 6
  rutas; el "exactamente 6" se verifica una sola vez y no puede desincronizarse.
- **Estado activo accesible.** `aria-current="page"` + refuerzo no-cromático (el color
  no es el único portador, § ACCESSIBILITY CHECKLIST).

---

## Verificación

- **`powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1`** → exit 0
  (verde). 21 archivos de test, 207 tests, todos pasan. feature_list.json válido
  (1 sola in_progress).
- **`npm run build --prefix frontend-astro`** → Complete (server + client + adapter
  Vercel). Sin errores.
- Baseline previo a la feature: 20 archivos / 190 tests. Tras la feature:
  21 archivos / 207 tests (+1 archivo TopNavigation, +17 tests netos entre el nuevo
  y el reescrito de Footer).

`tests_green = true`, `build_green = true`.

---

## Bloqueos

(ninguno)

## Nota de protocolo

La tarea llegó con los campos de la feature en `undefined` (fallo de sustitución de
plantilla del orquestador). Se resolvió de forma determinista: feature 16 es la ÚNICA
`pending` de menor id (1–15 `done`), y todas las pistas del prompt (secciones de la
spec, `data-accent`, registro consultora, tests C4, Phase 2) corresponden a
`redesign_nav_footer`. No hubo ambigüedad real sobre qué feature implementar.
