# audit_26.md — Evidencia de auditoría a11y / motion / palette (feature #26, sub-tarea B)

> Agente: `implementer`. Fecha: 2026-06-11.
> Fuente de verdad: `docs/design/redesign_advisory_spec.md`
> (§ ACCESSIBILITY CHECKLIST · § ACCEPTANCE CRITERIA · § DEFINITION OF DONE · § MOTION).
> Materialización automática: `frontend-astro/tests/audits/site-audit.test.ts`
> (61 casos, todos verdes). Lo de abajo es la lectura humana de esos invariantes.

Site map auditado (7 páginas + chrome): `index, practica, metodologia, memos,
archivo, la-firma, admision` + `Layout.astro`, `PageShell`, `TopNavigation`,
`Footer` + componentes editoriales reusados.

---

## 1. WCAG AA — Accesibilidad

### 1.1 Landmarks (por página)

Todas las páginas componen el mismo chrome vía `PageShell`:
`skip-link → <header><nav> (TopNavigation) → <main id="main"> → <footer> (Footer)`.

| Página | 1×`<main id="main">` | `<header>` | `<nav>` | `<footer>` | skip-link→#main |
|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/practica` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/metodologia` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/memos` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/archivo` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/la-firma` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admision` | ✅ | ✅ | ✅ | ✅ | ✅ |

Verificado por `site-audit · A11Y — landmarks y skip-link`. `lang="es"` en `<html>`
en las 7.

### 1.2 Jerarquía de encabezados (1×h1, sin saltos de nivel)

| Página | Secuencia de headings renderizada | 1×h1 | Sin salto |
|---|---|---|---|
| `/` | h1 (hero) → **h2 (SectionDivider "Memos Destacados")** → h3×3 (InsightCard) | ✅ | ✅ |
| `/practica` | h1 → **h2 (SectionDivider "Líneas de Servicio")** → h3×4 (ServiceCard) | ✅ | ✅ |
| `/metodologia` | h1 (WhitePaper) → h2 (Índice) → h2×5 (secciones) → h3×22 (dimensiones) | ✅ | ✅ |
| `/memos` | h1 (hero) → h2×N (trimestre) → h3 (MemoCard) | ✅ | ✅ |
| `/archivo` | h1 → **h2 (SectionDivider "Casos Seleccionados")** → h3×4 (EngagementCard) | ✅ | ✅ |
| `/la-firma` | h1 (hero) [resto sin headings: prosa/PullQuote/bio] | ✅ | ✅ |
| `/admision` | h1 (hero) [resto: form sin headings] | ✅ | ✅ |

**Hallazgo corregido (ver impl_26b_audits.md):** `/`, `/practica` y `/archivo`
saltaban de `h1` directo a `h3` (las tarjetas usan `<h3>` y el `SectionDivider`
introductorio era un `<span>`). Se añadió `as="h2"` al `SectionDivider` que
introduce cada rejilla de tarjetas; ahora la cadena es h1→h2→h3.
Verificado por `site-audit · A11Y — jerarquía de encabezados`.

### 1.3 Formulario `/admision` (IntakeForm)

- `<label for="problema">` ↔ `<textarea id="problema">` (asociación explícita). ✅
- Ayuda + error vinculados: `aria-describedby="problema-help problema-error"`. ✅
- `aria-invalid="false"` inicial; el cliente lo conmuta a `"true"` en error. ✅
- Grupo de tipo de consulta con `<fieldset>` + `<legend>` real. ✅
- `ConfirmationState` `role="status"` + `aria-live="polite"`; `ErrorState`
  `role="alert"`; error de campo server-rendered. ✅

Verificado por `site-audit · A11Y — formulario de /admision`.

### 1.4 Foco visible

Cada componente con elementos enfocables propios declara `:focus-visible`
(`outline: 2px solid var(--accent); outline-offset: 2px`) y **ningún** archivo usa
`outline: none` sin reemplazo. Cubre: TopNavigation, Footer, PageShell (skip-link),
EditorialHero (CTA), InsightCard, EngagementCard (summary), WhitePaperLayout (toc),
IntakeForm (textarea/radios/submit). Verificado por
`site-audit · A11Y — foco visible en interactivos`.

### 1.5 Contraste de tokens (cálculo WCAG, sobre `--paper` #F6F4EE)

Recalculado en el test (sRGB→luminancia→ratio); coincide con lo declarado en la spec:

| Token | Hex | Ratio vs `--paper` | Umbral | Resultado |
|---|---|---|---|---|
| `--ink-deep` | #0B1B2D | ~15.9:1 | 4.5 | ✅ |
| `--ink` | #16293B | ~13.3:1 | 4.5 | ✅ |
| `--ink-muted` | #4B5965 | ~6.4:1 | 4.5 | ✅ |
| `--burgundy` | #7C1D33 | ~9.2:1 | 4.5 | ✅ |
| `--olive` | #54501A | ~7.5:1 | 4.5 | ✅ |
| `--forest` | #1A4636 | ~9.8:1 | 4.5 | ✅ |
| `--ink` sobre `--paper-pure` (#FFF, tarjetas) | — | ≥4.5:1 | 4.5 | ✅ |

El color **no** es el único portador de información: enlaces con subrayado/peso,
estado activo del nav con peso+filete, marcadores `+/-` y bordes en estados de
form. Verificado por `site-audit · A11Y — contraste de tokens`.

---

## 2. Motion audit

- `Layout.astro` conserva el bloque global
  `@media (prefers-reduced-motion: reduce)` que fuerza
  `animation: none !important; transition: none !important; scroll-behavior: auto !important`.
  ✅ (verificado: el bloque existe y contiene ambas reglas).
- **Sin animación prohibida** en NINGÚN `.astro`: cero `parallax`, cero
  `typewriter`, cero `@keyframes`, cero `animation:` (excluyendo el bloque
  reduced-motion, cuyo cometido es justamente apagarlas). ✅
- **Transiciones existentes conformes** (§ MOTION): solo `color`,
  `background-color`, `border-color`, `text-decoration-color` y `top` (skip-link),
  todas `≤200ms ease-out`. Sin escalados llamativos, sin glow pulsante. ✅

Verificado por los 3 casos de `site-audit · MOTION`.

---

## 3. Palette audit

- **Cero hex de marca fuera de `Layout.astro`** en CSS real (`<style>` con
  comentarios CSS y frontmatter descartados) ni en atributos de estilo
  (`fill`/`stroke`/`style`): los diagramas SVG usan exclusivamente
  `var(--ink)` / `var(--accent)` / `var(--ink-rule)`. ✅
  - Nota de alcance: `src/pages/api/create-image.ts` contiene hex (#3a0ca3, etc.)
    dentro de un **string de prompt** de un endpoint. Está FUERA del alcance de
    presentación (la spec prohíbe tocar `src/pages/api/`) y NO es CSS/atributo de
    estilo, por lo que la auditoría de paleta correctamente lo excluye.
- **Una sola familia de acento por documento**: exactamente 1 `data-accent` por
  página, con la familia que manda la spec; Inicio = Navy neutro **sin**
  `data-accent`. ✅

  | Página | `data-accent` esperado | Encontrado |
  |---|---|---|
  | `/` | (ninguno, Navy) | 0 ✅ |
  | `/practica` | burgundy | 1 ✅ |
  | `/metodologia` | forest | 1 ✅ |
  | `/memos` | olive | 1 ✅ |
  | `/archivo` | burgundy | 1 ✅ |
  | `/la-firma` | forest | 1 ✅ |
  | `/admision` | olive | 1 ✅ |

- **Sin elementos visuales prohibidos** en CSS real: cero `*-gradient`, cero
  `box-shadow`/`text-shadow`/`drop-shadow`, cero `prefers-color-scheme` (no dark
  mode), cero `cdn.tailwindcss.com`. ✅
- **Sin emoji** en UI/copy: el único símbolo no-ASCII recurrente es `→` y `§`,
  y aparecen solo en comentarios de código (no en markup/copy renderizado).

Verificado por `site-audit · PALETTE — *` (4 grupos) y
`site-audit · cobertura del site map` (las 7 páginas, sin neón residual).

---

## 4. Mapeo a § ACCEPTANCE CRITERIA / § DEFINITION OF DONE

| Criterio de la spec | Cubierto por |
|---|---|
| Navegación con exactamente 6 enlaces | `nav-links.ts` (6) + tests TopNavigation (feature 16, vigentes) |
| Ninguna página > 1 familia de acento | `site-audit · PALETTE — una familia de acento` |
| No gradientes / glow / dark mode | `site-audit · PALETTE — prohibiciones visuales` |
| No foto de stock / rostro humano | tests de página existentes (sin `<img>`, sello SVG no-facial) |
| Cada página pasa WCAG AA | `site-audit · A11Y` (landmarks, headings, foco, form, contraste) |
| Jerarquía editorial | `site-audit · A11Y — jerarquía de encabezados` (1×h1, sin saltos) |
| Inicio = Partner Letter · About · 3 Insights · Portrait | `index.test.ts` (vigente) |
| Todo color es DESIGN TOKEN (cero hex sueltos) | `site-audit · PALETTE — hex solo en Layout` |
| No Tailwind CDN | `foundation.test.ts` + `site-audit · PALETTE — prohibiciones` |
| No se modificó `src/lib/` ni `src/pages/api/` | NO tocados (solo `SectionDivider` + 3 páginas + test nuevo) |
| `init.ps1` verde, tests 100% | init.ps1 exit 0, 532/532 verdes |
| `prefers-reduced-motion` apaga todo | `site-audit · MOTION` |
| Registro consultora / copy canónico | copy de marca en las 7 páginas (revisado en lectura) |

---

**Conclusión:** las tres auditorías quedan cubiertas por tests automáticos
reproducibles. Único hallazgo real: salto de nivel de encabezado en 3 páginas,
corregido de forma mínima (SectionDivider `as="h2"`). El resto del sitio editorial
ya satisfacía los invariantes.

**Firma del Agente Mictlán** · implementer · bit_guru · 2026-06-11
