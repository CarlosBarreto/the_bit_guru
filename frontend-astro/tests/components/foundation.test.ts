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

  it("Layout carga la fuente serif editorial canónica (Source Serif 4)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Layout, {
      props: { title: "test" },
      slots: { default: "" },
    });
    expect(html).toContain("Source+Serif+4");
    // No debe arrastrar Tailwind por CDN (HARD PROHIBITIONS de la spec).
    expect(html).not.toContain("cdn.tailwindcss.com");
  });
});

describe("fundación UI — source (tokens y CSS)", () => {
  // El contrato exhaustivo de tokens vive en tests/layouts/layout-tokens.test.ts
  // (feature 14). Aquí solo se confirma que la fundación migró al sistema
  // editorial y que el bloque de accesibilidad se conserva.
  it("Layout define los tokens editoriales canónicos de la spec", () => {
    const src = layoutSource.toLowerCase();
    expect(src).toContain("--paper: #f6f4ee");
    expect(src).toContain("--ink: #16293b");
    expect(src).toContain("--accent: var(--ink)");
  });

  it("Layout incluye el bloque prefers-reduced-motion", () => {
    expect(layoutSource).toContain("prefers-reduced-motion");
  });
});
