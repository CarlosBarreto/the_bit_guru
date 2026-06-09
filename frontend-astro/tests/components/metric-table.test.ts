import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import MetricTable from "../../src/components/MetricTable.astro";

// Tests de MetricTable.astro (feature 18, Phase 2). Mismo patrón doble del repo
// (tests/components/editorial-hero.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP y la
//     SEMÁNTICA de tabla real (<table>, <caption>, <th scope="col">,
//     <th scope="row">, filas correctas, sin divs estructurales).
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (hairlines, banda --ink-wash, números en mono, ausencia de hex/glow).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const tableSource = source("../../src/components/MetricTable.astro");
const tableStyle = styleBlock(tableSource);

// Datos de prueba en registro consultora (métricas deadpan).
const columns = ["Dimensión", "Antes", "Después"];
const rows: (string | number)[][] = [
  ["Deuda kármica técnica", "alta", "34% menor"],
  ["Alineación de stakeholders cósmicos", "2/10", "7/10"],
];

describe("MetricTable.astro — semántica de tabla real (Container API)", () => {
  it("renderiza un <table> con la clase metric-table", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MetricTable, {
      props: { columns, rows },
    });
    expect(html).toMatch(/<table[^>]*class="[^"]*\bmetric-table\b/);
  });

  it("renderiza un <caption> SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(MetricTable, {
      props: { columns, rows },
    });
    expect(sin).not.toContain("<caption");

    const con = await container.renderToString(MetricTable, {
      props: {
        caption: "Resultados de un compromiso de tres ciclos lunares",
        columns,
        rows,
      },
    });
    expect(con).toMatch(/<caption[^>]*>[^<]*Resultados de un compromiso/);
  });

  it("expone un <th scope=\"col\"> por columna con su etiqueta", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MetricTable, {
      props: { columns, rows },
    });
    const colHeaders = html.match(/<th[^>]*scope="col"[^>]*>/g) ?? [];
    expect(colHeaders.length).toBe(columns.length);
    for (const col of columns) {
      expect(html).toContain(col);
    }
  });

  it("usa <th scope=\"row\"> en la primera celda de cada fila y renderiza las filas correctas", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MetricTable, {
      props: { columns, rows },
    });
    const rowHeaders = html.match(/<th[^>]*scope="row"[^>]*>/g) ?? [];
    expect(rowHeaders.length).toBe(rows.length);
    // Astro inyecta atributos data-astro-* en <tbody>/<tr>; matcheamos la
    // etiqueta de apertura, no `<tbody>` literal.
    const bodyRows = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/);
    expect(bodyRows).not.toBeNull();
    const trCount = (bodyRows![1].match(/<tr[\s>]/g) ?? []).length;
    expect(trCount).toBe(rows.length);
    // Cada valor de cada fila aparece en el DOM.
    for (const row of rows) {
      for (const cell of row) {
        expect(html).toContain(String(cell));
      }
    }
  });

  it("NO usa divs para la estructura de tabla", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(MetricTable, {
      props: { caption: "Cap", columns, rows },
    });
    expect(html).not.toContain("<div");
    // Estructura de tabla real presente (Astro añade data-astro-* a las
    // etiquetas; matcheamos la apertura, no `<thead>`/`<tbody>` literales).
    expect(html).toMatch(/<thead[\s>]/);
    expect(html).toMatch(/<tbody[\s>]/);
  });
});

describe("MetricTable.astro — source (hairlines + banda + mono)", () => {
  it("dibuja hairlines 1px var(--ink-rule) y colapsa los bordes", () => {
    expect(tableSource).toContain("border-collapse: collapse");
    expect(tableSource).toContain("border: 1px solid var(--ink-rule)");
  });

  it("usa una banda de encabezado con fondo var(--ink-wash)", () => {
    expect(tableSource).toContain("background: var(--ink-wash)");
  });

  it("renderiza los valores numéricos en var(--font-mono)", () => {
    expect(tableSource).toContain(".value");
    expect(tableStyle).toContain("font-family: var(--font-mono)");
  });

  it("alinea a la izquierda y no introduce hex sueltos, gradiente o glow (CSS)", () => {
    const css = tableStyle.toLowerCase();
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });
});
