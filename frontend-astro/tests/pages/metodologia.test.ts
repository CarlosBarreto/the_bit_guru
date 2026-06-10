import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Metodologia from "../../src/pages/metodologia.astro";
import { ARCANOS } from "../../src/lib/tarot";

// Tests de /metodologia (feature 21, Phase 3). Mismo patrón doble del repo
// (tests/pages/practica.test.ts):
//   Método 1 — Container API: valida el MARKUP (acento forest único, un solo
//     <h1>, las 22 dimensiones derivadas del ARCANOS REAL de lib/tarot.ts,
//     índice, orden de secciones, diagrama SVG, sin <img>/gradiente).
//   Método 2 — readFileSync del SOURCE: valida la composición (PageShell con
//     accent='forest', import de ARCANOS, derivación vía .map sin renombrar).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const metodologiaSource = source("../../src/pages/metodologia.astro");

async function renderMetodologia(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Metodologia);
}

describe("metodologia.astro — markup (Container API)", () => {
  it("aplica acento FOREST: el <main> lleva data-accent='forest'", async () => {
    const html = await renderMetodologia();
    expect(html).toMatch(/<main[^>]*data-accent="forest"/);
  });

  it("usa UNA sola familia de acento (un único data-accent en el documento)", async () => {
    const html = await renderMetodologia();
    const accents = html.match(/data-accent="[^"]*"/g) ?? [];
    expect(accents).toHaveLength(1);
    expect(accents[0]).toBe('data-accent="forest"');
  });

  it("tiene EXACTAMENTE un <h1>: la portada del white paper", async () => {
    const html = await renderMetodologia();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain("El Marco de los 22 Arcanos™");
  });

  it("renderiza la portada con código de documento y metadatos", async () => {
    const html = await renderMetodologia();
    expect(html).toContain("BG/WP-001 · REV. 2");
    expect(html).toContain("Distribución restringida");
    expect(html).toContain("El Gurú de Bits — Socio Fundador");
  });

  it("las 22 dimensiones provienen de lib/tarot.ts: nombre y código de CADA arcano", async () => {
    const html = await renderMetodologia();
    expect(ARCANOS).toHaveLength(22);
    for (const canonical of ARCANOS) {
      const [code, ...rest] = canonical.split(" - ");
      const name = rest.join(" - ");
      // Denominación canónica intacta (no se renombra ningún arcano).
      expect(html).toContain(name);
      // Código romano citado en la ficha de la dimensión.
      expect(html).toContain(`ARCANO ${code}`);
    }
  });

  it("la lista de dimensiones tiene exactamente 22 entradas", async () => {
    const html = await renderMetodologia();
    const items = html.match(/class="dimension[" ]/g) ?? [];
    expect(items).toHaveLength(22);
  });

  it("incluye el índice del documento (nav aria-label='Índice')", async () => {
    const html = await renderMetodologia();
    expect(html).toMatch(/<nav[^>]*aria-label="Índice"/);
    expect(html).toContain('href="#dimensiones-diagnosticas"');
  });

  it("ordena las 5 secciones: resumen → fundamento → dimensiones → marco → descargos", async () => {
    const html = await renderMetodologia();
    const order = [
      'id="resumen-ejecutivo"',
      'id="fundamento-metodologico"',
      'id="dimensiones-diagnosticas"',
      'id="marco-completo"',
      'id="limitaciones-descargos"',
    ].map((anchor) => html.indexOf(anchor));
    for (const position of order) {
      expect(position).toBeGreaterThan(-1);
    }
    for (let i = 1; i < order.length; i += 1) {
      expect(order[i]).toBeGreaterThan(order[i - 1]);
    }
  });

  it("incluye el TwoColorDiagram (SVG inline del marco completo)", async () => {
    const html = await renderMetodologia();
    expect(html).toContain("<svg");
    expect(html).toContain("El Marco · 22 dimensiones · vista completa");
    expect(html).toContain("DIAGNÓSTICO PRELIMINAR");
  });

  it("NO contiene <img>, gradiente ni background-image", async () => {
    const html = await renderMetodologia();
    const lower = html.toLowerCase();
    expect(html).not.toContain("<img");
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("background-image");
  });
});

describe("metodologia.astro — source (composición + canon)", () => {
  it("compone con PageShell pasando accent='forest'", () => {
    expect(metodologiaSource).toContain("import PageShell");
    expect(metodologiaSource).toContain('<PageShell accent="forest">');
    // No mezcla otras familias de acento en la página.
    expect(metodologiaSource).not.toContain('accent="burgundy"');
    expect(metodologiaSource).not.toContain('accent="olive"');
  });

  it("importa ARCANOS desde lib/tarot y DERIVA las dimensiones con .map()", () => {
    expect(metodologiaSource).toContain(
      'import { ARCANOS } from "../lib/tarot"',
    );
    expect(metodologiaSource).toContain("ARCANOS.map(");
  });

  it("no renombra arcanos: cada clave de notas es el string canónico literal", () => {
    for (const canonical of ARCANOS) {
      expect(metodologiaSource).toContain(`"${canonical}":`);
    }
  });

  it("reusa los componentes sin reimplementarlos", () => {
    expect(metodologiaSource).toContain("import WhitePaperLayout");
    expect(metodologiaSource).toContain("import TwoColorDiagram");
    expect(metodologiaSource).toContain("import Container");
    expect(metodologiaSource).toContain("import Prose");
    expect(metodologiaSource).toContain(
      "<TwoColorDiagram dimensions={ARCANOS} />",
    );
  });

  it("el título de la página es 'Metodología — Bit Gurú'", () => {
    expect(metodologiaSource).toContain('title="Metodología — Bit Gurú"');
  });
});
