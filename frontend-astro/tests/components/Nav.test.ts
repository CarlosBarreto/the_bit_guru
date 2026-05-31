import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Nav from "../../src/components/Nav.astro";

// Tests de Nav.astro (feature 13). Método 1 (Container API) para markup;
// método 2 (source) para tokens/paleta — el <style> no aparece en renderToString.

const navSource = readFileSync(
  fileURLToPath(new URL("../../src/components/Nav.astro", import.meta.url)),
  "utf8",
);

describe("Nav.astro — markup (Container API)", () => {
  it("mantiene el landmark <nav id='nav'> con la marca", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav);
    expect(html).toContain('id="nav"');
    expect(html).toContain("El Gurú");
    expect(html).toContain("de Bits");
  });

  it("incluye links a las tres secciones", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav);
    expect(html).toContain('href="#tarot"');
    expect(html).toContain('href="#consulta"');
    expect(html).toContain('href="#sabiduria"');
  });

  it("expone el CTA 'PIDE TU LECTURA' apuntando a #consulta", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav);
    expect(html).toContain("PIDE TU LECTURA");
    // El nav no debe duplicar el CTA del hero (brief §2).
    expect(html).not.toContain("DAME UNA SEÑAL");
  });

  it("declara aria-label en el nav (accesibilidad)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Nav);
    expect(html).toMatch(/<nav[^>]*aria-label=/);
  });
});

describe("Nav.astro — source (paleta canónica)", () => {
  it("usa tokens var(--...) y es sticky", () => {
    expect(navSource).toContain("position: sticky");
    expect(navSource).toContain("var(--morado");
    expect(navSource).toContain("var(--cyan");
  });

  it("no usa ámbar del mockup ni Tailwind por CDN", () => {
    expect(navSource).not.toMatch(/#ffb954/i);
    expect(navSource).not.toMatch(/#ffddb4/i);
    expect(navSource).not.toContain("cdn.tailwindcss.com");
  });

  it("no usa --rosa (reservado para el CTA de tirada)", () => {
    expect(navSource).not.toContain("var(--rosa");
  });
});
