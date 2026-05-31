import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Footer from "../../src/components/Footer.astro";

// Tests de Footer.astro (feature 13). Método 1 (Container API) para copy/markup;
// método 2 (source) para tokens/paleta — el <style> no aparece en renderToString.

const footerSource = readFileSync(
  fileURLToPath(new URL("../../src/components/Footer.astro", import.meta.url)),
  "utf8",
);

describe("Footer.astro — markup (Container API)", () => {
  it("mantiene el landmark <footer id='footer'>", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);
    expect(html).toContain('id="footer"');
  });

  it("incluye la frase canónica y el tagline cínico (brief §2/§5)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);
    expect(html).toContain("ya sabes quién soy");
    expect(html).toContain("créelo");
  });

  it("no fija el año 2024 (brief §5: el Gurú está fuera del tiempo)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Footer);
    expect(html).not.toContain("2024");
  });
});

describe("Footer.astro — source (paleta canónica)", () => {
  it("usa el fondo del footer var(--surface-footer)", () => {
    expect(footerSource).toContain("var(--surface-footer");
  });

  it("no usa ámbar del mockup ni Tailwind por CDN", () => {
    expect(footerSource).not.toMatch(/#ffb954/i);
    expect(footerSource).not.toMatch(/#ffddb4/i);
    expect(footerSource).not.toContain("cdn.tailwindcss.com");
  });

  it("no usa --rosa (reservado para el CTA de tirada)", () => {
    expect(footerSource).not.toContain("var(--rosa");
  });

  it("no fija el año 2024 en el source", () => {
    expect(footerSource).not.toContain("2024");
  });
});
