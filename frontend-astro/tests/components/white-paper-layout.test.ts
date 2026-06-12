import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import WhitePaperLayout from "../../src/components/WhitePaperLayout.astro";

// Tests de WhitePaperLayout.astro (feature 21, Phase 3). Patrón doble del repo:
//   Método 1 — Container API: valida el MARKUP (portada, índice, secciones
//     numeradas, slots nombrados por id de sección, nota al margen condicional).
//   Método 2 — readFileSync del SOURCE: valida el bloque <style> (solo tokens,
//     sin hex/gradiente/glow) y el uso de --font-mono para código/números.

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const layoutSource = source("../../src/components/WhitePaperLayout.astro");
const layoutStyle = styleBlock(layoutSource);

const PROPS = {
  code: "BG/WP-000 · REV. 1",
  title: "Documento de prueba",
  deck: "Un deck institucional de prueba.",
  meta: [
    { label: "Clasificación", value: "Distribución restringida" },
    { label: "Práctica", value: "Diagnóstico Estratégico" },
  ],
  sections: [
    { id: "seccion-uno", title: "Primera sección", note: "Nota al margen seca." },
    { id: "seccion-dos", title: "Segunda sección" },
  ],
};

const SLOTS = {
  "seccion-uno": "<p data-marker-uno>Cuerpo de la primera sección.</p>",
  "seccion-dos": "<p data-marker-dos>Cuerpo de la segunda sección.</p>",
};

async function render(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(WhitePaperLayout, {
    props: PROPS,
    slots: SLOTS,
  });
}

describe("WhitePaperLayout.astro — markup (Container API)", () => {
  it("renderiza la portada: código de documento + UN <h1> + deck", async () => {
    const html = await render();
    expect(html).toContain("BG/WP-000 · REV. 1");
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain("Documento de prueba");
    expect(html).toContain("Un deck institucional de prueba.");
  });

  it("renderiza los metadatos de portada como <dl> con dt/dd", async () => {
    const html = await render();
    expect(html).toMatch(/<dl[^>]*class="[^"]*\bmeta\b/);
    expect(html).toContain("Clasificación");
    expect(html).toContain("Distribución restringida");
    expect(html).toContain("Diagnóstico Estratégico");
  });

  it("renderiza el índice: <nav aria-label='Índice'> con enlaces #id", async () => {
    const html = await render();
    expect(html).toMatch(/<nav[^>]*aria-label="Índice"/);
    expect(html).toContain('href="#seccion-uno"');
    expect(html).toContain('href="#seccion-dos"');
  });

  it("numera las secciones (1., 2.) en índice y encabezados", async () => {
    const html = await render();
    expect(html).toContain(">1.</span>");
    expect(html).toContain(">2.</span>");
  });

  it("cada sección es un <section id> con aria-labelledby a su h2", async () => {
    const html = await render();
    expect(html).toMatch(
      /<section[^>]*id="seccion-uno"[^>]*aria-labelledby="seccion-uno-title"|<section[^>]*aria-labelledby="seccion-uno-title"[^>]*id="seccion-uno"/,
    );
    expect(html).toContain('id="seccion-uno-title"');
    expect(html).toContain('id="seccion-dos-title"');
    expect(html).toContain("Primera sección");
    expect(html).toContain("Segunda sección");
  });

  it("inyecta el slot nombrado de cada sección dentro de su <section>", async () => {
    const html = await render();
    const seccionUno = html.slice(
      html.indexOf('id="seccion-uno"'),
      html.indexOf('id="seccion-dos"'),
    );
    expect(seccionUno).toContain("data-marker-uno");
    expect(seccionUno).not.toContain("data-marker-dos");
    expect(html).toContain("Cuerpo de la segunda sección.");
  });

  it("la nota al margen es condicional: presente con note, ausente sin note", async () => {
    const html = await render();
    expect(html).toContain("Nota al margen seca.");
    const asideCount = (html.match(/<aside\b/g) ?? []).length;
    // Solo la sección uno declara note.
    expect(asideCount).toBe(1);
  });

  it("NO contiene ningún <img> (documento tipográfico puro)", async () => {
    const html = await render();
    expect(html).not.toContain("<img");
  });
});

describe("WhitePaperLayout.astro — source (tokens, sin prohibiciones)", () => {
  it("no introduce hex sueltos, gradiente ni sombras en el CSS", () => {
    const css = layoutStyle.toLowerCase();
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });

  it("usa --font-mono para código de documento y números de sección", () => {
    expect(layoutStyle).toContain("var(--font-mono)");
    expect(layoutSource).toContain("doc-code");
    expect(layoutSource).toContain("section-number");
  });

  it("resuelve los cuerpos de sección con Astro.slots.render(section.id)", () => {
    expect(layoutSource).toContain("Astro.slots.render(section.id)");
  });
});
