import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Memos from "../../src/pages/memos.astro";
import {
  MEMO_LOADING_TEXT,
  MEMO_ERROR_TEXT,
} from "../../src/utils/memos-client";

// Tests de /memos (feature 22, Phase 4). Mismo patrón doble del repo
// (tests/pages/metodologia.test.ts):
//   Método 1 — Container API: MARKUP (acento olive único, un solo <h1>,
//     índice agrupado por trimestre con números en mono, estados de
//     carga/error accesibles server-rendered, sin <img>/gradiente).
//   Método 2 — readFileSync del SOURCE: composición (PageShell accent="olive",
//     reuso de componentes, script de hidratación que consume los endpoints
//     vía utils/memos-client SIN importar nada de pages/api).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const memosSource = source("../../src/pages/memos.astro");

const MEMO_NUMBERS = [
  "BG/M-014",
  "BG/M-013",
  "BG/M-012",
  "BG/M-011",
  "BG/M-010",
  "BG/M-009",
];

async function renderMemos(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Memos);
}

describe("memos.astro — markup (Container API)", () => {
  it("aplica acento OLIVE: el <main> lleva data-accent='olive'", async () => {
    const html = await renderMemos();
    expect(html).toMatch(/<main[^>]*data-accent="olive"/);
  });

  it("usa UNA sola familia de acento (un único data-accent en el documento)", async () => {
    const html = await renderMemos();
    const accents = html.match(/data-accent="[^"]*"/g) ?? [];
    expect(accents).toHaveLength(1);
    expect(accents[0]).toBe('data-accent="olive"');
  });

  it("tiene EXACTAMENTE un <h1> (EditorialHero breve)", async () => {
    const html = await renderMemos();
    const h1Count = (html.match(/<h1\b/g) ?? []).length;
    expect(h1Count).toBe(1);
    expect(html).toContain("Memorandos de la Firma");
  });

  it("el índice agrupa por trimestre: 3 secciones con etiqueta de trimestre", async () => {
    const html = await renderMemos();
    const sections =
      html.match(/<section[^>]*class="[^"]*\bquarter-group\b/g) ?? [];
    expect(sections).toHaveLength(3);
    const t2 = html.indexOf("T2 2026");
    const t1 = html.indexOf("T1 2026");
    const t4 = html.indexOf("T4 2025");
    expect(t2).toBeGreaterThan(-1);
    expect(t1).toBeGreaterThan(t2);
    expect(t4).toBeGreaterThan(t1);
  });

  it("renderiza las 6 MemoCard con su número de memo", async () => {
    const html = await renderMemos();
    const cards = html.match(/data-memo-card/g) ?? [];
    expect(cards).toHaveLength(6);
    for (const number of MEMO_NUMBERS) {
      expect(html).toContain(number);
    }
  });

  it("los números de memo van en elementos .memo-number (mono vía MemoCard)", async () => {
    const html = await renderMemos();
    const numbers = html.match(/class="[^"]*\bmemo-number\b/g) ?? [];
    expect(numbers).toHaveLength(6);
  });

  it("estado de carga server-rendered: role='status' con microcopy institucional", async () => {
    const html = await renderMemos();
    const statuses = html.match(/role="status"/g) ?? [];
    expect(statuses).toHaveLength(6);
    expect(html).toContain(MEMO_LOADING_TEXT);
  });

  it("estado de error accesible listo: role='alert' oculto con microcopy de registro", async () => {
    const html = await renderMemos();
    const alerts = html.match(/<p[^>]*data-memo-error[^>]*>/g) ?? [];
    expect(alerts).toHaveLength(6);
    for (const alertTag of alerts) {
      expect(alertTag).toContain('role="alert"');
      expect(alertTag).toContain("hidden");
    }
    expect(html).toContain(MEMO_ERROR_TEXT);
  });

  it("expone el tema de cada memo para el ?tema= de /api/wisdom-tweet", async () => {
    const html = await renderMemos();
    const temas = html.match(/data-memo-tema="[^"]+"/g) ?? [];
    expect(temas).toHaveLength(6);
    expect(html).toContain('data-memo-tema="la deuda técnica"');
  });

  it("ordena los bloques: hero → Índice Cronológico → archivo trimestral", async () => {
    const html = await renderMemos();
    const iHero = html.indexOf("Memorandos de la Firma");
    const iDivider = html.indexOf("Índice Cronológico");
    const iArchive = html.indexOf("quarter-group");
    expect(iHero).toBeGreaterThan(-1);
    expect(iDivider).toBeGreaterThan(iHero);
    expect(iArchive).toBeGreaterThan(iDivider);
  });

  it("NO contiene <img>, gradiente ni background-image", async () => {
    const html = await renderMemos();
    const lower = html.toLowerCase();
    expect(html).not.toContain("<img");
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("background-image");
  });

  it("copy sin lorem ni hype marketinero (sobre el HTML visible)", async () => {
    const html = await renderMemos();
    const lower = html.toLowerCase();
    expect(lower).not.toContain("lorem");
    expect(lower).not.toContain("revolucionari");
    expect(lower).not.toContain("disruptiv");
    expect(lower).not.toContain("game-changer");
  });
});

describe("memos.astro — source (composición + consumo de endpoints)", () => {
  it("compone con PageShell pasando accent='olive'", () => {
    expect(memosSource).toContain("import PageShell");
    expect(memosSource).toContain('<PageShell accent="olive">');
    // No mezcla otras familias de acento en la página.
    expect(memosSource).not.toContain('accent="burgundy"');
    expect(memosSource).not.toContain('accent="forest"');
  });

  it("reusa los primitivos sin reimplementarlos", () => {
    expect(memosSource).toContain("import EditorialHero");
    expect(memosSource).toContain("import SectionDivider");
    expect(memosSource).toContain("import Container");
    expect(memosSource).toContain("import Prose");
    expect(memosSource).toContain("import QuarterlyArchive");
    expect(memosSource).toContain("<QuarterlyArchive memos={MEMOS} />");
  });

  it("hidrata vía utils/memos-client (fetch client-side a los endpoints)", () => {
    expect(memosSource).toContain(
      'import { hydrateMemoCards } from "../utils/memos-client"',
    );
    expect(memosSource).toContain("hydrateMemoCards(document)");
  });

  it("NO importa ni modifica los endpoints (solo los consume por HTTP)", () => {
    expect(memosSource).not.toContain("pages/api");
    expect(memosSource).not.toContain("import { GET");
  });

  it("declara los 6 memorandos del índice con tema para ?tema=", () => {
    for (const number of MEMO_NUMBERS) {
      expect(memosSource).toContain(`number: "${number}"`);
    }
    expect(memosSource).toContain('tema: "la productividad tóxica"');
    expect(memosSource).toContain('tema: "las criptomonedas"');
  });

  it("el título de la página es 'Memos Trimestrales — Bit Gurú'", () => {
    expect(memosSource).toContain('title="Memos Trimestrales — Bit Gurú"');
  });

  it("registro consultora: catchphrases canónicas adaptadas a usted", () => {
    expect(memosSource).toContain("si eso le tranquiliza, créalo");
    expect(memosSource).toContain("Hoy las cartas indican que");
  });
});
