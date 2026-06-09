import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import PullQuote from "../../src/components/PullQuote.astro";

// Tests de PullQuote.astro (feature 17, Phase 2). Mismo patrón doble del repo
// (tests/components/layout-primitives.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (<blockquote>, <cite> presente/ausente). El <style> NO aparece.
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (filete de acento a la izquierda, serif, ausencia de hex/glow/gradiente).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

// Extrae el bloque <style> del .astro. La auditoría de paleta (hex / gradiente /
// glow) aplica al CSS, no a los comentarios en prosa de la cabecera.
function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const quoteSource = source("../../src/components/PullQuote.astro");
const quoteStyle = styleBlock(quoteSource);

describe("PullQuote.astro — markup (Container API)", () => {
  it("renderiza un <blockquote> con el texto de la cita", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PullQuote, {
      props: {
        quote:
          "Hoy las cartas indican que su arquitectura de decisiones acumula pasivo espiritual.",
      },
    });
    expect(html).toMatch(/<blockquote[^>]*class="[^"]*\bpull-quote\b/);
    expect(html).toContain(
      "Hoy las cartas indican que su arquitectura de decisiones acumula pasivo espiritual.",
    );
  });

  it("renderiza <cite> SOLO cuando se pasa la prop cite", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(PullQuote, {
      props: { quote: "Si llegó hasta aquí, ya sabe con quién trata." },
    });
    expect(sin).not.toContain("<cite");

    const con = await container.renderToString(PullQuote, {
      props: {
        quote: "Si llegó hasta aquí, ya sabe con quién trata.",
        cite: "El Gurú de Bits — Socio Fundador",
      },
    });
    expect(con).toMatch(/<cite[^>]*class="[^"]*\bcite\b/);
    expect(con).toContain("El Gurú de Bits — Socio Fundador");
  });
});

describe("PullQuote.astro — source (filete de acento + tokens)", () => {
  it("dibuja un filete de acento a la IZQUIERDA (border-left + padding-left)", () => {
    expect(quoteSource).toContain("border-left: 3px solid var(--accent)");
    expect(quoteSource).toContain("padding-left: var(--space-5)");
  });

  it("renderiza la cita en serif con escala --step-2 → --step-3", () => {
    expect(quoteSource).toContain("font-family: var(--font-serif)");
    expect(quoteSource).toContain(
      "font-size: clamp(var(--step-2), 3vw, var(--step-3))",
    );
  });

  it("la atribución usa color --ink-muted y queda alineada a la izquierda", () => {
    expect(quoteSource).toContain("color: var(--ink-muted)");
    expect(quoteSource).toContain("text-align: left");
    expect(quoteSource.toLowerCase()).not.toContain("text-align: center");
  });

  it("no introduce hex sueltos, gradiente, glow ni comillas decorativas gigantes (CSS)", () => {
    const css = quoteStyle.toLowerCase();
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
    // Sobrio: sin pseudo-elementos de comillas decorativas.
    expect(css).not.toContain("content:");
  });
});
