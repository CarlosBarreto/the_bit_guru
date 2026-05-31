import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Hero from "../../src/components/Hero.astro";

const heroSource = readFileSync(
  fileURLToPath(new URL("../../src/components/Hero.astro", import.meta.url)),
  "utf8",
);

const MORPHEUS_PHRASES = [
  "Bienvenido al desierto de lo real, mortal.",
  "Ay, incauto. Llegaste tarde, pero llegaste.",
  "Tomas la pastilla azul y todo termina aquí, mijo. Tomas la roja",
];

describe("Hero.astro — markup (Container API)", () => {
  it("renderiza el landmark id='hero'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero);
    expect(html).toContain('id="hero"');
  });

  it("muestra al menos una frase cínica de Morpheus/Gurú", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero);
    expect(MORPHEUS_PHRASES.some((p) => html.includes(p))).toBe(true);
  });

  it("CTA ancla a #consulta y no duplica 'DAME UNA SEÑAL'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero);
    expect(html).toContain('href="#consulta"');
    expect(html).toContain("PIDE TU LECTURA");
    expect(html).not.toContain("DAME UNA SEÑAL");
  });
});

describe("Hero.astro — source (SVG, motion, paleta)", () => {
  it("usa la fuente display canónica para el h1", () => {
    expect(heroSource).toContain("var(--font-display");
  });

  it("la figura del Gurú es SVG inline, no imagen raster", () => {
    expect(heroSource).toContain("<svg");
    expect(heroSource).not.toContain("<img");
  });

  it("respeta prefers-reduced-motion en el script", () => {
    expect(heroSource).toContain("matchMedia");
    expect(heroSource).toContain("prefers-reduced-motion");
  });

  it("no usa ámbar prohibido ni Tailwind por CDN", () => {
    expect(heroSource).not.toMatch(/#ffb954/i);
    expect(heroSource).not.toMatch(/#ffddb4/i);
    expect(heroSource).not.toContain("cdn.tailwindcss.com");
  });
});
