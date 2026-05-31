import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import TarotSection from "../../src/components/TarotSection.astro";

// Feature 13 — TarotSection.astro. Dos métodos (ver foundation.test.ts):
//   1. Container API → markup (id, nº de cartas, CTA visible).
//   2. readFileSync del source → CSS/tokens/copy/fetch (no aparecen en <style>).

const src = readFileSync(
  fileURLToPath(new URL("../../src/components/TarotSection.astro", import.meta.url)),
  "utf8",
);

describe("TarotSection — markup (Container API)", () => {
  it("renderiza el landmark con id='tarot'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TarotSection);
    expect(html).toContain('id="tarot"');
  });

  it("renderiza 3 contenedores de carta", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TarotSection);
    const matches = html.match(/data-card/g) ?? [];
    expect(matches.length).toBe(3);
  });

  it("muestra el CTA ritual 'TIRAR 3 ARCANOS'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TarotSection);
    expect(html).toContain("TIRAR 3 ARCANOS");
  });
});

describe("TarotSection — source (paleta, fetch, CSS)", () => {
  it("hace fetch al endpoint /api/tirada", () => {
    expect(src).toContain("/api/tirada");
  });

  it("el CTA de tirada usa var(--rosa) (único uso permitido)", () => {
    expect(src).toContain("var(--rosa");
  });

  it("usa clip-path para las cartas hexagonales", () => {
    expect(src).toContain("clip-path");
  });

  it("microcopy de error con filo cínico, no técnico", () => {
    expect(src).toMatch(/espíritus tienen lag/i);
  });

  it("NO usa el ámbar prohibido del mockup ni Tailwind por CDN", () => {
    expect(src).not.toMatch(/#ffb954/i);
    expect(src).not.toContain("cdn.tailwindcss.com");
  });
});
