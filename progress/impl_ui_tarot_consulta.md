# Impl UI — TarotSection + Consulta (feature 13, lote paralelo)

> Implementer 2 del lote. Solo toqué mis 4 archivos asignados + este informe.
> NO toqué Layout, index, feature_list, current.md, package.json, vitest.config,
> ni los otros 4 componentes. NO ejecuté init.ps1. NO marqué done. NO commiteé.

## Qué hice

### `src/components/TarotSection.astro`
- `<section id="tarot">` con fondo `var(--surface-section)`.
- 3 cartas hexagonales (`.hex-card`) con `clip-path: polygon(...)` (hex apuntado),
  fondo `var(--surface-hex)`, hover lift (`translateY(-12px)` + glow morado).
- Estado vacío: cada carta muestra un sigilo SVG abstracto (hexágono + círculo +
  cruz, inline, sin posiciones-como-arcano). Etiqueta secundaria pequeña de
  posición (Pasado/Presente/Futuro) arriba del nombre, como permite el brief §3.
- CTA `TIRAR 3 ARCANOS` = ÚNICO uso de `var(--rosa)` en mi entrega (botón ritual,
  glow rosa). `<script>` client: `fetch('/api/tirada')` → pinta `nombre` de cada
  arcano canónico devuelto, oculta el sigilo (`.is-revealed`), restaura el botón.
- Error cínico (brief §2): "Los espíritus tienen lag. Inténtalo de nuevo, mortal."
- Animaciones vía CSS `transition`, heredan el `prefers-reduced-motion` global del
  Layout (no añado lógica JS que se mueva ignorando la preferencia).
- `<style>` scoped. Solo tokens canónicos `var(--...)`; sin hex nuevos, sin ámbar,
  sin Tailwind CDN.

### `src/components/Consulta.astro`
- `<section id="consulta">` con fondo `var(--surface-card)`.
- `<textarea>` (label accesible) + botón `INVOCAR` con `var(--morado)` (marca,
  NUNCA rosa).
- `<script>` client: valida textarea vacío (no dispara, microcopy "Primero escribe
  algo, mortal…"); si hay texto hace `POST /api/pregunta` con `{ pregunta }`,
  Content-Type JSON, y pinta `data.respuesta` en un `<blockquote>`.
- Error cínico si falla el fetch / respuesta vacía: "Los espíritus tienen lag…".
- `<style>` scoped. Tokens canónicos; sin `var(--rosa)`, sin ámbar, sin CDN.

## Tests escritos
- `tests/components/TarotSection.test.ts` (8): id="tarot", 3 contenedores de
  carta, "TIRAR 3 ARCANOS" visible, fetch `/api/tirada`, `var(--rosa`, `clip-path`,
  microcopy cínico, ausencia de `#ffb954` y `cdn.tailwindcss.com`.
- `tests/components/Consulta.test.ts` (8): id="consulta", `<textarea`, "INVOCAR",
  POST a `/api/pregunta`, `var(--surface-card`, microcopy cínico, NO `var(--rosa`,
  NO `#ffb954`.

## Resultado
`npx vitest run tests/components/TarotSection.test.ts tests/components/Consulta.test.ts`
desde `frontend-astro/`:

```
Test Files  2 passed (2)
     Tests  16 passed (16)
```

Verde. Listo para review.
