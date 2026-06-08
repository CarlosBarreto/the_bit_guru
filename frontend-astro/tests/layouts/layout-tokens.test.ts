import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Contrato de tokens del rediseño (feature 14, Phase 1). Lee el SOURCE de
// Layout.astro como texto y assertea sobre el bloque <style is:global>: el
// pipeline de Astro no incluye el contenido de <style> en renderToString, así
// que el contrato de tokens se valida sobre el código fuente (patrón método 2
// de tests/components/foundation.test.ts). Garantiza: (a) presencia de TODOS
// los tokens de docs/design/redesign_advisory_spec.md, (b) los 3 selectores
// [data-accent=...], (c) ausencia de los patrones prohibidos (hex neón viejos,
// gradiente, Tailwind por CDN).

const layoutSource = readFileSync(
  fileURLToPath(new URL("../../src/layouts/Layout.astro", import.meta.url)),
  "utf8",
);
const src = layoutSource.toLowerCase();

describe("Layout.astro — contrato de tokens del rediseño (feature 14)", () => {
  const requiredTokens = [
    // NEUTRALS
    "--paper:",
    "--paper-pure:",
    "--paper-shade:",
    "--paper-deep:",
    // NAVY
    "--ink-deep:",
    "--ink:",
    "--ink-muted:",
    "--ink-rule:",
    "--ink-wash:",
    // BURGUNDY
    "--burgundy-deep:",
    "--burgundy:",
    "--burgundy-bright:",
    "--burgundy-wash:",
    // OLIVE
    "--olive-deep:",
    "--olive:",
    "--olive-bright:",
    "--olive-wash:",
    // FOREST
    "--forest-deep:",
    "--forest:",
    "--forest-bright:",
    "--forest-wash:",
    // ALIAS DE ACENTO
    "--accent-deep:",
    "--accent:",
    "--accent-bright:",
    "--accent-wash:",
    // TIPOGRAFÍA
    "--font-serif:",
    "--font-sans:",
    "--font-mono:",
    // ESCALA TIPOGRÁFICA (ratio 1.25)
    "--step--1:",
    "--step-0:",
    "--step-1:",
    "--step-2:",
    "--step-3:",
    "--step-4:",
    "--step-5:",
    // ESPACIADO (8px)
    "--space-1:",
    "--space-2:",
    "--space-3:",
    "--space-4:",
    "--space-5:",
    "--space-6:",
    "--space-7:",
    "--space-8:",
    "--space-9:",
    "--space-10:",
    // FORMA
    "--radius:",
    "--measure:",
  ];

  it.each(requiredTokens)("define el token %s", (token) => {
    expect(src).toContain(token);
  });

  it("usa los hex canónicos de la tabla de neutrals/navy", () => {
    expect(src).toContain("--paper: #f6f4ee");
    expect(src).toContain("--ink: #16293b");
    expect(src).toContain("--ink-deep: #0b1b2d");
  });

  it("usa los hex canónicos de las tres familias de acento", () => {
    expect(src).toContain("--burgundy: #7c1d33");
    expect(src).toContain("--olive: #54501a");
    expect(src).toContain("--forest: #1a4636");
  });

  it("define las tres familias tipográficas editoriales", () => {
    expect(src).toContain('"source serif 4"');
    expect(src).toContain('"ibm plex sans"');
    expect(src).toContain('"ibm plex mono"');
  });

  it("fija --radius a 2px y --measure a 68ch", () => {
    expect(src).toContain("--radius: 2px");
    expect(src).toContain("--measure: 68ch");
  });

  it("el acento por defecto (Inicio) es neutro navy", () => {
    expect(src).toContain("--accent: var(--ink)");
  });
});

describe("Layout.astro — selectores de acento por página", () => {
  const accentSelectors = [
    '[data-accent="burgundy"]',
    '[data-accent="olive"]',
    '[data-accent="forest"]',
  ];

  it.each(accentSelectors)("remapea --accent* en %s", (selector) => {
    expect(layoutSource).toContain(selector);
  });
});

describe("Layout.astro — base editorial light-only", () => {
  it("el body usa --paper como fondo y --ink como color base", () => {
    expect(src).toContain("background: var(--paper)");
    expect(src).toContain("color: var(--ink)");
  });

  it("conserva el bloque prefers-reduced-motion global", () => {
    expect(layoutSource).toContain("prefers-reduced-motion: reduce");
  });

  it("carga las fuentes editoriales desde Google Fonts", () => {
    expect(layoutSource).toContain("Source+Serif+4");
    expect(layoutSource).toContain("IBM+Plex+Sans");
    expect(layoutSource).toContain("IBM+Plex+Mono");
  });
});

describe("Layout.astro — patrones prohibidos (HARD PROHIBITIONS)", () => {
  const bannedNeonHex = ["#7b2cbf", "#00f0ff", "#ff2d95", "#0a0a0f"];

  it.each(bannedNeonHex)("no contiene el hex neón obsoleto %s", (hex) => {
    expect(src).not.toContain(hex);
  });

  it("no usa gradientes CSS (linear/radial/conic)", () => {
    expect(src).not.toContain("linear-gradient");
    expect(src).not.toContain("radial-gradient");
    expect(src).not.toContain("conic-gradient");
  });

  it("no carga Tailwind por CDN", () => {
    expect(src).not.toContain("cdn.tailwindcss.com");
  });

  it("no carga las fuentes obsoletas (Plus Jakarta / Be Vietnam / Playfair / JetBrains)", () => {
    expect(layoutSource).not.toContain("Plus+Jakarta");
    expect(layoutSource).not.toContain("Be+Vietnam");
    expect(layoutSource).not.toContain("Playfair+Display");
    expect(layoutSource).not.toContain("JetBrains+Mono");
  });
});
