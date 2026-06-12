import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Container from "../../src/components/Container.astro";
import Prose from "../../src/components/Prose.astro";
import SectionDivider from "../../src/components/SectionDivider.astro";

// Tests de los primitivos de layout (feature 15, Phase 1). Mismo patrón doble
// de tests/components/foundation.test.ts:
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (slots, props, estructura del DOM). El <style> NO aparece aquí.
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (tokens var(--...), ausencia de hex sueltos / glow / gradiente).

function source(relPath: string): string {
  return readFileSync(
    fileURLToPath(new URL(relPath, import.meta.url)),
    "utf8",
  );
}

const containerSource = source("../../src/components/Container.astro");
const proseSource = source("../../src/components/Prose.astro");
const dividerSource = source("../../src/components/SectionDivider.astro");

describe("Container.astro — markup (Container API)", () => {
  it("renderiza el slot dentro de un contenedor con clase 'container'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Container, {
      slots: { default: "<p data-marker>contenido editorial</p>" },
    });
    expect(html).toContain("contenido editorial");
    expect(html).toMatch(/class="[^"]*\bcontainer\b/);
  });

  it("usa <div> por defecto y respeta la prop 'as' para la semántica", async () => {
    const container = await AstroContainer.create();
    const def = await container.renderToString(Container, {
      slots: { default: "x" },
    });
    expect(def).toMatch(/<div[^>]*class="[^"]*\bcontainer\b/);

    const asSection = await container.renderToString(Container, {
      props: { as: "section" },
      slots: { default: "x" },
    });
    expect(asSection).toMatch(/<section[^>]*class="[^"]*\bcontainer\b/);
  });

  it("permite añadir una clase extra vía prop 'class'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Container, {
      props: { class: "extra" },
      slots: { default: "x" },
    });
    expect(html).toMatch(/class="[^"]*\bcontainer\b[^"]*\bextra\b|class="[^"]*\bextra\b[^"]*\bcontainer\b/);
  });
});

describe("Container.astro — source (rejilla y tokens)", () => {
  it("define una rejilla de 12 columnas centrada a max-width 1200px", () => {
    expect(containerSource).toContain("grid-template-columns: repeat(12, 1fr)");
    expect(containerSource).toContain("max-width: 1200px");
    expect(containerSource).toContain("margin-inline: auto");
  });

  it("usa el gutter de la escala (--space-5) y márgenes de la escala --space-*", () => {
    expect(containerSource).toContain("var(--space-5)");
    expect(containerSource).toMatch(/padding-inline: var\(--space-\d+\)/);
  });

  it("no introduce hex sueltos, gradiente, glow ni Tailwind por CDN", () => {
    const src = containerSource.toLowerCase();
    expect(src).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(src).not.toContain("gradient");
    expect(src).not.toContain("box-shadow");
    expect(src).not.toContain("cdn.tailwindcss.com");
  });
});

describe("Prose.astro — medida de lectura", () => {
  it("renderiza el slot de prosa (Container API)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Prose, {
      slots: { default: "<p data-marker>carta del socio</p>" },
    });
    expect(html).toContain("carta del socio");
    expect(html).toMatch(/class="[^"]*\bprose\b/);
  });

  it("limita el ancho a var(--measure) y alinea a la izquierda (source)", () => {
    expect(proseSource).toContain("max-width: var(--measure)");
    expect(proseSource).toContain("text-align: left");
    // Prosa NO centrada (HARD PROHIBITIONS).
    expect(proseSource).not.toContain("text-align: center");
  });

  it("usa line-height de cuerpo y la familia serif editorial", () => {
    expect(proseSource).toContain("line-height: 1.6");
    expect(proseSource).toContain("font-family: var(--font-serif)");
  });
});

describe("SectionDivider.astro — markup (Container API)", () => {
  it("renderiza el filete sin eyebrow cuando no recibe label", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionDivider);
    expect(html).toMatch(/class="[^"]*\bsection-divider\b/);
    expect(html).toContain('role="separator"');
    expect(html).not.toContain("eyebrow");
  });

  it("renderiza el eyebrow con el texto del label cuando se pasa", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SectionDivider, {
      props: { label: "Áreas de Práctica" },
    });
    expect(html).toContain("Áreas de Práctica");
    expect(html).toMatch(/class="eyebrow"/);
  });
});

describe("SectionDivider.astro — source (filete + eyebrow)", () => {
  it("dibuja un filete de 1px solid var(--ink-rule)", () => {
    expect(dividerSource).toContain("border-top: 1px solid var(--ink-rule)");
  });

  it("estiliza el eyebrow en mono, mayúsculas, --step--1 y color --accent", () => {
    expect(dividerSource).toContain("font-family: var(--font-mono)");
    expect(dividerSource).toContain("text-transform: uppercase");
    expect(dividerSource).toContain("letter-spacing: 0.08em");
    expect(dividerSource).toContain("font-size: var(--step--1)");
    expect(dividerSource).toContain("color: var(--accent)");
  });

  it("alinea a la izquierda y no introduce hex/gradiente/glow", () => {
    const src = dividerSource.toLowerCase();
    expect(src).toContain("text-align: left");
    expect(src).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(src).not.toContain("gradient");
    expect(src).not.toContain("box-shadow");
  });
});
