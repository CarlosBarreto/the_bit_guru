import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import FrameworkDiagram from "../../src/components/FrameworkDiagram.astro";

// Tests de FrameworkDiagram.astro (feature 20, Phase 3). Patrón doble del repo:
//   Método 1 — Container API: valida MARKUP (SVG, accesibilidad, etiquetas de
//     área, rejilla de 22 celdas, dos tintas via tokens).
//   Método 2 — readFileSync del SOURCE: valida el bloque <style> (sin
//     hex/gradiente/glow).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const diagramSource = source("../../src/components/FrameworkDiagram.astro");
const diagramStyle = styleBlock(diagramSource);

const AREAS = [
  "Diligencia Kármica",
  "Optimización del Karma Operativo",
  "Transformación Digital del Alma",
  "Gestión de Deuda Técnica Espiritual",
];

async function render(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(FrameworkDiagram, { props: { areas: AREAS } });
}

describe("FrameworkDiagram.astro — markup (Container API)", () => {
  it("renderiza un <svg> dentro de un <figure>", async () => {
    const html = await render();
    expect(html).toMatch(/<figure[^>]*class="[^"]*\bframework\b/);
    expect(html).toContain("<svg");
  });

  it("es informativo y accesible: role='img' con <title>/<desc> vinculados", async () => {
    const html = await render();
    expect(html).toMatch(/<svg[^>]*role="img"/);
    expect(html).toContain('aria-labelledby="framework-title framework-desc"');
    expect(html).toContain('id="framework-title"');
    expect(html).toContain('id="framework-desc"');
  });

  it("rotula cada área de práctica como texto real dentro del SVG", async () => {
    const html = await render();
    for (const area of AREAS) {
      expect(html).toContain(area);
    }
  });

  it("dibuja la rejilla de 22 dimensiones del marco", async () => {
    const html = await render();
    expect(html).toContain("Marco · 22 dimensiones");
  });

  it("usa DOS tintas estrictas vía tokens (--ink + --accent), sin otros colores", async () => {
    const html = await render();
    expect(html).toContain("var(--accent)");
    expect(html).toContain("var(--ink)");
  });

  it("NO usa gradiente ni sombra en el SVG renderizado", async () => {
    const html = await render().then((h) => h.toLowerCase());
    expect(html).not.toContain("gradient");
    expect(html).not.toContain("box-shadow");
    expect(html).not.toContain("drop-shadow");
    expect(html).not.toContain("filter=");
  });

  it("NO contiene ningún <img> (es SVG inline, sin fotografía)", async () => {
    const html = await render();
    expect(html).not.toContain("<img");
  });
});

describe("FrameworkDiagram.astro — source (tokens, sin prohibiciones)", () => {
  it("no introduce hex sueltos, gradiente ni glow en el CSS", () => {
    const css = diagramStyle.toLowerCase();
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });
});
