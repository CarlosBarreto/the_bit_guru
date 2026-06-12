import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import MemoCard from "../../src/components/MemoCard.astro";
import {
  MEMO_LOADING_TEXT,
  MEMO_ERROR_TEXT,
  EPIGRAPH_SOURCE_TEXT,
} from "../../src/utils/memos-client";

// Tests de MemoCard.astro (feature 22, Phase 4). Patrón doble del repo
// (tests/components/insight-card.test.ts):
//   Método 1 — Container API: MARKUP (número/trimestre, estados de carga/error
//     accesibles, epígrafe y fecha condicionales, ganchos data-memo-* de la
//     hidratación).
//   Método 2 — readFileSync del SOURCE: bloque <style> (mono para metadatos,
//     hairline/filete de acento, cero hex/gradiente/glow) y microcopy
//     compartida con utils/memos-client.ts.

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

// La auditoría de paleta (hex / gradiente / glow) aplica al CSS, no a los
// comentarios en prosa de la cabecera del componente.
function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const cardSource = source("../../src/components/MemoCard.astro");
const cardStyle = styleBlock(cardSource);

const BASE_PROPS = {
  number: "BG/M-014",
  title: "Sobre la productividad como pasivo espiritual",
  quarter: "T2 2026",
};

async function renderCard(extra: Record<string, unknown> = {}): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(MemoCard, {
    props: { ...BASE_PROPS, ...extra },
  });
}

describe("MemoCard.astro — markup (Container API)", () => {
  it("renderiza un <article> con los ganchos de hidratación y estado inicial 'loading'", async () => {
    const html = await renderCard();
    const articleTag = html.match(/<article[^>]*>/)?.[0] ?? "";
    expect(articleTag).toContain("data-memo-card");
    expect(articleTag).toContain('data-memo-state="loading"');
  });

  it("muestra el número de memo y el trimestre (metadatos mono)", async () => {
    const html = await renderCard();
    expect(html).toMatch(/<p[^>]*class="[^"]*\bmemo-number\b[^"]*"[^>]*>BG\/M-014<\/p>/);
    expect(html).toMatch(/<p[^>]*class="[^"]*\bmemo-quarter\b[^"]*"[^>]*>T2 2026<\/p>/);
  });

  it("el asunto va en <h3> (jerarquía editorial bajo el h2 del trimestre)", async () => {
    const html = await renderCard();
    expect(html).toMatch(/<h3[^>]*class="[^"]*\bmemo-title\b/);
    expect(html).toContain("Sobre la productividad como pasivo espiritual");
  });

  it("estado de carga accesible: role='status' + aria-live con microcopy institucional", async () => {
    const html = await renderCard();
    const bodyTag = html.match(/<p[^>]*data-memo-body[^>]*>/)?.[0] ?? "";
    expect(bodyTag).toContain('role="status"');
    expect(bodyTag).toContain('aria-live="polite"');
    expect(html).toContain(MEMO_LOADING_TEXT);
  });

  it("estado de error accesible: role='alert' OCULTO con microcopy de registro", async () => {
    const html = await renderCard();
    const alertTag = html.match(/<p[^>]*data-memo-error[^>]*>/)?.[0] ?? "";
    expect(alertTag).toContain('role="alert"');
    expect(alertTag).toContain("hidden");
    expect(html).toContain(MEMO_ERROR_TEXT);
  });

  it("expone data-memo-tema SOLO cuando se pasa tema (alimenta ?tema=)", async () => {
    const sin = await renderCard();
    expect(sin).not.toContain("data-memo-tema");

    const con = await renderCard({ tema: "la deuda técnica" });
    expect(con).toContain('data-memo-tema="la deuda técnica"');
  });

  it("incluye el epígrafe (oculto, con atribución) SOLO con withEpigraph", async () => {
    const sin = await renderCard();
    expect(sin).not.toContain("<blockquote");

    const con = await renderCard({ withEpigraph: true });
    const blockTag = con.match(/<blockquote[^>]*>/)?.[0] ?? "";
    expect(blockTag).toContain("data-memo-epigraph");
    expect(blockTag).toContain("hidden");
    expect(con).toContain("data-memo-epigraph-text");
    expect(con).toContain(EPIGRAPH_SOURCE_TEXT);
  });

  it("incluye la fecha de registro (mono) SOLO cuando se pasa la prop", async () => {
    const sin = await renderCard();
    expect(sin).not.toContain('class="memo-date"');

    const con = await renderCard({ date: "2026-05-12" });
    expect(con).toContain('class="memo-date"');
    expect(con).toContain("Registrado: 2026-05-12");
  });

  it("no contiene <img> ni elementos visuales prohibidos", async () => {
    const html = await renderCard({ withEpigraph: true, date: "2026-05-12" });
    const lower = html.toLowerCase();
    expect(html).not.toContain("<img");
    expect(lower).not.toContain("background-image");
    expect(lower).not.toContain("gradient");
  });
});

describe("MemoCard.astro — source (tokens + microcopy compartida)", () => {
  it("número, trimestre y fecha usan --font-mono (números de memo en mono)", () => {
    for (const selector of [".memo-number", ".memo-quarter", ".memo-date"]) {
      const rule = cardStyle.match(
        new RegExp(`\\${selector} \\{[\\s\\S]*?\\}`),
      )?.[0];
      expect(rule, `regla ${selector}`).toBeTruthy();
      expect(rule).toContain("font-family: var(--font-mono)");
    }
  });

  it("la microcopy de carga/error viene de utils/memos-client (una sola fuente)", () => {
    expect(cardSource).toContain("MEMO_LOADING_TEXT");
    expect(cardSource).toContain("MEMO_ERROR_TEXT");
    expect(cardSource).toContain('from "../utils/memos-client"');
  });

  it("epígrafe y error llevan filete de acento (2px var(--accent)), sin caja InsightCard", () => {
    expect(cardStyle).toContain("border-left: 2px solid var(--accent)");
    // La variante NO duplica el borde-caja de InsightCard: la lista hairline
    // de QuarterlyArchive pone la separación.
    expect(cardStyle).not.toContain("border: 1px solid var(--ink-rule)");
  });

  it("alinea a la izquierda y no introduce hex sueltos, gradiente o glow (CSS)", () => {
    const css = cardStyle.toLowerCase();
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });

  it("no fija familia de acento propia: consume --accent* remapeados por la página", () => {
    expect(cardSource).not.toContain("--olive");
    expect(cardSource).not.toContain("--burgundy");
    expect(cardSource).not.toContain("--forest");
    expect(cardStyle).toContain("var(--accent)");
  });
});
