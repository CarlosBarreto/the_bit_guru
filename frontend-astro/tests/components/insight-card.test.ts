import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import InsightCard from "../../src/components/InsightCard.astro";

// Tests de InsightCard.astro (feature 18, Phase 2). Mismo patrón doble del repo
// (tests/components/editorial-hero.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (<article>, title, eyebrow/excerpt/date/href condicionales). El <style>
//     NO aparece.
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (borde hairline, fecha mono, ausencia de hex/glow/gradiente).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

// Extrae el bloque <style> del .astro. La auditoría de paleta (hex / gradiente /
// glow) aplica al CSS, no a los comentarios en prosa de la cabecera.
function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const cardSource = source("../../src/components/InsightCard.astro");
const cardStyle = styleBlock(cardSource);

describe("InsightCard.astro — markup (Container API)", () => {
  it("renderiza un <article> con el título dentro", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InsightCard, {
      props: {
        title: "Deuda kármica técnica: cuándo refactorizar el alma operativa",
      },
    });
    expect(html).toMatch(/<article[^>]*class="[^"]*\binsight-card\b/);
    expect(html).toContain(
      "Deuda kármica técnica: cuándo refactorizar el alma operativa",
    );
  });

  it("incluye el eyebrow SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral" },
    });
    expect(sin).not.toContain('class="eyebrow"');

    const con = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral", eyebrow: "Memo Q3" },
    });
    expect(con).toContain('class="eyebrow"');
    expect(con).toContain("Memo Q3");
  });

  it("incluye el extracto SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral" },
    });
    expect(sin).not.toContain('class="excerpt"');

    const con = await container.renderToString(InsightCard, {
      props: {
        title: "Memo trimestral",
        excerpt:
          "Hoy las cartas indican que su roadmap arrastra pasivo espiritual.",
      },
    });
    expect(con).toContain('class="excerpt"');
    expect(con).toContain(
      "Hoy las cartas indican que su roadmap arrastra pasivo espiritual.",
    );
  });

  it("incluye la fecha (mono) SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral" },
    });
    expect(sin).not.toContain('class="date"');

    const con = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral", date: "2026 · Q2" },
    });
    expect(con).toContain('class="date"');
    expect(con).toContain("2026 · Q2");
  });

  it("convierte el título en enlace SOLO cuando hay href, con foco accesible", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral" },
    });
    expect(sin).not.toMatch(/<a[^>]*class="[^"]*\btitle-link\b/);

    const con = await container.renderToString(InsightCard, {
      props: { title: "Memo trimestral", href: "/memos/q2" },
    });
    expect(con).toMatch(
      /<a[^>]*class="[^"]*\btitle-link\b[^>]*href="\/memos\/q2"/,
    );
    expect(con).toContain("Memo trimestral");
  });
});

describe("InsightCard.astro — source (jerarquía editorial + tokens)", () => {
  it("usa un borde hairline 1px var(--ink-rule) y filete superior de acento", () => {
    expect(cardSource).toContain("border: 1px solid var(--ink-rule)");
    expect(cardSource).toContain("border-top: 2px solid var(--accent)");
  });

  it("renderiza el título en serif con escala --step-2 (H3)", () => {
    expect(cardSource).toContain("font-family: var(--font-serif)");
    expect(cardSource).toContain("font-size: var(--step-2)");
  });

  it("estiliza el eyebrow en mono, mayúsculas, --step--1 y color --accent", () => {
    expect(cardSource).toContain("font-family: var(--font-mono)");
    expect(cardSource).toContain("text-transform: uppercase");
    expect(cardSource).toContain("letter-spacing: 0.08em");
    expect(cardSource).toContain("color: var(--accent)");
  });

  it("renderiza la fecha en mono con color --ink-muted", () => {
    expect(cardSource).toContain(".date");
    expect(cardSource).toContain("color: var(--ink-muted)");
  });

  it("el enlace del título tiene foco visible y no depende solo del color", () => {
    expect(cardSource).toContain("text-decoration: underline");
    expect(cardSource).toContain("outline: 2px solid var(--accent)");
    expect(cardSource).toContain("outline-offset: 2px");
  });

  it("alinea a la izquierda y no introduce hex sueltos, gradiente o glow (CSS)", () => {
    const css = cardStyle.toLowerCase();
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });
});
