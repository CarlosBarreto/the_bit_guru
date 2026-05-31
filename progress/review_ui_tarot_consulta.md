# Review — feature 13 (UI) · TarotSection.astro + Consulta.astro

**Reviewer:** 2 de 3 (lote paralelo). Alcance: solo `TarotSection.astro`, `Consulta.astro` y sus 2 tests.

**Veredicto:** APPROVED

## Tests
`cd frontend-astro && npx vitest run tests/components/TarotSection.test.ts tests/components/Consulta.test.ts`
→ **Test Files 2 passed (2) · Tests 16 passed (16)**. Verde.

## TarotSection.astro
- [x] `<section id="tarot">` presente (línea 11).
- [x] 3 cartas hex con `clip-path: polygon(...)` (hex apuntado, línea 111); `data-card` x3 confirmado por test de Container API.
- [x] Estado vacío = sigilo SVG abstracto (hexágono + círculo + cruz, `aria-hidden`, líneas 27-38), NO las posiciones como arcanos. Posición (Pasado/Presente/Futuro) va como etiqueta secundaria pequeña arriba del nombre — permitido por brief §3.
- [x] Botón **"TIRAR 3 ARCANOS"** (línea 49).
- [x] Al click `fetch('/api/tirada')` (línea 228); lee `tirada[i].nombre` y lo pinta en `[data-name]` con `is-revealed` (líneas 230-239). Consistente con el contrato GET de `tirada.ts` que devuelve `[{ nombre }]` x3.
- [x] Microcopy de error cínica: "Los espíritus tienen lag. Inténtalo de nuevo, mortal." (línea 241). Sin error técnico plano.

## --rosa (CRÍTICO)
- [x] `var(--rosa)` aparece **3 veces**, todas dentro de la regla `.tirar-btn` (background L180, box-shadow L186, hover box-shadow L191). Es el ÚNICO elemento que lo usa.
- [x] Consulta.astro: `var(--rosa)` = **0**. Correcto.
- [x] Token `--rosa: #ff2d95` definido canónicamente en Layout.astro L49 ("SOLO botón de tirada").

## Consulta.astro
- [x] `<section id="consulta">` (línea 10) con fondo `var(--surface-card)` (línea 41).
- [x] `<textarea>` (con `aria-label`, líneas 21-26) + botón **"INVOCAR"** (línea 29).
- [x] Al invocar: `POST /api/pregunta` con `{ pregunta }` y `Content-Type: application/json` (líneas 208-212); lee `data.respuesta` y la pinta en `<blockquote>` (líneas 214-216). Consistente con el contrato POST de `pregunta.ts`.
- [x] Textarea vacío manejado antes del fetch: microcopy "Primero escribe algo, mortal. El vacío no se consulta." sin disparar request (líneas 195-200).
- [x] NO usa `var(--rosa)`. Botón usa `var(--morado)` (marca).
- [x] Microcopy de error cínica idéntica al patrón (línea 218).

## Paleta (CRÍTICO)
- [x] grep `#ffb954` → 0 en ambos archivos.
- [x] grep `cdn.tailwindcss.com` → 0 en ambos archivos.
- [x] Solo tokens canónicos `var(--...)`; todos los referenciados (`--surface-section`, `--surface-card`, `--surface-hex`, `--morado`, `--morado-claro`, `--cyan`, `--rosa`, `--texto*`, `--font-*`) existen en Layout.astro.

## Convenciones / scope
- [x] `<style>` scoped en ambos componentes (Astro scoped por defecto, sin `is:global`).
- [x] Sin lógica que ignore `prefers-reduced-motion` (animaciones solo CSS `transition`; el global del Layout aplica).
- [x] Scope: del lote paralelo, los únicos archivos de mi asignación son los dos componentes + sus dos tests. No invadieron Layout, index, otros componentes ni feature_list/current.md (esos cambios son de otros implementers del mismo lote).

## Cambios requeridos
Ninguno.
