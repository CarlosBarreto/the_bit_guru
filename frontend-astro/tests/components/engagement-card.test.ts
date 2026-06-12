import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import EngagementCard from "../../src/components/EngagementCard.astro";

// Tests de EngagementCard.astro (feature 23, Phase 4). Patrón doble del repo
// (tests/components/service-card.test.ts):
//   Método 1 — Container API: valida MARKUP (article, eyebrow de sector mono,
//     <h3> serif, métrica destacada, disclosure <details>/<summary> nativo con el
//     <h3> FUERA del summary, slot del contenido estático).
//   Método 2 — readFileSync del SOURCE .astro: valida el <style> (borde hairline +
//     filete de acento, marcador +/- accesible, reemplazo del marker nativo,
//     focus-visible, ausencia de hex/gradiente/glow).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const cardSource = source("../../src/components/EngagementCard.astro");
const cardStyle = styleBlock(cardSource);

const BASE_PROPS = {
  sector: "Una DAO en duelo",
  title: "Cierre de ciclo para un colectivo que votó su propia disolución.",
  metricValue: "-94%",
  metricLabel: "quórum en asambleas de duelo",
};

async function render(
  props: Record<string, unknown> = BASE_PROPS,
  slots?: Record<string, string>,
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(EngagementCard, { props, slots });
}

describe("EngagementCard.astro — markup (Container API)", () => {
  it("renderiza un <article class='engagement-card'>", async () => {
    const html = await render();
    expect(html).toMatch(/<article[^>]*class="[^"]*\bengagement-card\b/);
  });

  it("renderiza el sector ficticio como eyebrow (clase .sector)", async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*\bsector\b/);
    expect(html).toContain("Una DAO en duelo");
  });

  it("renderiza el título del caso dentro de un <h3> serif", async () => {
    const html = await render();
    expect(html).toMatch(/<h3[^>]*class="[^"]*\btitle\b/);
    expect(html).toContain(
      "Cierre de ciclo para un colectivo que votó su propia disolución.",
    );
  });

  it("renderiza la métrica destacada: valor (mono) + etiqueta (sans)", async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*\bmetric-value\b/);
    expect(html).toMatch(/class="[^"]*\bmetric-label\b/);
    expect(html).toContain("-94%");
    expect(html).toContain("quórum en asambleas de duelo");
  });

  it("usa un disclosure NATIVO <details>/<summary> (sin JS)", async () => {
    const html = await render();
    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    // El rótulo canónico del summary.
    expect(html).toContain("Resultados del compromiso");
  });

  it("permite sustituir el rótulo del summary por prop", async () => {
    const html = await render({
      ...BASE_PROPS,
      disclosureLabel: "Ver el expediente",
    });
    expect(html).toContain("Ver el expediente");
  });

  it("coloca el <h3> FUERA del <summary> (no aplana la jerarquía)", async () => {
    const html = await render();
    const iH3 = html.indexOf("<h3");
    const iSummary = html.indexOf("<summary");
    expect(iH3).toBeGreaterThan(-1);
    expect(iSummary).toBeGreaterThan(-1);
    expect(iH3).toBeLessThan(iSummary);
    // El <summary> no contiene un <h3> dentro.
    const summaryHtml = html.slice(iSummary, html.indexOf("</summary>"));
    expect(summaryHtml).not.toContain("<h3");
  });

  it("el indicador +/- del marcador es aria-hidden (lo lee el texto del summary)", async () => {
    const html = await render();
    expect(html).toMatch(/class="marker"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*class="marker"/);
  });

  it("renderiza el contenido del slot (la tabla estática) dentro del disclosure", async () => {
    const html = await render(BASE_PROPS, {
      default: '<table class="injected-outcome"></table>',
    });
    expect(html).toContain('class="injected-outcome"');
    // El contenido vive dentro del cuerpo del disclosure (después del summary).
    const iSummaryEnd = html.indexOf("</summary>");
    const iSlot = html.indexOf("injected-outcome");
    expect(iSlot).toBeGreaterThan(iSummaryEnd);
  });

  it("NO contiene ningún <img>", async () => {
    const html = await render();
    expect(html).not.toContain("<img");
  });
});

describe("EngagementCard.astro — source (jerarquía editorial + tokens)", () => {
  it("usa borde hairline 1px var(--ink-rule) y filete superior de acento", () => {
    expect(cardSource).toContain("border: 1px solid var(--ink-rule)");
    expect(cardSource).toContain("border-top: 2px solid var(--accent)");
  });

  it("el título del caso es serif con escala --step-2 (H3)", () => {
    expect(cardSource).toContain("font-family: var(--font-serif)");
    expect(cardSource).toContain("font-size: var(--step-2)");
  });

  it("reemplaza el marcador nativo del summary de forma accesible (+/-)", () => {
    const css = cardStyle.toLowerCase();
    expect(css).toContain("list-style: none");
    expect(css).toContain("::-webkit-details-marker");
    expect(cardStyle).toContain('content: "+"');
    // foco visible por teclado en el summary.
    expect(css).toContain("focus-visible");
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

  it("NO fija una familia de acento (usa --accent que remapea la página)", () => {
    expect(cardSource).not.toContain("--burgundy");
    expect(cardSource).not.toContain("--olive");
    expect(cardSource).not.toContain("--forest");
  });
});
