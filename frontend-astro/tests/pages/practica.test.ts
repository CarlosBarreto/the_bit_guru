import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Practica from "../../src/pages/practica.astro";

// Tests de /practica (feature 20, Phase 3). Mismo patrón doble del repo
// (tests/pages/index.test.ts):
//   Método 1 — Container API: renderiza la página y valida el MARKUP (acento
//     burgundy, un solo <h1>, varias <article> de ServiceCard, el diagrama sin
//     gradiente, ausencia de <img>).
//   Método 2 — readFileSync del SOURCE: valida la composición (reuso de
//     PageShell con accent="burgundy", componentes clave, orden de bloques).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const practicaSource = source("../../src/pages/practica.astro");

async function renderPractica(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Practica);
}

describe("practica.astro — markup (Container API)", () => {
  it("aplica acento BURGUNDY: el <main> lleva data-accent='burgundy'", async () => {
    const html = await renderPractica();
    expect(html).toMatch(/<main[^>]*data-accent="burgundy"/);
  });

  it("usa UNA sola familia de acento (no mezcla olive ni forest en el <main>)", async () => {
    const html = await renderPractica();
    const accents = html.match(/data-accent="[^"]*"/g) ?? [];
    // El único data-accent del documento es el burgundy del <main>.
    expect(accents).toHaveLength(1);
    expect(accents[0]).toBe('data-accent="burgundy"');
  });

  it("tiene EXACTAMENTE un <h1> (jerarquía editorial; EditorialHero)", async () => {
    const html = await renderPractica();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
  });

  it("renderiza VARIAS <article> (la rejilla de ServiceCard)", async () => {
    const html = await renderPractica();
    const articleCount = (html.match(/<article\b/g) ?? []).length;
    expect(articleCount).toBeGreaterThanOrEqual(2);
    expect(articleCount).toBe(4);
  });

  it("cada ServiceCard lista entregables (<li>)", async () => {
    const html = await renderPractica();
    const liCount = (html.match(/<li\b/g) ?? []).length;
    expect(liCount).toBeGreaterThanOrEqual(4);
  });

  it("incluye el divisor 'El Marco' y el FrameworkDiagram", async () => {
    const html = await renderPractica();
    expect(html).toContain("El Marco");
    expect(html).toMatch(/<figure[^>]*class="[^"]*\bframework\b/);
    expect(html).toContain("Marco · 22 dimensiones");
  });

  it("el diagrama NO usa gradiente (dos tintas estrictas)", async () => {
    const html = await renderPractica().then((h) => h.toLowerCase());
    expect(html).not.toContain("gradient");
    expect(html).not.toContain("box-shadow");
    expect(html).not.toContain("text-shadow");
  });

  it("NO contiene ningún <img> ni fotografía/fotorrealismo", async () => {
    const html = await renderPractica();
    expect(html).not.toContain("<img");
    expect(html.toLowerCase()).not.toContain("background-image");
    // El único gráfico es el SVG inline del FrameworkDiagram.
    expect(html).toContain("<svg");
  });

  it("ordena los bloques: Hero → Líneas de Servicio → El Marco", async () => {
    const html = await renderPractica();
    const iHero = html.indexOf("Áreas de Práctica");
    const iServicios = html.indexOf("Líneas de Servicio");
    const iMarco = html.indexOf("El Marco");
    expect(iHero).toBeGreaterThan(-1);
    expect(iServicios).toBeGreaterThan(-1);
    expect(iMarco).toBeGreaterThan(-1);
    expect(iHero).toBeLessThan(iServicios);
    expect(iServicios).toBeLessThan(iMarco);
  });
});

describe("practica.astro — source (composición + reuso)", () => {
  it("compone con PageShell pasando accent='burgundy'", () => {
    expect(practicaSource).toContain("import PageShell");
    expect(practicaSource).toContain('<PageShell accent="burgundy">');
    // No mezcla otras familias de acento en la página.
    expect(practicaSource).not.toContain('accent="olive"');
    expect(practicaSource).not.toContain('accent="forest"');
  });

  it("reusa los primitivos sin reimplementarlos", () => {
    expect(practicaSource).toContain("import EditorialHero");
    expect(practicaSource).toContain("import SectionDivider");
    expect(practicaSource).toContain("import Container");
    expect(practicaSource).toContain("import ServiceCard");
    expect(practicaSource).toContain("import FrameworkDiagram");
  });

  it("declara varias líneas de servicio derivadas de PERSONA §5", () => {
    expect(practicaSource).toContain("Diligencia Kármica");
    expect(practicaSource).toContain("Optimización del Karma Operativo");
    expect(practicaSource).toContain("Transformación Digital del Alma");
    expect(practicaSource).toContain("Gestión de Deuda Técnica Espiritual");
  });

  it("el título de la página es 'Áreas de Práctica — Bit Gurú'", () => {
    expect(practicaSource).toContain('title="Áreas de Práctica — Bit Gurú"');
  });
});
