import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Archivo from "../../src/pages/archivo.astro";

// Tests de /archivo (feature 23, Phase 4). Patrón doble del repo
// (tests/pages/practica.test.ts):
//   Método 1 — Container API: valida MARKUP (acento burgundy único, un <h1>,
//     4 EngagementCard, 4 tablas de resultados, disclosures nativos, orden).
//   Método 2 — readFileSync del SOURCE: valida composición (reuso de PageShell
//     burgundy + primitivos, no duplicar el disclaimer del Footer, title).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const archivoSource = source("../../src/pages/archivo.astro");

async function render(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Archivo);
}

describe("archivo.astro — markup (Container API)", () => {
  it("aplica acento BURGUNDY: el <main> lleva data-accent='burgundy'", async () => {
    const html = await render();
    expect(html).toMatch(/<main[^>]*data-accent="burgundy"/);
  });

  it("usa UNA sola familia de acento (no mezcla olive ni forest)", async () => {
    const html = await render();
    const accents = html.match(/data-accent="[^"]*"/g) ?? [];
    expect(accents).toHaveLength(1);
    expect(accents[0]).toBe('data-accent="burgundy"');
  });

  it("tiene EXACTAMENTE un <h1> (jerarquía editorial; EditorialHero)", async () => {
    const html = await render();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
  });

  it("renderiza EXACTAMENTE 4 EngagementCard (<article>)", async () => {
    const html = await render();
    const articleCount = (html.match(/<article\b/g) ?? []).length;
    expect(articleCount).toBe(4);
  });

  it("cada caso abre a un cuadro de resultados (4 <details> con su <table>)", async () => {
    const html = await render();
    const detailsCount = (html.match(/<details\b/g) ?? []).length;
    expect(detailsCount).toBe(4);
    const tableCount = (html.match(/<table\b/g) ?? []).length;
    expect(tableCount).toBe(4);
    // El rótulo canónico del summary aparece una vez por caso.
    const summaryCount = (html.match(/Resultados del compromiso/g) ?? []).length;
    expect(summaryCount).toBe(4);
  });

  it("las tablas tienen las cuatro columnas canónicas de resultados", async () => {
    const html = await render();
    expect(html).toContain("Indicador");
    expect(html).toContain("Línea base");
    expect(html).toContain("Resultado");
    expect(html).toContain("Variación");
  });

  it("incluye el divisor 'Casos Seleccionados'", async () => {
    const html = await render();
    expect(html).toContain("Casos Seleccionados");
  });

  it("incluye sectores absurdos (PERSONA §5 + ejemplos de la spec)", async () => {
    const html = await render();
    expect(html).toContain("Una DAO en duelo");
    expect(html).toContain("Un fondo de inversión poseído");
  });

  it("NO duplica el disclaimer del Footer en el copy de la página", async () => {
    const html = await render();
    const phrase = "Resultados obtenidos en líneas temporales anteriores";
    // El disclaimer vive SOLO en el Footer; no se repite en el cuerpo.
    const occurrences = html.split(phrase).length - 1;
    expect(occurrences).toBeLessThanOrEqual(1);
  });

  it("NO usa gradiente / glow (auditoría sobre el HTML renderizado)", async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toContain("gradient");
    expect(html).not.toContain("box-shadow");
    expect(html).not.toContain("text-shadow");
  });

  it("NO contiene ningún <img> ni background-image", async () => {
    const html = await render();
    expect(html).not.toContain("<img");
    expect(html.toLowerCase()).not.toContain("background-image");
  });

  it("ordena los bloques: Hero → Casos Seleccionados → casos", async () => {
    const html = await render();
    const iHero = html.indexOf("Archivo de Compromisos");
    const iCasos = html.indexOf("Casos Seleccionados");
    const iPrimerCaso = html.indexOf("Una DAO en duelo");
    expect(iHero).toBeGreaterThan(-1);
    expect(iCasos).toBeGreaterThan(-1);
    expect(iPrimerCaso).toBeGreaterThan(-1);
    expect(iHero).toBeLessThan(iCasos);
    expect(iCasos).toBeLessThan(iPrimerCaso);
  });
});

describe("archivo.astro — source (composición + reuso)", () => {
  it("compone con PageShell pasando accent='burgundy'", () => {
    expect(archivoSource).toContain("import PageShell");
    expect(archivoSource).toContain('<PageShell accent="burgundy">');
    expect(archivoSource).not.toContain('accent="olive"');
    expect(archivoSource).not.toContain('accent="forest"');
  });

  it("reusa los primitivos sin reimplementarlos", () => {
    expect(archivoSource).toContain("import EditorialHero");
    expect(archivoSource).toContain("import SectionDivider");
    expect(archivoSource).toContain("import Container");
    expect(archivoSource).toContain("import Prose");
    expect(archivoSource).toContain("import EngagementCard");
    expect(archivoSource).toContain("import OutcomeMetricsTable");
  });

  it("declara cuatro casos con sectores absurdos derivados de PERSONA §5", () => {
    expect(archivoSource).toContain("Una DAO en duelo");
    expect(archivoSource).toContain("Un fondo de inversión poseído");
    expect(archivoSource).toContain("Una startup de bienestar laboral");
    expect(archivoSource).toContain("Un unicornio de IA generativa");
  });

  it("el título de la página es 'Archivo de Compromisos — Bit Gurú'", () => {
    expect(archivoSource).toContain('title="Archivo de Compromisos — Bit Gurú"');
  });
});
