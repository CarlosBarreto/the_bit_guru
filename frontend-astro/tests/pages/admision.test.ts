import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Admision from "../../src/pages/admision.astro";
import {
  ADMISION_LOADING_TEXT,
  ADMISION_SUCCESS_TEXT,
  ADMISION_ERROR_TEXT,
  ADMISION_REQUIRED_TEXT,
} from "../../src/utils/admision-client";

// Tests de /admision (feature 25, Phase 4). Mismo patrón doble del repo
// (tests/pages/memos.test.ts):
//   Método 1 — Container API: MARKUP (acento olive único, un solo <h1>,
//     IntakeForm con label por campo, aria-describedby/aria-invalid, estados
//     de confirmación/error accesibles server-rendered, sin <img>/gradiente).
//   Método 2 — readFileSync del SOURCE: composición (PageShell accent="olive",
//     reuso de primitivos, script que cablea los endpoints vía
//     utils/admision-client SIN importar nada de pages/api).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const pageSource = source("../../src/pages/admision.astro");
const formSource = source("../../src/components/IntakeForm.astro");

async function renderAdmision(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Admision);
}

describe("admision.astro — markup (Container API)", () => {
  it("aplica acento OLIVE: el <main> lleva data-accent='olive'", async () => {
    const html = await renderAdmision();
    expect(html).toMatch(/<main[^>]*data-accent="olive"/);
  });

  it("usa UNA sola familia de acento (un único data-accent en el documento)", async () => {
    const html = await renderAdmision();
    const accents = html.match(/data-accent="[^"]*"/g) ?? [];
    expect(accents).toHaveLength(1);
    expect(accents[0]).toBe('data-accent="olive"');
  });

  it("tiene EXACTAMENTE un <h1> (EditorialHero)", async () => {
    const html = await renderAdmision();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain("Solicitar evaluación preliminar");
  });

  it("ordena los bloques: hero → Expediente de Admisión → IntakeForm", async () => {
    const html = await renderAdmision();
    const iHero = html.indexOf("Solicitar evaluación preliminar");
    const iDivider = html.indexOf("Expediente de Admisión");
    const iForm = html.indexOf("data-intake-form");
    expect(iHero).toBeGreaterThan(-1);
    expect(iDivider).toBeGreaterThan(iHero);
    expect(iForm).toBeGreaterThan(iDivider);
  });

  it("renderiza el IntakeForm con method post y action a un endpoint existente", async () => {
    const html = await renderAdmision();
    const formTag = html.match(/<form[^>]*data-intake-form[^>]*>/);
    expect(formTag).not.toBeNull();
    expect(formTag![0]).toMatch(/method="post"/i);
    expect(formTag![0]).toMatch(/action="\/api\/reading"/);
  });

  it("cada campo tiene <label> asociado por for/id", async () => {
    const html = await renderAdmision();
    // textarea del problema estratégico
    expect(html).toMatch(/<label[^>]*for="problema"/);
    expect(html).toMatch(/<textarea[^>]*id="problema"/);
    // selector de tipo: legend + radios envueltos en su <label>
    expect(html).toContain("<legend");
    const radios = html.match(/<input[^>]*type="radio"[^>]*name="tipo"/g) ?? [];
    expect(radios.length).toBe(2);
  });

  it("el textarea declara aria-describedby, aria-invalid y required", async () => {
    const html = await renderAdmision();
    const ta = html.match(/<textarea[^>]*id="problema"[^>]*>/);
    expect(ta).not.toBeNull();
    expect(ta![0]).toContain('aria-describedby="problema-help problema-error"');
    expect(ta![0]).toContain('aria-invalid="false"');
    expect(ta![0]).toMatch(/\brequired\b/);
    // El destino del aria-describedby existe.
    expect(html).toMatch(/id="problema-help"/);
    expect(html).toMatch(/id="problema-error"/);
  });

  it("ConfirmationState con role='status' y aria-live='polite'", async () => {
    const html = await renderAdmision();
    const confirm = html.match(/<div[^>]*data-intake-confirm[^>]*>/);
    expect(confirm).not.toBeNull();
    expect(confirm![0]).toContain('role="status"');
    expect(confirm![0]).toContain('aria-live="polite"');
    expect(confirm![0]).toContain("hidden");
    expect(html).toContain(ADMISION_SUCCESS_TEXT);
  });

  it("ErrorState con role='alert' oculto y microcopy de registro", async () => {
    const html = await renderAdmision();
    const err = html.match(/<p[^>]*data-intake-error[^>]*>/);
    expect(err).not.toBeNull();
    expect(err![0]).toContain('role="alert"');
    expect(err![0]).toContain("hidden");
    expect(html).toContain(ADMISION_ERROR_TEXT);
  });

  it("estado de carga server-rendered: role='status' con microcopy institucional", async () => {
    const html = await renderAdmision();
    const status = html.match(/<p[^>]*data-intake-status[^>]*>/);
    expect(status).not.toBeNull();
    expect(status![0]).toContain('role="status"');
    expect(html).toContain(ADMISION_LOADING_TEXT);
  });

  it("el error de campo (validación) está vinculado por id y oculto de inicio", async () => {
    const html = await renderAdmision();
    const fieldError = html.match(/<p[^>]*data-intake-field-error[^>]*>/);
    expect(fieldError).not.toBeNull();
    expect(fieldError![0]).toContain('id="problema-error"');
    expect(fieldError![0]).toContain("hidden");
    expect(html).toContain(ADMISION_REQUIRED_TEXT);
  });

  it("NO contiene <img>, gradiente, glow ni background-image", async () => {
    const html = await renderAdmision();
    const lower = html.toLowerCase();
    expect(html).not.toContain("<img");
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("background-image");
    expect(lower).not.toContain("box-shadow");
    expect(lower).not.toContain("text-shadow");
  });

  it("copy sin lorem ni hype marketinero (sobre el HTML visible)", async () => {
    const html = await renderAdmision();
    const lower = html.toLowerCase();
    expect(lower).not.toContain("lorem");
    expect(lower).not.toContain("revolucionari");
    expect(lower).not.toContain("disruptiv");
    expect(lower).not.toContain("game-changer");
    expect(html).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe("admision.astro — source (composición + consumo de endpoints)", () => {
  it("compone con PageShell pasando accent='olive'", () => {
    expect(pageSource).toContain("import PageShell");
    expect(pageSource).toContain('<PageShell accent="olive">');
    expect(pageSource).not.toContain('accent="burgundy"');
    expect(pageSource).not.toContain('accent="forest"');
  });

  it("reusa los primitivos sin reimplementarlos", () => {
    expect(pageSource).toContain("import Layout");
    expect(pageSource).toContain("import Container");
    expect(pageSource).toContain("import EditorialHero");
    expect(pageSource).toContain("import SectionDivider");
    expect(pageSource).toContain("import Prose");
    expect(pageSource).toContain("import IntakeForm");
    expect(pageSource).toContain("<IntakeForm />");
  });

  it("cablea el form vía utils/admision-client (fetch client-side)", () => {
    expect(pageSource).toContain(
      'import { wireIntakeForm } from "../utils/admision-client"',
    );
    expect(pageSource).toContain("wireIntakeForm(document)");
  });

  it("NO importa ni modifica los endpoints (solo los consume por HTTP)", () => {
    expect(pageSource).not.toContain("pages/api");
    expect(formSource).not.toContain("pages/api");
    expect(pageSource).not.toContain("import { POST");
    expect(formSource).not.toContain("import { POST");
  });

  it("el IntakeForm cablea /api/reading y /api/pregunta vía el cliente", () => {
    // El componente referencia el endpoint por defecto desde el cliente,
    // no lo redefine inline.
    expect(formSource).toContain("READING_ENDPOINT");
    expect(formSource).toContain('from "../utils/admision-client"');
  });

  it("el título de la página es 'Admisión de Clientes — Bit Gurú'", () => {
    expect(pageSource).toContain('title="Admisión de Clientes — Bit Gurú"');
  });

  it("registro consultora: catchphrases canónicas adaptadas a usted", () => {
    expect(pageSource).toContain("si eso le tranquiliza, créalo");
    expect(pageSource).toContain("Hoy las cartas indican que");
  });

  it("el IntakeForm no usa gradiente/glow/dark-mode en su <style>", () => {
    // Escopa la prohibición al bloque <style> (los comentarios en español del
    // frontmatter contienen "gradiente" como prosa; precedente features 20-23).
    const styleBlock = formSource.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
    const lower = styleBlock.toLowerCase();
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("box-shadow");
    expect(lower).not.toContain("text-shadow");
    expect(lower).not.toContain("prefers-color-scheme");
    // Sin hex de marca sueltos en el CSS: solo tokens var(--...).
    expect(styleBlock).not.toContain("#");
    expect(formSource).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
