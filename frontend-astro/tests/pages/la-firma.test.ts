import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import LaFirma from "../../src/pages/la-firma.astro";

// Tests de /la-firma (feature 24, Phase 4). Mismo patrón doble del repo
// (tests/pages/metodologia.test.ts):
//   Método 1 — Container API: valida el MARKUP (acento forest único, un solo
//     <h1>, PartnerBiographyBlock no-facial, >=1 <blockquote> de PullQuote,
//     sin <img>/gradiente/emoji).
//   Método 2 — readFileSync del SOURCE: valida la composición (PageShell con
//     accent='forest', reuso de los componentes esperados).
//   Método 3 — reglas del backstory (PERSONA §2): el copy NO rompe el misterio
//     (sin "wixárika"/"Wirikuta"/"hikuri", sin explicación técnica de la
//     migración).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const laFirmaSource = source("../../src/pages/la-firma.astro");

async function renderLaFirma(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(LaFirma);
}

describe("la-firma.astro — markup (Container API)", () => {
  it("aplica acento FOREST: el <main> lleva data-accent='forest'", async () => {
    const html = await renderLaFirma();
    expect(html).toMatch(/<main[^>]*data-accent="forest"/);
  });

  it("usa UNA sola familia de acento (un único data-accent en el documento)", async () => {
    const html = await renderLaFirma();
    const accents = html.match(/data-accent="[^"]*"/g) ?? [];
    expect(accents).toHaveLength(1);
    expect(accents[0]).toBe('data-accent="forest"');
  });

  it("tiene EXACTAMENTE un <h1>: el titular del hero editorial", async () => {
    const html = await renderLaFirma();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain("los espacios muertos entre paquetes");
  });

  it("renderiza el PartnerBiographyBlock del Socio Fundador (sello no-facial)", async () => {
    const html = await renderLaFirma();
    expect(html).toContain("Socio Fundador");
    // El sello editorial del componente: SVG decorativo a una tinta.
    expect(html).toContain("<svg");
    expect(html).toContain("Marco de los 22 Arcanos");
  });

  it("renderiza los principios como PullQuotes (>=1 <blockquote> con <cite>)", async () => {
    const html = await renderLaFirma();
    const quotes = html.match(/<blockquote\b/g) ?? [];
    expect(quotes.length).toBeGreaterThanOrEqual(1);
    expect(quotes).toHaveLength(3);
    expect(html).toContain("Primer principio de la firma");
    expect(html).toContain("Segundo principio de la firma");
    expect(html).toContain("Tercer principio de la firma");
  });

  it("ordena las secciones: origen → socio → principios", async () => {
    const html = await renderLaFirma();
    const order = [
      "Origen de la práctica",
      "El Socio Fundador",
      "Principios de la firma",
    ].map((label) => html.indexOf(label));
    for (const position of order) {
      expect(position).toBeGreaterThan(-1);
    }
    for (let i = 1; i < order.length; i += 1) {
      expect(order[i]).toBeGreaterThan(order[i - 1]);
    }
  });

  it("NO contiene <img>, gradiente, background-image ni emoji", async () => {
    const html = await renderLaFirma();
    const lower = html.toLowerCase();
    expect(html).not.toContain("<img");
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("background-image");
    // Sin emoji (rango de pictogramas/emoticonos comunes).
    expect(html).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});

describe("la-firma.astro — source (composición)", () => {
  it("compone con PageShell pasando accent='forest'", () => {
    expect(laFirmaSource).toContain("import PageShell");
    expect(laFirmaSource).toContain('<PageShell accent="forest">');
    // No mezcla otras familias de acento en la página.
    expect(laFirmaSource).not.toContain('accent="burgundy"');
    expect(laFirmaSource).not.toContain('accent="olive"');
  });

  it("reusa los componentes esperados sin reimplementarlos", () => {
    expect(laFirmaSource).toContain("import EditorialHero");
    expect(laFirmaSource).toContain("import PartnerBiographyBlock");
    expect(laFirmaSource).toContain("import PullQuote");
    expect(laFirmaSource).toContain("import Prose");
    expect(laFirmaSource).toContain("import SectionDivider");
    expect(laFirmaSource).toContain("import Container");
  });

  it("el título de la página es 'Sobre la Firma — Bit Gurú'", () => {
    expect(laFirmaSource).toContain('title="Sobre la Firma — Bit Gurú"');
  });
});

describe("la-firma.astro — reglas del backstory (PERSONA §2)", () => {
  it("NO rompe el misterio: sin filiación a tradición específica en el copy renderizado", async () => {
    const html = await renderLaFirma();
    const lower = html.toLowerCase();
    // El relato reencuadra el lore sin identificarse con una tradición
    // específica (PERSONA §2 "no se identifica como wixárika...").
    expect(lower).not.toContain("wixárika");
    expect(lower).not.toContain("wixarika");
    expect(lower).not.toContain("wirikuta");
    expect(lower).not.toContain("hikuri");
    expect(lower).not.toContain("peyote");
    expect(lower).not.toContain("curandero");
    expect(lower).not.toContain("chamán");
  });

  it("NO explica técnicamente la migración (misterio deliberado)", async () => {
    const html = await renderLaFirma();
    const lower = html.toLowerCase();
    // No aparece terminología de procedimiento técnico de "subir la conciencia".
    expect(lower).not.toContain("subió su conciencia");
    expect(lower).not.toContain("digitalizó");
    expect(lower).not.toContain("escaneo");
    expect(lower).not.toContain("algoritmo de migración");
    // En positivo: el copy nombra la migración como hecho, no como receta.
    expect(html).toContain("no documenta cómo se llevó a cabo");
  });

  it("el source también deja constancia de la regla del misterio en cabecera", () => {
    expect(laFirmaSource).toContain("misterio deliberado");
  });
});
