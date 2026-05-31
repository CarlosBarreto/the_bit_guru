# Impl UI — Hero.astro + Sabiduria.astro (feature 13, lote paralelo)

> Implementer 1-de-3. Reparto: Hero + Sabiduria (copy-heavy + Gemini).
> 2026-05-30.

## Qué hice

### Hero.astro (`src/components/Hero.astro`)
- Conservé el landmark `<section id="hero">`.
- H1 "El Gurú de Bits" en `var(--font-display)` (Playfair), con glow morado.
- Subtítulo typewriter cínico en `<script>` client-side que rota entre las 3
  frases Morpheus del brief §2. Las frases viajan en `data-phrases` (JSON) para
  que el markup las contenga y el test las pueda assertear.
- **prefers-reduced-motion**: el script chequea
  `window.matchMedia("(prefers-reduced-motion: reduce)").matches`; si está
  activo NO anima — muestra la primera frase completa fija.
- CTA único "PIDE TU LECTURA" anclado a `#consulta`. Sin "DAME UNA SEÑAL"
  (eliminada la duplicación, brief §2).
- Imagen del hero = **SVG inline** de silueta encapuchada (capucha + capa, SIN
  cara), dos puntos `var(--cyan)` brillantes como ojos. PROHIBIDO `<img>` /
  fotorrealismo respetado (brief §6, PERSONA §8).
- Blob atmosférico morado (`rgba(123,44,191,...)`), NO ámbar.
- `<style>` scoped, solo tokens canónicos `var(--...)`.

### Sabiduria.astro (`src/components/Sabiduria.astro`)
- Conservé el landmark `<section id="sabiduria">`.
- Card tipo tweet con fondo `var(--surface-card)`.
- Fetch client-side a `/api/wisdom-tweet` → `{ tweet }`, lo pinta en el body.
  Botón "Otra señal" para regenerar.
- Handle **@ElGuruDeBits** (brief §4 — nunca @ElTioBits). Bio:
  **"Habitando los espacios muertos entre paquetes"** (no "Consejo del día").
- Avatar = **SVG ilustrativo** encapuchado sin cara realista (PERSONA §8).
- Microcopy de error cínico: **"Los espíritus tienen lag. Inténtalo de nuevo,
  mortal."** (en `data-error`, usada en el catch del fetch y en respuesta vacía).
  No errores técnicos.
- `<style>` scoped, solo tokens canónicos.

## Paleta
- Solo tokens canónicos vía `var(--...)`. Sin ámbar/naranja, sin `--rosa` (es de
  la CTA de tirada), sin `cdn.tailwindcss.com`.

## Verificación

```
cd frontend-astro
npx vitest run tests/components/Hero.test.ts tests/components/Sabiduria.test.ts
```

Resultado: **2 test files, 14 tests passed**.

- Hero: id="hero", frase Morpheus presente, CTA #consulta sin "DAME UNA SEÑAL",
  h1 con `var(--font-display`, `<svg` sin `<img`, `matchMedia` +
  `prefers-reduced-motion`, sin `#ffb954`/`#ffddb4`/`cdn.tailwindcss.com`.
- Sabiduria: @ElGuruDeBits sin @ElTioBits, bio canónica sin "Consejo del día",
  `/api/wisdom-tweet`, microcopy "Los espíritus tienen lag", `<svg` avatar sin
  `<img`, sin ámbar/CDN.

## Alcance respetado
- Solo toqué: `Hero.astro`, `Sabiduria.astro`, sus 2 tests y este informe.
- NO toqué Layout, index, feature_list, package.json, vitest.config, ni los
  otros 4 componentes. NO ejecuté init.ps1. NO marqué done. NO commiteé.
