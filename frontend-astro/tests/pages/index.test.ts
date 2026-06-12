import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Index from "../../src/pages/index.astro";

// Tests de la home (feature 19, Phase 3). Mismo patrón doble del repo:
//   Método 1 — Container API (`experimental_AstroContainer`): renderiza la página
//     completa y valida el MARKUP resultante (un solo <h1>, exactamente 3
//     <article>, los 4 bloques por sus encabezados/labels, ausencia de
//     data-accent y de <img>/rostro).
//   Método 2 — readFileSync del SOURCE .astro: valida la composición (orden de
//     los 4 bloques, componentes clave, acento neutro Navy) sin depender del CSS.

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const indexSource = source("../../src/pages/index.astro");

async function renderHome(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Index);
}

describe("index.astro — markup (Container API)", () => {
  it("tiene EXACTAMENTE un <h1> (jerarquía editorial)", async () => {
    const html = await renderHome();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
  });

  it("renderiza EXACTAMENTE 3 <article> (los 3 InsightCard)", async () => {
    const html = await renderHome();
    const articleCount = (html.match(/<article\b/g) ?? []).length;
    expect(articleCount).toBe(3);
  });

  it("incluye los 4 bloques en orden por sus encabezados/labels", async () => {
    const html = await renderHome();
    const iLetter = html.indexOf("Carta del Socio");
    const iAbout = html.indexOf("Sobre la Firma");
    const iMemos = html.indexOf("Memos Destacados");
    const iPortrait = html.indexOf("El Socio Principal");

    expect(iLetter).toBeGreaterThan(-1);
    expect(iAbout).toBeGreaterThan(-1);
    expect(iMemos).toBeGreaterThan(-1);
    expect(iPortrait).toBeGreaterThan(-1);

    // Orden estricto: Partner Letter → About → 3 Insights → Principal Portrait.
    expect(iLetter).toBeLessThan(iAbout);
    expect(iAbout).toBeLessThan(iMemos);
    expect(iMemos).toBeLessThan(iPortrait);
  });

  it("renderiza el bloque de retrato del socio (PartnerBiographyBlock)", async () => {
    const html = await renderHome();
    expect(html).toMatch(/class="[^"]*\bpartner-bio\b/);
    expect(html).toContain("Socio Fundador");
  });

  it("la firma del Socio aparece en la carta", async () => {
    const html = await renderHome();
    expect(html).toContain("El Gurú de Bits — Socio Fundador");
  });

  it("usa acento NEUTRO (Navy): el <main> NO lleva data-accent", async () => {
    const html = await renderHome();
    expect(html).not.toContain("data-accent");
  });

  it("NO contiene ningún <img> ni rostro/fotorrealismo", async () => {
    const html = await renderHome();
    expect(html).not.toContain("<img");
    expect(html.toLowerCase()).not.toContain("background-image");
    // El único gráfico es el sello SVG no-facial del PartnerBiographyBlock,
    // marcado como decorativo (aria-hidden). No hay rostro ni fotorrealismo.
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
  });
});

describe("index.astro — source (composición de los 4 bloques)", () => {
  it("compone con el cascarón reusable PageShell SIN familia de acento (Navy)", () => {
    expect(indexSource).toContain("import PageShell");
    // El home no fija familia de acento: PageShell se abre sin prop accent.
    expect(indexSource).toMatch(/<PageShell>/);
    // No se pasa ninguna familia de acento a PageShell (el default es Navy).
    expect(indexSource).not.toContain('accent="burgundy"');
    expect(indexSource).not.toContain('accent="olive"');
    expect(indexSource).not.toContain('accent="forest"');
  });

  it("usa los componentes clave de cada bloque (reuso, sin reimplementar)", () => {
    expect(indexSource).toContain("import EditorialHero");
    expect(indexSource).toContain("import SectionDivider");
    expect(indexSource).toContain("import Prose");
    expect(indexSource).toContain("import InsightCard");
    expect(indexSource).toContain("import PartnerBiographyBlock");
    expect(indexSource).toContain("import Container");
  });

  it("ordena los 4 bloques mediante los labels de SectionDivider", () => {
    const iLetter = indexSource.indexOf('eyebrow="Carta del Socio"');
    const iAbout = indexSource.indexOf('label="Sobre la Firma"');
    const iMemos = indexSource.indexOf('label="Memos Destacados"');
    const iPortrait = indexSource.indexOf('label="El Socio Principal"');

    expect(iLetter).toBeGreaterThan(-1);
    expect(iAbout).toBeGreaterThan(-1);
    expect(iMemos).toBeGreaterThan(-1);
    expect(iPortrait).toBeGreaterThan(-1);

    expect(iLetter).toBeLessThan(iAbout);
    expect(iAbout).toBeLessThan(iMemos);
    expect(iMemos).toBeLessThan(iPortrait);
  });

  it("declara EXACTAMENTE 3 memos destacados con href a /memos", () => {
    const memoMatches = indexSource.match(/eyebrow:\s*"Memo/g) ?? [];
    expect(memoMatches).toHaveLength(3);
    expect(indexSource).toContain('href="/memos"');
  });

  it("el título de la página es 'Bit Gurú — Asesoría Estratégica'", () => {
    expect(indexSource).toContain(
      'title="Bit Gurú — Asesoría Estratégica"',
    );
  });
});
