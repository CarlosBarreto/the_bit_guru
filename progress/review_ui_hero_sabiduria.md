# Review — feature 13 (UI port Astro) · Hero.astro + Sabiduria.astro

**Reviewer:** 1-de-3 (lote paralelo). Alcance: `Hero.astro`, `Sabiduria.astro` y sus 2 tests.
**Fecha:** 2026-05-30

**Veredicto:** APPROVED

## Tests
`cd frontend-astro && npx vitest run tests/components/Hero.test.ts tests/components/Sabiduria.test.ts`
→ **2 test files, 14 tests passed** (verde). Coincide con lo reportado en `impl_ui_hero_sabiduria.md`.

## Checkpoints

### Hero.astro
- C-Hero-1: [x] `<section id="hero">` presente (línea 10).
- C-Hero-2: [x] H1 en `var(--font-display)` / Playfair (línea 131); H1 "El Gurú de Bits" (línea 13).
- C-Hero-3: [x] Typewriter con frases Morpheus del brief §2 — las 3 canónicas en `data-phrases` (líneas 17-19): "Bienvenido al desierto de lo real, mortal.", "Ay, incauto…", "Tomas la pastilla azul…".
- C-Hero-4: [x] `prefers-reduced-motion` respetado en el `<script>`: `window.matchMedia("(prefers-reduced-motion: reduce)")` (línea 74); si activo no anima, muestra frase fija (líneas 104-107).
- C-Hero-5: [x] Imagen = `<svg` inline (líneas 27-57): silueta encapuchada (capa + capucha sin cara), ojos cyan `var(--cyan)` (líneas 55-56). NO hay `<img>` (grep → 0). `aria-hidden` en figura + `aria-label` en svg. Cumple PERSONA §8 / brief §6.
- C-Hero-6: [x] CTA "PIDE TU LECTURA" ancla a `#consulta` (línea 21); sin "DAME UNA SEÑAL" (grep → 0).

### Sabiduria.astro
- C-Sab-1: [x] `<section id="sabiduria">` presente (línea 10).
- C-Sab-2: [x] Fetch a `/api/wisdom-tweet` (línea 55); botón "Otra señal" re-dispara `loadWisdom`.
- C-Sab-3: [x] Handle `@ElGuruDeBits` (línea 28); `@ElTioBits` → grep 0 ocurrencias (brief §4).
- C-Sab-4: [x] Bio "Habitando los espacios muertos entre paquetes" (línea 29); "Consejo del día" ausente.
- C-Sab-5: [x] Avatar `<svg` ilustrativo encapuchado, ojos cyan, sin cara realista (líneas 16-24). NO `<img>`.
- C-Sab-6: [x] Microcopy de error cínica "Los espíritus tienen lag. Inténtalo de nuevo, mortal." en `data-error` (línea 33) y usada en el catch del fetch (líneas 49, 59-62). Sin errores técnicos planos.

### Paleta (CRÍTICO)
- C-Pal-1: [x] `#ffb954` / `#ffddb4` / "ámbar" → grep 0 ocurrencias en ambos componentes.
- C-Pal-2: [x] `var(--rosa` → grep 0 (rosa reservado para CTA de tirada, no aplica aquí).
- C-Pal-3: [x] `cdn.tailwindcss.com` → grep 0.
- C-Pal-4: [x] Solo tokens canónicos vía `var(--...)`. Todos los usados (`--bg`, `--morado`, `--morado-claro`, `--cyan`, `--surface-hex`, `--surface-card`, `--surface-section`, `--texto`, `--texto-fuerte`, `--font-display/head/body/mono`) están definidos en `Layout.astro` (líneas 41-55). Sin literales hex sueltos salvo `rgba(123,44,191,...)` y `rgba(0,240,255,...)` en sombras/blob, que corresponden a morado/cyan canónicos.

### Convenciones y alcance
- C-Conv-1: [x] `<style>` scoped (Astro lo aísla por defecto) en ambos componentes.
- C-Conv-2: [x] Cabecera de comentarios documentando intención y referencias (brief/PERSONA) en ambos.
- C-Scope-1: [x] Alcance respetado. Untracked nuevos: `src/components/Hero.astro`, `src/components/Sabiduria.astro`, `tests/components/Hero.test.ts`, `tests/components/Sabiduria.test.ts`. Las modificaciones tracked (`Layout.astro`, `index.astro`, `feature_list.json`, `progress/current.md`) pertenecen a los otros implementers del lote paralelo (foundation/nav/tarot), no a esta entrega.

## Cambios requeridos
Ninguno.

## Notas (no bloqueantes)
- `data-phrases` se sirve en el markup y el `<script>` lo parsea con try/catch → robusto y testeable. Buen patrón anti-flicker.
- El SVG del hero lleva `aria-hidden="true"` en el contenedor figura pero el `<svg>` interno tiene `role="img"`+`aria-label`; el `aria-hidden` del padre lo oculta a AT de todos modos (decorativo) — consistente, sin acción requerida.
