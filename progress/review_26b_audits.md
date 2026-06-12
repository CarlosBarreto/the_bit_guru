# review_26b_audits — Reporte del reviewer · feature #26, sub-tarea B (AUDITORÍAS)

- **Fecha:** 2026-06-11
- **Rol:** reviewer (APRUEBA / RECHAZA; no edita código)
- **Alcance:** sub-tarea B (auditorías a11y/motion/palette). La sub-tarea A
  (limpieza neón) ya fue APPROVED en `progress/review_26a_cleanup.md`. **Esta es
  la revisión final que cierra la feature #26 completa.**
- **Veredicto:** **APPROVED**

## Resultado de la verificación

- `.\init.ps1` (raíz): **exit 0**. 8 archivos base del arnés `[OK]`,
  `feature_list.json` válido (26 features), **`Test Files 40 passed (40) ·
  Tests 532 passed (532)`**, "[OK] Entorno listo." Cero rojos.
- `npm run build --prefix frontend-astro`: **exit 0**. "Server built in 4.01s ·
  Complete!" (adapter Vercel), sin errores de import.
- Delta de tests verificado: 471 → **532** (+61), todos del nuevo
  `tests/audits/site-audit.test.ts`. 39 → **40** archivos. Cero regresiones en
  los 471 previos.

## Perímetro (verificado con git)

`git status` + `git diff --stat`:

- **Staged (sub-tarea A, ya aprobada):** 17 archivos `D` (deleted), 2202
  deletions. Los 6 páginas + 5 componentes + 5 tests neón + `utils/api.js`.
  Coincide 1:1 con `review_26a_cleanup.md`. No se re-evalúa aquí.
- **No staged (sub-tarea B):** 6 archivos, 59 inserciones / 17 borrados:
  - `frontend-astro/src/components/SectionDivider.astro` (+32/-4): nueva prop
    opcional `as?: "h2"|...`. Verificado en el diff (`SectionDivider.astro:11-42`):
    cuando se pasa `as`, el `label` se renderiza dentro de un encabezado real
    conservando el tratamiento visual de eyebrow, y el contenedor deja de ser
    `role="separator"` (`role={as ? undefined : "separator"}`). Sin `as`,
    comportamiento idéntico al previo (`<div role="separator">` + `<span
    class="eyebrow">`). Se anuló `margin:0` en `.eyebrow` para preservar el ritmo.
    **Retrocompatible y cero cambio de lógica de dominio.**
  - `frontend-astro/src/pages/{index,practica,archivo}.astro` (+2/-1 c/u): una sola
    línea cada uno — `SectionDivider label=...` → `SectionDivider as="h2" label=...`
    en el divisor que introduce cada rejilla de tarjetas `<h3>`. Verificado en el
    diff: cambio puro de presentación accesible, sin tocar datos ni copy.
  - `feature_list.json` (` M`): único cambio es `#26 "pending" → "in_progress"`
    (verificado en el diff). **No es flip a `done`.** Correcto (lo hace el leader).
  - `progress/current.md`: notas de sesión del leader.
- **Untracked:** `tests/audits/` (test nuevo), `progress/audit_26.md`,
  `impl_26a_cleanup.md`, `impl_26b_audits.md`, `review_26a_cleanup.md`.

**NO se tocó ningún endpoint `pages/api/*`** (los 7 ausentes del diff),
`src/lib/`, `Layout.astro`, `PageShell`, `TopNavigation`, `Footer`, ni primitivos.
**Cero neón reintroducido** (el diff es solo borrados + 4 archivos de
presentación). Las correcciones a páginas/componentes conservados son **mínimas
y coherentes con la spec** (resuelven una violación a11y declarada, sin cambio de
dominio).

## Validación del acceptance #26 punto por punto

### 1. WCAG AA en las 7 páginas — PASS

El test `site-audit.test.ts` afirma **invariantes reales**, no prosa:

- **Landmarks + skip-link** (`:174-203`): por cada una de las 7 páginas (`it.each(PAGES)`),
  `countTag(main)===1`, `<main id="main">`, `<header>`, `<nav>`, `<footer>`, y
  `skip-link href="#main"`. `lang="es"` en las 7.
- **Un solo `<h1>`** (`:206-212`): `countTag(markup,"h1")===1` por página.
- **Jerarquía sin saltos** (`:214-229`): extrae la secuencia de niveles de
  encabezado del markup renderizado y exige `levels[0]===1` y que ningún paso
  suba más de 1 nivel (`jump <= 1`). Esto **caza realmente** el bug h1→h3: si
  alguna página volviera a saltar, el test falla con el mensaje de secuencia.
  Verificado de forma independiente: la corrección (`as="h2"` en los 3 divisores)
  es exactamente lo que satisface este assert.
- **Formulario `/admision`** (`:232-247`): `label[for=problema]`↔`textarea[id=problema]`,
  `aria-describedby="problema-help problema-error"`, `aria-invalid="false"`,
  `<legend>`, `role="status"`, `role="alert"`, `aria-live`.
- **Foco visible** (`:250-272`): 8 componentes interactivos deben contener
  `:focus-visible` y **no** `outline:none` huérfano.
- **Contraste AA de tokens** (`:274-287`): recomputa el ratio sRGB de los 6 tokens
  de texto sobre `--paper` y de `--ink` sobre `#FFF`, exigiendo `≥4.5:1`. No es
  prosa: recalcula la luminancia (`:143-161`).

### 2. Motion — PASS

`site-audit · MOTION` (`:289-327`): (a) Layout conserva el bloque global
`@media (prefers-reduced-motion: reduce)` con `animation: none !important` y
`transition: none !important` — verificado independientemente en
`Layout.astro:153-158`. (b) Ningún `.astro` contiene `parallax`/`typewriter`/
`@keyframes`/`animation:` (excluyendo el bloque reduced-motion). (c) Las
transiciones se limitan a `color/opacity/transform/border/top` ≤200ms ease-out.
Cero animación prohibida; todo se desactiva con `prefers-reduced-motion`.

### 3. Palette — PASS

`site-audit · PALETTE` (`:330-393`): (a) ningún `.astro` fuera de `Layout.astro`
introduce un hex en su `<style>` (escopado correctamente a CSS real vía
`styleCss()`, que descarta frontmatter y comentarios); (b) ningún atributo
`fill`/`stroke`/`style` usa hex (solo `var(--token)`); (c) `Layout.astro` es la
única tabla de hex; (d) **una sola familia de acento por documento** — exactamente
1 `data-accent` por página igual al esperado de la spec, e **Inicio = 0
`data-accent`** (Navy neutro); (e) cero `gradient`/`box-shadow`/`text-shadow`/
`drop-shadow`/`prefers-color-scheme`/`cdn.tailwindcss.com`. Cobertura del site
map (`:395-411`): exactamente las 7 páginas, sin neón residual.

**Exclusión de `create-image.ts` correcta:** el hex de ese archivo vive en un
string de prompt de un endpoint `pages/api/` (prohibido tocar por la spec) y no
es CSS/atributo de estilo. La auditoría de paleta escanea solo `.astro`
(`ALL_ASTRO`), por lo que lo excluye legítimamente. No es un agujero.

### 4. Evidencia verificable + documental — PASS

Test automático que recorre las 7 páginas + chrome (`tests/audits/site-audit.test.ts`,
61 casos) + evidencia humana en `progress/audit_26.md` (checklist por página +
tabla de contraste recalculada).

## DEFINITION OF DONE de la spec (§ DEFINITION OF DONE)

- Registro consultora / disciplina de paleta / copy canónico: cubierto por tests
  de features 16–25 (vigentes, verdes) + lectura humana en `audit_26.md`.
- Design tokens (cero hex sueltos): PASS (palette audit).
- Checklist WCAG AA completo: PASS (a11y audit, ver punto 1).
- Sin elemento visual prohibido: PASS (palette + motion audits).
- `init.ps1` verde, tests al 100%, repo limpio: PASS (exit 0, 532/532). Repo:
  solo borrados + 4 archivos de presentación + docs de `progress/`; sin artefactos
  sospechosos (caches/builds fuera de `.gitignore`).

## § ACCEPTANCE CRITERIA de la spec — punto por punto

- Navegación exactamente 6 enlaces: cubierto por TopNavigation (feature 16, verde).
- Ninguna página >1 familia de acento: PASS (`PALETTE — una familia de acento`).
- Sin gradientes / glow / dark mode / stock / rostro: PASS (palette audit + tests
  de página existentes sin `<img>`/sello SVG no-facial).
- Cada página WCAG AA + jerarquía editorial: PASS (a11y audit).
- Inicio = Partner Letter · About · 3 Insights · Portrait: cubierto por
  `index.test.ts` (vigente).
- Todo color = design token: PASS.
- No Tailwind CDN: PASS.
- No se modificó `src/lib/` ni `src/pages/api/`: PASS (git, ver Perímetro).
- `init.ps1` verde + tests 100%: PASS.

## Checkpoints C1–C5

### C1 — El arnés está completo
- [x] 4 archivos base presentes (init.ps1 `[OK]`).
- [x] 3 docs presentes (`[OK]`).
- [x] `.\init.ps1` exit 0.

### C2 — El estado es coherente
- [x] Una sola feature `in_progress`: **#26** (verificado: `git grep`/count
      sobre `feature_list.json` → 1 ocurrencia). El resto done/pending. El
      implementer NO tocó status; el flip lo hizo el leader.
- [x] Toda feature `done` tiene tests que pasan (532/532).
- [x] `progress/current.md` describe la sesión activa.

### C3 — El código respeta la arquitectura
- [x] `src/` solo módulos previstos: se añadió un test de auditoría y una prop
      opcional retrocompatible en `SectionDivider`; capas intactas. `lib/` y
      `api/` no tocados.
- [x] Sin dependencias externas nuevas (el test usa `astro/container`, `vitest`,
      `node:fs/url`, ya en uso).
- [x] Sin logs/prints/TODOs introducidos. Comentarios documentan el *porqué* a11y.

### C4 — La verificación es real
- [x] El test de auditoría recorre las 7 páginas + chrome con asserts reales
      (no prosa vacía): conteo de `<main>`/`<h1>`, secuencia de headings,
      contraste recalculado, conteo de `data-accent`, prohibiciones sobre CSS real.
- [x] Tests sin servicios externos (render por Container API + readFileSync; sin red).
- [x] `npm test` muestra 532 > 0, todos verdes.

### C5 — La sesión se cerró bien
- [x] Sin artefactos sospechosos: diff = 17 deletions (A) + 4 archivos de
      presentación (B) + `progress/` + el flip de status del leader.
- [x] El cierre a `history.md` y el commit `feat:` corresponden al leader al
      cerrar #26; fuera del alcance del reviewer.
- [x] Feature #26 sigue `in_progress` — correcto: el cierre a `done` lo decide el
      leader tras este APPROVED.

## Cambios requeridos

Ninguno.

## Notas (no bloqueantes)

1. **Commit pendiente.** El árbol queda con A staged + B no staged + docs
   untracked; el commit final (`feat:` / `refactor:`) y el cierre a `done`,
   `history.md` y `current.md` a plantilla los hace el leader.
2. **Cobertura "registro consultora / copy canónico" por lectura humana.** Ese
   criterio de la DoD no es plenamente automatizable; queda cubierto por los
   tests de contenido de features 16–25 (verdes) y la lectura de `audit_26.md`.
   No bloquea.
3. **`create-image.ts` hex.** Documentado arriba: fuera de alcance de
   presentación y de auditoría de paleta por diseño. Correcto.

---

**Firma del Agente Mictlán** · reviewer · bit_guru · 2026-06-11
