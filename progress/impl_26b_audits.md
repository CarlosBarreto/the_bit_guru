# impl_26b_audits.md — Informe sub-tarea B (AUDITORÍAS) de feature #26

> Agente: `implementer`. Fecha: 2026-06-11.
> Alcance: auditorías a11y / motion / palette sobre el sitio editorial final
> (sub-tarea A de limpieza ya APPROVED). NO se borró nada, NO se tocaron endpoints.
> Detalle de auditoría (checklist + contraste calculado) en `progress/audit_26.md`.

## Resultado

**done** (a falta de revisión). Las tres auditorías quedan materializadas como
tests automáticos reproducibles; se encontró y corrigió 1 violación real
(salto de nivel de encabezado en 3 páginas). `init.ps1` exit 0 con 532/532 tests
verdes; build verde. Feature #26 permanece `in_progress` (NO la marqué `done`).

## Archivos nuevos

- `frontend-astro/tests/audits/site-audit.test.ts` — auditoría transversal (61
  casos). Recorre las 7 páginas + chrome con el patrón DOBLE del repo:
  - **Container API** (markup renderizado): landmarks (`1×<main id="main">`,
    header/nav/footer), skip-link→#main, `lang="es"`, `1×<h1>` por página,
    jerarquía de encabezados SIN saltos de nivel, accesibilidad del IntakeForm
    (`label`/`for`, `aria-describedby`, `aria-invalid`, `legend`, `role=status`/
    `role=alert`/`aria-live`), 1 sola familia de acento por documento
    (Inicio = Navy sin `data-accent`).
  - **`readFileSync` del source** (contratos de `<style>`/atributos): cero hex de
    marca fuera de `Layout.astro`, cero hex en `fill`/`stroke`/`style`, ausencia
    de gradiente/glow/shadow/dark mode/Tailwind CDN, bloque global
    `prefers-reduced-motion` presente y efectivo, transiciones conformes
    (color/opacity/transform/border, ≤200ms ease-out), sin `@keyframes`/parallax/
    typewriter, `:focus-visible` en interactivos sin `outline:none` huérfano.
  - **Cálculo WCAG**: recomputa el ratio de contraste sRGB de los tokens de texto
    sobre `--paper` (y `--ink` sobre `--paper-pure`) y exige ≥4.5:1.
  - Helpers: `styleCss()` (extrae el CSS real descartando el frontmatter de Astro
    —que menciona `<style is:global>` en comentarios— y los comentarios CSS) y
    `styleCssNoReducedMotion()` (excluye el bloque reduced-motion de los checks de
    animación/transición, ya que su cometido es justamente apagarlas).
- `progress/audit_26.md` — evidencia humana de la auditoría (checklist a11y/motion/
  palette por página + tabla de contraste).

## Archivos modificados (corrección mínima del único hallazgo)

- `frontend-astro/src/components/SectionDivider.astro` — nueva prop opcional
  `as?: "h2"|"h3"|...`. Cuando se pasa, el `label` se renderiza dentro de un
  encabezado REAL (conservando el tratamiento visual de eyebrow: mono,
  mayúsculas, `--accent`) y el contenedor deja de ser `role="separator"` (un
  encabezado no es un separador). Sin `as`, comportamiento idéntico al previo
  (`<div role="separator">` + `<span class="eyebrow">`). Se anuló el margen
  propio de los encabezados en `.eyebrow` para preservar el ritmo del divisor.
  **Cero cambio visual.**
- `frontend-astro/src/pages/index.astro` — `SectionDivider as="h2"` en el divisor
  "Memos Destacados" (introduce las 3 InsightCard, que usan `<h3>`).
- `frontend-astro/src/pages/practica.astro` — `as="h2"` en "Líneas de Servicio"
  (introduce las ServiceCard `<h3>`).
- `frontend-astro/src/pages/archivo.astro` — `as="h2"` en "Casos Seleccionados"
  (introduce las EngagementCard `<h3>`).

NO se tocó: `src/lib/`, `src/pages/api/*` (7 endpoints), `Layout.astro`,
`TopNavigation`, `Footer`, `PageShell`, ni los demás componentes/páginas.

## Hallazgos de la auditoría

1. **Salto de nivel de encabezado (VIOLACIÓN real, corregida).** `/`, `/practica`
   y `/archivo` saltaban de `<h1>` (EditorialHero) directo a `<h3>` (tarjetas),
   sin `<h2>` intermedio — incumple § ACCESSIBILITY "jerarquía de encabezados ...
   sin saltos de nivel". Las tarjetas usan `<h3>` por diseño y el divisor que
   introducía cada rejilla era un `<span>` no-semántico. **Corrección mínima:**
   convertir ESE divisor en un `<h2>` real vía la prop `as`. Las demás páginas ya
   eran correctas (`/metodologia` h1→h2→h3 vía WhitePaperLayout; `/memos`
   h1→h2→h3 vía QuarterlyArchive; `/la-firma` y `/admision` solo h1).
2. **a11y restante — sin violaciones.** Landmarks, skip-link, foco visible,
   accesibilidad del IntakeForm (labels/aria/estados) y `lang="es"` ya estaban
   correctos en todo el site map.
3. **Motion — sin violaciones.** Cero parallax/typewriter/keyframes/glow pulsante;
   solo transiciones puntuales de color/borde ≤200ms ease-out; el bloque global
   `prefers-reduced-motion` apaga animación y transición.
4. **Palette — sin violaciones.** Cero hex de marca fuera de la tabla de tokens de
   `Layout.astro` (en `<style>` y en atributos de estilo SVG); 1 familia de acento
   por documento (Inicio Navy neutro); sin gradiente/glow/dark mode/Tailwind CDN.
   Los hex de `src/pages/api/create-image.ts` son un string de prompt de un
   endpoint (fuera de alcance de presentación, no es CSS) — correctamente
   excluidos del scope de la auditoría de paleta.

## Cobertura de § ACCEPTANCE CRITERIA / § DEFINITION OF DONE

Tabla de mapeo criterio→test en `progress/audit_26.md` § 4. Resumen: cada criterio
auditable de la Phase 5 (a11y, motion, palette, headings, tokens, 1-acento,
no-CDN, no-prohibidos, init verde) tiene al menos un caso en
`site-audit.test.ts`; los criterios de contenido (6 enlaces, 4 bloques de Inicio,
no-`<img>`/rostro) ya estaban cubiertos por tests de features 16–25 y siguen
verdes. NO se modificó `src/lib/` ni `src/pages/api/` (criterio explícito).

## Conteo de tests antes / después

- Archivos de test: **39 → 40** (+1: `tests/audits/site-audit.test.ts`).
- Tests: **471 → 532** (+61, todos del nuevo archivo de auditoría).
- Cero regresiones: los 471 previos siguen verdes; los +61 nuevos pasan.

## Verificación

- `init.ps1` (raíz): **exit 0**. 8 archivos base `[OK]`, `feature_list.json`
  válido (26 features), `Test Files 40 passed (40) · Tests 532 passed (532)`,
  "[OK] Entorno listo."
- `npm run build --prefix frontend-astro`: **exit 0**. "Server built in 3.83s ·
  Complete!" (adapter Vercel), sin errores de import.

## Notas / deuda

- **Feature #26 NO marcada `done`** (decisión del leader/reviewer tras revisión).
- El `SectionDivider` con `as` es retrocompatible: los tests existentes de
  layout-primitives (que lo invocan sin `as`) siguen verdes sin tocarse.
- Sin commit: dejo el árbol con los cambios para que el leader cierre la feature.

**Firma del Agente Mictlán** · implementer · bit_guru · 2026-06-11
