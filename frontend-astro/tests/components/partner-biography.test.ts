import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import PartnerBiographyBlock from "../../src/components/PartnerBiographyBlock.astro";

// Tests de PartnerBiographyBlock.astro (feature 18, Phase 2). Mismo patrón doble
// del repo (tests/components/editorial-hero.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (nombre/cargo, retrato SVG inline, AUSENCIA de <img>, slot/bio).
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (dos columnas, sello a una tinta, ausencia de hex/glow/gradiente).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const bioSource = source("../../src/components/PartnerBiographyBlock.astro");
const bioStyle = styleBlock(bioSource);

describe("PartnerBiographyBlock.astro — markup (Container API)", () => {
  it("renderiza nombre y cargo del socio (defaults canónicos)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PartnerBiographyBlock);
    expect(html).toMatch(/<p[^>]*class="[^"]*\bname\b[^>]*>[^<]*El Gurú de Bits/);
    expect(html).toMatch(/<p[^>]*class="[^"]*\brole\b[^>]*>[^<]*Socio Fundador/);
  });

  it("respeta los props name/role/bio cuando se pasan", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PartnerBiographyBlock, {
      props: {
        name: "El Gurú de Bits",
        role: "Socio Director",
        bio: "Custodia el Marco de los 22 Arcanos.",
      },
    });
    expect(html).toContain("Socio Director");
    expect(html).toContain("Custodia el Marco de los 22 Arcanos.");
  });

  it("NO contiene ningún <img> (retrato es SVG inline, sin foto)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PartnerBiographyBlock);
    expect(html).not.toContain("<img");
    // El retrato es un SVG inline marcado como decorativo.
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
  });

  it("renderiza el contenido del slot por defecto cuando se pasa", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PartnerBiographyBlock, {
      slots: {
        default: "<p data-marker>Opera entre los espacios muertos.</p>",
      },
    });
    expect(html).toContain("Opera entre los espacios muertos.");
  });
});

describe("PartnerBiographyBlock.astro — source (no rostro + dos columnas + tokens)", () => {
  it("el retrato es un sello SVG a una tinta, sin rostro ni fotorrealismo", () => {
    // Sin etiqueta de imagen rasterizada ni referencia a foto.
    expect(bioSource).not.toContain("<img");
    expect(bioSource.toLowerCase()).not.toContain("background-image");
    expect(bioSource.toLowerCase()).not.toContain("url(");
    // SVG inline presente, marcado como decorativo.
    expect(bioSource).toContain("<svg");
    expect(bioSource).toContain('aria-hidden="true"');
  });

  it("usa colores de tinta de tokens en el sello (--ink / --accent / --ink-rule)", () => {
    expect(bioSource).toContain('fill="var(--ink)"');
    expect(bioSource).toContain('stroke="var(--accent)"');
    expect(bioSource).toContain('stroke="var(--ink-rule)"');
  });

  it("dispone dos columnas en desktop y se apila en móvil", () => {
    expect(bioSource).toContain("grid-template-columns: 120px 1fr");
    expect(bioSource).toContain("grid-template-columns: 1fr");
  });

  it("estiliza el cargo en mono, mayúsculas y color --accent", () => {
    expect(bioSource).toContain("font-family: var(--font-mono)");
    expect(bioSource).toContain("text-transform: uppercase");
    expect(bioSource).toContain("letter-spacing: 0.08em");
    expect(bioSource).toContain("color: var(--accent)");
  });

  it("alinea a la izquierda y no introduce hex sueltos, gradiente o glow (CSS)", () => {
    const css = bioStyle.toLowerCase();
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });
});
