# Fundación UI — feature 13 (ui_port_astro)

> Escrito por el implementer-fundación el 2026-05-30. **Léelo antes de rellenar
> tu componente.** Aquí está el contrato compartido para que los 3 implementers
> del lote paralelo trabajen SIN colisionar.

---

## Estado

- `npx astro build`: VERDE (la landing compila con los stubs).
- `.\init.ps1`: VERDE (13 features, 1 `in_progress`=13; 67 tests pasan = 63 previos + 4 nuevos).
- Feature 13 queda en `in_progress`. NO la marquen `done`.

---

## A. Tokens canónicos (en `src/layouts/Layout.astro`, `:root`)

Estos son el CONTRATO. Consúmanlos con `var(--x)`. **No introduzcan otros hex.**
Regla de roles (brief §1, PERSONA §8): morado = marca/primario · cyan =
interactivo/místico · **rosa = SOLO el botón de tirada**.

```
--bg: #0A0A0F            negro profundo, fondo
--surface-footer: #050508
--surface-section: #15151E   fondo de secciones
--surface-card: #1F1F2E      card de consulta
--surface-hex: #2A2A40       cartas hex y botones secundarios
--morado: #7B2CBF            MARCA / primario
--morado-claro: #D4BBFF      hover/highlight
--cyan: #00F0FF              interactivo / místico
--rosa: #FF2D95              CTA crítico: SOLO botón de tirada
--texto: #E8E8F0             texto base
--texto-fuerte: #FFFFFF
--font-head:    "Plus Jakarta Sans", system-ui, sans-serif
--font-body:    "Be Vietnam Pro", system-ui, sans-serif
--font-mono:    "JetBrains Mono", ui-monospace, monospace
--font-display: "Playfair Display", Georgia, serif   (solo H1 del Gurú)
```

## Fuentes

Cargadas en `Layout.astro` vía `<link>` de Google Fonts con preconnect:
Plus Jakarta Sans, Be Vietnam Pro, JetBrains Mono, Playfair Display. **No
añadan más `<link>` de fuentes ni `cdn.tailwindcss.com`.** Material Symbols NO
se carga: si necesitan íconos, usen SVG inline (brief §notas técnicas).

## Base global (ya resuelto en Layout)

- `box-sizing: border-box` global.
- `body { background: var(--bg); color: var(--texto); font-family: var(--font-body); margin: 0; }`
- `@media (prefers-reduced-motion: reduce)` global que apaga `animation`,
  `transition` y `scroll-behavior` en `*`. **Sus animaciones (typewriter,
  parallax, fade-in) heredan esta desactivación**, pero aun así eviten lógica JS
  que se mueva ignorando la preferencia: chequeen
  `window.matchMedia("(prefers-reduced-motion: reduce)").matches` en los scripts.

---

## B. Ensamblaje (`src/pages/index.astro`)

Ya importa y coloca los 6 componentes en este orden, dentro del `Layout`:

```
<Nav /> <Hero /> <TarotSection /> <Consulta /> <Sabiduria /> <Footer />
```

NO añadan estilos inline en `index.astro`. Cada componente trae su propio
`<style>` (scoped). NO toquen el orden ni el import sin coordinar.

## C. Stubs creados (su archivo y su `id` de landmark son FIJOS)

| Archivo | Landmark + id | Qué va dentro (su trabajo) |
|---|---|---|
| `src/components/Nav.astro` | `<nav id="nav">` | nav sticky, links, CTA "PIDE TU LECTURA" |
| `src/components/Hero.astro` | `<section id="hero">` | SVG encapuchado (sin cara), H1 display, typewriter cínico rotando frases Morpheus, parallax de blobs (blob morado, NO ámbar) |
| `src/components/TarotSection.astro` | `<section id="tarot">` | 3 cartas hex con `clip-path`, arcanos canónicos de `lib/tarot.ts`, CTA rosa "TIRAR 3 ARCANOS" |
| `src/components/Consulta.astro` | `<section id="consulta">` | textarea + botón cyan "INVOCAR RESPUESTA", microcopy de error NO técnico ("Los espíritus tienen lag…") |
| `src/components/Sabiduria.astro` | `<section id="sabiduria">` | card de tweet, handle **@ElGuruDeBits**, bio "Habitando los espacios muertos entre paquetes", avatar SVG sin cara realista |
| `src/components/Footer.astro` | `<footer id="footer">` | tagline cínico "…y si eso te tranquiliza, créelo.", frase "Si llegaste hasta aquí, ya sabes quién soy.", hashtags, sin año fijo (o © 2026) |

Cada stub tiene el comentario `<!-- TODO(feature13): lo rellena el implementer
del lote paralelo -->`. Reemplacen el contenido placeholder, **conserven el
landmark y su `id`**.

### Reparto sugerido (sin colisiones)

- Implementer 1: `Nav.astro` + `Hero.astro` (incluye el SVG del Gurú + typewriter + parallax).
- Implementer 2: `TarotSection.astro` + `Consulta.astro` (consumen endpoints `/api/tirada`, `/api/pregunta`).
- Implementer 3: `Sabiduria.astro` + `Footer.astro`.

`Layout.astro` e `index.astro` están CERRADOS por la fundación: no los editen
salvo bloqueo coordinado con el líder.

---

## D. Infra de test — qué método usar

Config nueva: **`frontend-astro/vitest.config.ts`** usa `getViteConfig` de
`astro/config` para que vitest pueda compilar `.astro`. No la toquen.

Patrón vivo en **`tests/components/foundation.test.ts`**. Hay DOS métodos y
ambos están validados:

### Método 1 — Astro Container API (para MARKUP)

Sirve para assertear sobre el HTML renderizado: `id`s, texto, slots, atributos,
presencia de `<link>` de fuentes, ausencia de `cdn.tailwindcss.com`.

```ts
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Hero from "../../src/components/Hero.astro";

const container = await AstroContainer.create();
const html = await container.renderToString(Hero, {
  // props: { ... },          // si el componente recibe props
  // slots: { default: "..." } // si tiene slots (p. ej. Layout)
});
expect(html).toContain('id="hero"');
```

**LIMITACIÓN IMPORTANTE**: `renderToString` **NO incluye el contenido de
`<style>`** (ni scoped ni `is:global`) — Astro extrae el CSS a assets aparte.
Por tanto NO assertee hex/tokens/keyframes contra el HTML del Container. Use el
método 2 para eso. (Los comentarios HTML `<!-- -->` sí aparecen en el output;
por eso evité poner el literal `cdn.tailwindcss.com` en un comentario del
Layout.)

### Método 2 — leer el SOURCE del `.astro` (para CSS / tokens / copy en `<style>`)

Para validar que un componente usa los tokens canónicos, que el blob es morado
y no ámbar, que el CTA usa `var(--rosa)`, etc.:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = readFileSync(
  fileURLToPath(new URL("../../src/components/Tarot Section.astro", import.meta.url)),
  "utf8",
);
expect(src).toContain("var(--rosa)");      // CTA de tirada usa rosa
expect(src).not.toMatch(/#ffb954/i);        // sin ámbar del mockup
```

### Resumen de qué método para qué assertion

- ids, texto visible, handle @ElGuruDeBits, ausencia de imágenes raster, slots → **Método 1**.
- tokens `var(--x)`, hex prohibidos (ámbar), `clip-path` hex-card, `prefers-reduced-motion`, keyframes → **Método 2**.

Pongan sus tests en `tests/components/<Componente>.test.ts`.
