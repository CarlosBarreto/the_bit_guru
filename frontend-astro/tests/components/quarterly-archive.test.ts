import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import QuarterlyArchive from "../../src/components/QuarterlyArchive.astro";
import type { MemoEntry } from "../../src/utils/memos-client";

// Tests de QuarterlyArchive.astro (feature 22, Phase 4). Patrón doble del repo:
//   Método 1 — Container API: agrupación por trimestre, orden cronológico
//     preservado, lista hairline con una MemoCard por entrada.
//   Método 2 — readFileSync del SOURCE: hairlines var(--ink-rule), etiqueta de
//     trimestre en mono, reuso de MemoCard, cero hex/gradiente/glow en el CSS.

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const archiveSource = source("../../src/components/QuarterlyArchive.astro");
const archiveStyle = styleBlock(archiveSource);

// Entradas de muestra: 3 trimestres en orden cronológico descendente.
const MEMOS: MemoEntry[] = [
  { number: "BG/M-014", title: "Memo de productividad", quarter: "T2 2026" },
  { number: "BG/M-013", title: "Memo de inteligencia", quarter: "T2 2026" },
  { number: "BG/M-012", title: "Memo de redes", quarter: "T1 2026" },
  { number: "BG/M-011", title: "Memo de deuda", quarter: "T1 2026" },
  { number: "BG/M-010", title: "Memo de activos", quarter: "T4 2025" },
];

async function renderArchive(memos: MemoEntry[] = MEMOS): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(QuarterlyArchive, { props: { memos } });
}

describe("QuarterlyArchive.astro — markup (Container API)", () => {
  it("agrupa por trimestre: una <section> por trimestre distinto", async () => {
    const html = await renderArchive();
    const sections = html.match(/<section[^>]*class="[^"]*\bquarter-group\b/g) ?? [];
    expect(sections).toHaveLength(3);
  });

  it("cada trimestre lleva su <h2> etiquetado y accesible (aria-labelledby)", async () => {
    const html = await renderArchive();
    for (const [id, label] of [
      ["trimestre-t2-2026", "T2 2026"],
      ["trimestre-t1-2026", "T1 2026"],
      ["trimestre-t4-2025", "T4 2025"],
    ]) {
      expect(html).toContain(`aria-labelledby="${id}"`);
      expect(html).toMatch(
        new RegExp(`<h2[^>]*id="${id}"[^>]*>\\s*${label}\\s*</h2>`),
      );
    }
  });

  it("preserva el orden cronológico recibido (más reciente primero)", async () => {
    const html = await renderArchive();
    const t2 = html.indexOf("T2 2026");
    const t1 = html.indexOf("T1 2026");
    const t4 = html.indexOf("T4 2025");
    expect(t2).toBeGreaterThan(-1);
    expect(t1).toBeGreaterThan(t2);
    expect(t4).toBeGreaterThan(t1);
  });

  it("cada memo cae DENTRO de la sección de su trimestre", async () => {
    const html = await renderArchive();
    const sectionStarts = [
      html.indexOf('aria-labelledby="trimestre-t2-2026"'),
      html.indexOf('aria-labelledby="trimestre-t1-2026"'),
      html.indexOf('aria-labelledby="trimestre-t4-2025"'),
      html.length,
    ];
    const expectedBySection: string[][] = [
      ["BG/M-014", "BG/M-013"],
      ["BG/M-012", "BG/M-011"],
      ["BG/M-010"],
    ];
    expectedBySection.forEach((numbers, i) => {
      for (const number of numbers) {
        const pos = html.indexOf(number);
        expect(pos, `${number} en sección ${i}`).toBeGreaterThan(
          sectionStarts[i],
        );
        expect(pos).toBeLessThan(sectionStarts[i + 1]);
      }
    });
  });

  it("renderiza una lista <ol> con un <li> por memorando (5 en total)", async () => {
    const html = await renderArchive();
    const ols = html.match(/<ol[^>]*class="[^"]*\bmemo-list\b/g) ?? [];
    expect(ols).toHaveLength(3);
    const items = html.match(/<li[^>]*class="[^"]*\bmemo-item\b/g) ?? [];
    expect(items).toHaveLength(5);
  });

  it("compone una MemoCard por entrada (ganchos data-memo-card)", async () => {
    const html = await renderArchive();
    const cards = html.match(/data-memo-card/g) ?? [];
    expect(cards).toHaveLength(5);
  });

  it("sin <img>, sin gradiente, sin centrado de prosa", async () => {
    const html = await renderArchive();
    const lower = html.toLowerCase();
    expect(html).not.toContain("<img");
    expect(lower).not.toContain("gradient");
    expect(lower).not.toContain("background-image");
  });
});

describe("QuarterlyArchive.astro — source (lista hairline + tokens)", () => {
  it("usa hairlines 1px var(--ink-rule) para grupos y separación de memos", () => {
    expect(archiveStyle).toContain("border-top: 1px solid var(--ink-rule)");
    expect(archiveStyle).toContain(".memo-item + .memo-item");
  });

  it("la etiqueta del trimestre va en --font-mono (registro de índice)", () => {
    const rule = archiveStyle.match(/\.quarter-label \{[\s\S]*?\}/)?.[0];
    expect(rule).toBeTruthy();
    expect(rule).toContain("font-family: var(--font-mono)");
  });

  it("reusa MemoCard sin reimplementarla", () => {
    expect(archiveSource).toContain('import MemoCard from "./MemoCard.astro"');
    expect(archiveSource).toContain("<MemoCard {...memo} />");
  });

  it("agrupa preservando el orden de aparición (no reordena)", () => {
    expect(archiveSource).toContain("groups.find(");
    expect(archiveSource).not.toContain(".sort(");
  });

  it("alinea a la izquierda y no introduce hex sueltos, gradiente o glow (CSS)", () => {
    const css = archiveStyle.toLowerCase();
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
  });
});
