import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import OutcomeMetricsTable, {
  OUTCOME_COLUMNS,
  DEFAULT_OUTCOME_CAPTION,
} from "../../src/components/OutcomeMetricsTable.astro";

// Tests de OutcomeMetricsTable.astro (feature 23, Phase 4). Patrón doble del repo
// (tests/components/service-card.test.ts):
//   Método 1 — Container API: valida MARKUP (reuso de la tabla real con columnas
//     canónicas, caption por defecto y por prop, envoltura overflow-x).
//   Método 2 — readFileSync del SOURCE .astro: valida el <style> (overflow-x,
//     ausencia de hex/gradiente/glow) y que REUSA MetricTable (no la duplica).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const tableSource = source("../../src/components/OutcomeMetricsTable.astro");
const tableStyle = styleBlock(tableSource);

const ROWS = [
  ["Propuestas sin tesorería", "37 abiertas", "2 abiertas", "-95%"],
  ["Asambleas / mes", "11", "1", "-91%"],
];

async function render(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(OutcomeMetricsTable, { props });
}

describe("OutcomeMetricsTable.astro — markup (Container API)", () => {
  it("reusa una <table> real con semántica de tabla (no divs)", async () => {
    const html = await render({ rows: ROWS });
    expect(html).toMatch(/<table[^>]*class="[^"]*\bmetric-table\b/);
    expect(html).toContain("<thead");
    expect(html).toContain("<tbody");
  });

  it("renderiza las cuatro columnas canónicas (Indicador / Línea base / Resultado / Variación)", async () => {
    const html = await render({ rows: ROWS });
    for (const col of OUTCOME_COLUMNS) {
      expect(html).toContain(col);
    }
    const thColCount = (html.match(/<th scope="col"/g) ?? []).length;
    expect(thColCount).toBe(4);
  });

  it("la primera celda de cada fila es <th scope='row'> (encabezado de fila)", async () => {
    const html = await render({ rows: ROWS });
    const thRowCount = (html.match(/<th scope="row"/g) ?? []).length;
    expect(thRowCount).toBe(ROWS.length);
    expect(html).toContain("Propuestas sin tesorería");
  });

  it("usa el caption deadpan por defecto cuando no se pasa caption", async () => {
    const html = await render({ rows: ROWS });
    expect(html).toContain(DEFAULT_OUTCOME_CAPTION);
    expect(html).toMatch(/<caption/);
  });

  it("permite sustituir el caption por prop", async () => {
    const custom = "Cuadro de resultados del exorcismo operativo.";
    const html = await render({ rows: ROWS, caption: custom });
    expect(html).toContain(custom);
    expect(html).not.toContain(DEFAULT_OUTCOME_CAPTION);
  });

  it("envuelve la tabla en un contenedor con overflow-x (para vivir en una tarjeta)", async () => {
    const html = await render({ rows: ROWS });
    expect(html).toMatch(/class="[^"]*\boutcome-metrics-table\b/);
  });

  it("NO contiene ningún <img>", async () => {
    const html = await render({ rows: ROWS });
    expect(html).not.toContain("<img");
  });
});

describe("OutcomeMetricsTable.astro — source (reuso + tokens)", () => {
  it("REUSA MetricTable en vez de reimplementar la tabla", () => {
    expect(tableSource).toContain("import MetricTable");
    expect(tableSource).toContain("<MetricTable");
  });

  it("fija las cuatro columnas canónicas en el source", () => {
    expect(tableSource).toContain("Indicador");
    expect(tableSource).toContain("Línea base");
    expect(tableSource).toContain("Resultado");
    expect(tableSource).toContain("Variación");
  });

  it("la envoltura usa overflow-x y no introduce hex/gradiente/glow (CSS)", () => {
    const css = tableStyle.toLowerCase();
    expect(css).toContain("overflow-x: auto");
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });

  it("NO fija una familia de acento (hereda --accent del <main>)", () => {
    expect(tableSource).not.toContain("--burgundy");
    expect(tableSource).not.toContain("--olive");
    expect(tableSource).not.toContain("--forest");
  });
});
