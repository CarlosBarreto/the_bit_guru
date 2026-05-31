import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Layout from "../../src/layouts/Layout.astro";

// Infra de test para los componentes de la feature 13. Dos métodos, ambos
// validados aquí como patrón para el lote paralelo:
//
//   1. Astro Container API (`experimental_AstroContainer`) → renderiza el
//      MARKUP del componente y se assertea sobre el HTML (slots, props, ids,
//      texto). NOTA: el contenido de `<style>` (scoped o is:global) NO aparece
//      en `renderToString`; el pipeline lo extrae a CSS aparte. Para tokens/CSS
//      usar el método 2.
//   2. Lectura del SOURCE del `.astro` con readFileSync → assertear sobre el
//      bloque `<style>` (tokens, hex canónicos, media queries).
//
// Componentes con slot/props: pasar
//   container.renderToString(Comp, { props: {...}, slots: { default: "..." } })

const layoutSource = readFileSync(
  fileURLToPath(new URL("../../src/layouts/Layout.astro", import.meta.url)),
  "utf8",
);

describe("fundación UI (feature 13) — Container API (markup)", () => {
  it("Layout renderiza el slot y mantiene lang='es'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "test" },
      slots: { default: "<p data-marker>hola mortal</p>" },
    });
    expect(html).toContain('lang="es"');
    expect(html).toContain("hola mortal");
  });

  it("Layout carga la fuente display canónica (Playfair Display)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "test" },
      slots: { default: "" },
    });
    expect(html).toContain("Playfair+Display");
    // No debe arrastrar Tailwind por CDN (brief §notas técnicas).
    expect(html).not.toContain("cdn.tailwindcss.com");
  });
});

describe("fundación UI (feature 13) — source (tokens y CSS)", () => {
  it("Layout define los tokens canónicos del brief §1 / PERSONA §8", () => {
    const src = layoutSource.toLowerCase();
    expect(src).toContain("--morado: #7b2cbf");
    expect(src).toContain("--cyan: #00f0ff");
    expect(src).toContain("--rosa: #ff2d95");
    expect(src).toContain("--bg: #0a0a0f");
  });

  it("Layout incluye el bloque prefers-reduced-motion", () => {
    expect(layoutSource).toContain("prefers-reduced-motion");
  });
});
