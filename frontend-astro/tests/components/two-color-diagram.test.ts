import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import TwoColorDiagram from "../../src/components/TwoColorDiagram.astro";
import { ARCANOS } from "../../src/lib/tarot";

// Tests de TwoColorDiagram.astro (feature 21, Phase 3). Patrón doble del repo:
//   Método 1 — Container API: render con los 22 ARCANOS REALES de lib/tarot.ts
//     (sin fixture renombrado): figure + svg accesible, 22 celdas, códigos
//     romanos como <text>, nombre canónico completo en el <title> de cada celda.
//   Método 2 — readFileSync del SOURCE: dos tintas estrictas DENTRO del SVG
//     (solo var(--ink) y var(--accent)), sin hex/gradiente/sombra.

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const diagramSource = source("../../src/components/TwoColorDiagram.astro");

function svgBlock(src: string): string {
  const match = src.match(/<svg[\s\S]*?<\/svg>/);
  return match ? match[0] : "";
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

async function render(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(TwoColorDiagram, {
    props: { dimensions: ARCANOS },
  });
}

describe("TwoColorDiagram.astro — markup (Container API, ARCANOS reales)", () => {
  it("renderiza un <svg> accesible dentro de un <figure>", async () => {
    const html = await render();
    expect(html).toMatch(/<figure[^>]*class="[^"]*\btwo-color\b/);
    expect(html).toMatch(/<svg[^>]*role="img"/);
    expect(html).toContain('aria-labelledby="two-color-title two-color-desc"');
    expect(html).toContain('id="two-color-title"');
    expect(html).toContain('id="two-color-desc"');
  });

  it("dibuja exactamente 22 celdas (una por arcano de lib/tarot.ts)", async () => {
    const html = await render();
    expect(ARCANOS).toHaveLength(22);
    const cellCount = (html.match(/class="cell[\s"]/g) ?? []).length;
    expect(cellCount).toBe(22);
  });

  it("rotula el código romano de cada arcano como <text> (sin renombrar)", async () => {
    const html = await render();
    for (const canonical of ARCANOS) {
      const code = canonical.split(" - ")[0];
      expect(html).toMatch(new RegExp(`>\\s*${code}\\s*</text>`));
    }
  });

  it("cada celda lleva <title> con el nombre canónico COMPLETO del arcano", async () => {
    const html = await render();
    for (const canonical of ARCANOS) {
      expect(html).toContain(`<title>${canonical}</title>`);
    }
  });

  it("incluye la etiqueta del marco y el nodo de convergencia", async () => {
    const html = await render();
    expect(html).toContain("El Marco · 22 dimensiones · vista completa");
    expect(html).toContain("DIAGNÓSTICO PRELIMINAR");
    expect(html).toContain("<polygon");
  });

  it("NO usa gradiente, sombra, filtro ni <img>", async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("box-shadow");
    expect(lower).not.toContain("drop-shadow");
    expect(lower).not.toContain("filter=");
    expect(html).not.toContain("<img");
  });
});

describe("TwoColorDiagram.astro — source (dos tintas estrictas)", () => {
  it("dentro del SVG solo existen DOS tintas: var(--ink) y var(--accent)", () => {
    const svg = svgBlock(diagramSource);
    expect(svg).not.toBe("");
    const tokens = svg.match(/var\(--[a-z-]+\)/g) ?? [];
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      expect(["var(--ink)", "var(--accent)"]).toContain(token);
    }
  });

  it("el SVG usa ambas tintas (no es monocromo)", () => {
    const svg = svgBlock(diagramSource);
    expect(svg).toContain("var(--ink)");
    expect(svg).toContain("var(--accent)");
  });

  it("no introduce hex sueltos, gradiente ni glow en el CSS ni en el SVG", () => {
    for (const block of [styleBlock(diagramSource), svgBlock(diagramSource)]) {
      const lower = block.toLowerCase();
      expect(lower).not.toMatch(/#[0-9a-f]{3,8}\b/);
      expect(lower).not.toContain("gradient");
      expect(lower).not.toContain("box-shadow");
      expect(lower).not.toContain("text-shadow");
      expect(lower).not.toContain("drop-shadow");
    }
  });

  it("usa --font-mono para los códigos romanos y las etiquetas", () => {
    expect(diagramSource).toContain("var(--font-mono)");
    expect(diagramSource).toContain("cell-code");
  });
});
