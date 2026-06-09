import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import EditorialHero from "../../src/components/EditorialHero.astro";

// Tests de EditorialHero.astro (feature 17, Phase 2). Mismo patrón doble del
// repo (tests/components/layout-primitives.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (H1, props opcionales presentes/ausentes en el DOM). El <style> NO aparece.
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (tokens var(--...), familia serif, ausencia de hex/glow/gradiente).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

// Extrae el bloque <style> del .astro. La auditoría de paleta (hex / gradiente /
// glow) aplica al CSS, no a los comentarios en prosa de la cabecera.
function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const heroSource = source("../../src/components/EditorialHero.astro");
const heroStyle = styleBlock(heroSource);

describe("EditorialHero.astro — markup (Container API)", () => {
  it("renderiza un <h1> con el title dentro de un <section>", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EditorialHero, {
      props: {
        title:
          "Asesoría estratégica para organizaciones que ya agotaron las soluciones racionales.",
      },
    });
    expect(html).toMatch(/<section[^>]*class="[^"]*\beditorial-hero\b/);
    expect(html).toMatch(
      /<h1[^>]*class="[^"]*\btitle\b[^>]*>[^<]*Asesoría estratégica/,
    );
  });

  it("incluye el eyebrow SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(EditorialHero, {
      props: { title: "La Firma" },
    });
    expect(sin).not.toContain('class="eyebrow"');

    const con = await container.renderToString(EditorialHero, {
      props: { title: "La Firma", eyebrow: "Sobre la Firma" },
    });
    expect(con).toContain('class="eyebrow"');
    expect(con).toContain("Sobre la Firma");
  });

  it("incluye el deck SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(EditorialHero, {
      props: { title: "La Firma" },
    });
    expect(sin).not.toContain('class="deck"');

    const con = await container.renderToString(EditorialHero, {
      props: {
        title: "La Firma",
        deck: "Operamos desde los espacios muertos entre paquetes.",
      },
    });
    expect(con).toContain('class="deck"');
    expect(con).toContain("Operamos desde los espacios muertos entre paquetes.");
  });

  it("omite el CTA del DOM cuando no hay ctaHref y lo incluye cuando sí", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(EditorialHero, {
      props: { title: "Admisión de Clientes", ctaLabel: "Solicitar evaluación" },
    });
    // Sin ctaHref no hay enlace de CTA en el DOM, ni siquiera con ctaLabel.
    expect(sin).not.toContain('class="cta"');
    expect(sin).not.toMatch(/<a[^>]*class="[^"]*\bcta\b/);

    const con = await container.renderToString(EditorialHero, {
      props: {
        title: "Admisión de Clientes",
        ctaLabel: "Solicitar evaluación preliminar",
        ctaHref: "/admision",
      },
    });
    expect(con).toMatch(/<a[^>]*class="[^"]*\bcta\b[^>]*href="\/admision"/);
    expect(con).toContain("Solicitar evaluación preliminar");
  });
});

describe("EditorialHero.astro — source (jerarquía editorial + tokens)", () => {
  it("alinea a la izquierda y NO usa imagen de fondo", () => {
    expect(heroSource).toContain("text-align: left");
    const src = heroSource.toLowerCase();
    expect(src).not.toContain("text-align: center");
    expect(src).not.toContain("background-image");
    expect(src).not.toContain("url(");
  });

  it("renderiza el H1 en la familia serif con escala de display (--step-4/--step-5)", () => {
    expect(heroSource).toContain(".title");
    expect(heroSource).toContain("font-family: var(--font-serif)");
    expect(heroSource).toContain(
      "font-size: clamp(var(--step-4), 5vw, var(--step-5))",
    );
  });

  it("estiliza el eyebrow en mono, mayúsculas, --step--1 y color --accent", () => {
    expect(heroSource).toContain("font-family: var(--font-mono)");
    expect(heroSource).toContain("text-transform: uppercase");
    expect(heroSource).toContain("letter-spacing: 0.08em");
    expect(heroSource).toContain("color: var(--accent)");
  });

  it("el deck usa --step-1 y color --ink-muted", () => {
    expect(heroSource).toContain("font-size: var(--step-1)");
    expect(heroSource).toContain("color: var(--ink-muted)");
  });

  it("el CTA usa --accent, foco visible y radius <= --radius", () => {
    expect(heroSource).toContain("background: var(--accent)");
    expect(heroSource).toContain("border-radius: var(--radius)");
    expect(heroSource).toContain("outline: 2px solid var(--accent)");
    expect(heroSource).toContain("outline-offset: 2px");
  });

  it("no introduce hex sueltos, gradiente, glow ni Tailwind por CDN (CSS)", () => {
    const css = heroStyle.toLowerCase();
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
    expect(heroSource.toLowerCase()).not.toContain("cdn.tailwindcss.com");
  });
});
