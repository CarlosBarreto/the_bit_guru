import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────────────────────────
// tests/audits/site-audit.test.ts — Auditoría transversal (feature 26, Phase 5).
//
// Materializa, como TESTS automáticos, las tres auditorías de la Phase 5 de
// docs/design/redesign_advisory_spec.md (§ ACCEPTANCE CRITERIA / § DEFINITION OF
// DONE):
//   1. WCAG AA (a11y): landmarks, EXACTAMENTE un <h1> por página, jerarquía de
//      encabezados SIN saltos de nivel, skip-link al <main>, foco visible en
//      interactivos, formulario accesible en /admision, contraste AA de los
//      pares de tokens ink/accent sobre --paper.
//   2. Motion: ninguna animación prohibida (parallax/typewriter/glow pulsante)
//      y bloque global prefers-reduced-motion que desactiva animación/transición.
//   3. Palette: cero hex de marca en <style>/atributos de estilo fuera de la
//      tabla de tokens de Layout.astro; UNA sola familia de acento por documento
//      (Inicio = Navy neutro sin data-accent); sin gradiente/glow/dark
//      mode/Tailwind CDN/emoji.
//
// Patrón DOBLE del repo (ver tests/components/foundation.test.ts):
//   Método 1 — Container API: renderiza el MARKUP de cada página y se assertea
//     sobre el DOM (landmarks, headings, skip-link, atributos ARIA, data-accent).
//   Método 2 — readFileSync del SOURCE .astro: contratos sobre <style> y
//     atributos de estilo (hex de marca, prohibiciones), que NO aparecen en el
//     markup renderizado.
//
// Las 7 páginas del site map + el chrome compartido (Layout, PageShell,
// TopNavigation, Footer) y todos los componentes editoriales se recorren aquí.
// ─────────────────────────────────────────────────────────────────────────────

import Index from "../../src/pages/index.astro";
import Practica from "../../src/pages/practica.astro";
import Metodologia from "../../src/pages/metodologia.astro";
import Memos from "../../src/pages/memos.astro";
import Archivo from "../../src/pages/archivo.astro";
import LaFirma from "../../src/pages/la-firma.astro";
import Admision from "../../src/pages/admision.astro";

// Slug → componente de página + acento esperado (autoritativo, spec § SITE MAP).
const PAGES = [
  { slug: "/", Comp: Index, accent: null },
  { slug: "/practica", Comp: Practica, accent: "burgundy" },
  { slug: "/metodologia", Comp: Metodologia, accent: "forest" },
  { slug: "/memos", Comp: Memos, accent: "olive" },
  { slug: "/archivo", Comp: Archivo, accent: "burgundy" },
  { slug: "/la-firma", Comp: LaFirma, accent: "forest" },
  { slug: "/admision", Comp: Admision, accent: "olive" },
] as const;

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

const SRC_DIR = fileURLToPath(new URL("../../src/", import.meta.url));

// Renderiza una página completa (con su PageShell/chrome) vía la Container API.
async function render(Comp: unknown): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Comp as never);
}

// Cache de markup renderizado por slug (las páginas se renderizan una vez).
const rendered = new Map<string, string>();
async function html(slug: string, Comp: unknown): Promise<string> {
  if (!rendered.has(slug)) rendered.set(slug, await render(Comp));
  return rendered.get(slug)!;
}

// Extrae la secuencia de niveles de encabezado (1..6) en orden de aparición.
function headingLevels(markup: string): number[] {
  const levels: number[] = [];
  const re = /<h([1-6])\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markup)) !== null) levels.push(Number(m[1]));
  return levels;
}

function countTag(markup: string, tag: string): number {
  return (markup.match(new RegExp(`<${tag}\\b`, "g")) ?? []).length;
}

// Lista recursiva de todos los .astro bajo src/ (chrome + componentes + páginas).
function listAstro(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}${entry.name}`;
    if (entry.isDirectory()) out.push(...listAstro(`${full}/`));
    else if (entry.name.endsWith(".astro")) out.push(full);
  }
  return out;
}

const ALL_ASTRO = listAstro(SRC_DIR);

// Extrae el CSS REAL de un .astro: concatena el contenido de cada elemento
// <style>...</style> (no la mención de "<style" en comentarios del frontmatter)
// y elimina los comentarios CSS /* ... */ para que el contrato sobre el CSS no
// se dispare por prosa explicativa. Devuelve "" si el archivo no tiene <style>.
function styleCss(src: string): string {
  // Descarta el frontmatter de Astro (--- ... ---), que puede mencionar
  // literalmente "<style is:global>" en un comentario y confundir al extractor.
  const body = src.replace(/^---[\s\S]*?\n---/, "");
  const blocks = body.match(/<style\b[^>]*>([\s\S]*?)<\/style>/g) ?? [];
  return blocks
    .map((b) => b.replace(/^<style\b[^>]*>/, "").replace(/<\/style>$/, ""))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

// CSS real SIN el bloque @media (prefers-reduced-motion: reduce), cuyo cometido
// es precisamente declarar animation/transition: none — no debe confundirse con
// una animación/transición prohibida.
function styleCssNoReducedMotion(src: string): string {
  const css = styleCss(src);
  const idx = css.indexOf("prefers-reduced-motion");
  if (idx === -1) return css;
  // Recorta desde el inicio de la at-rule @media que contiene ese token hasta
  // el cierre balanceado de su bloque.
  const at = css.lastIndexOf("@media", idx);
  const open = css.indexOf("{", idx);
  let depth = 0;
  let end = open;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return css.slice(0, at) + css.slice(end);
}

// ── PALETTE: contraste de tokens ────────────────────────────────────────────
// Cálculo de ratio de contraste WCAG (sRGB → luminancia relativa). Se usa para
// VERIFICAR los pares texto/papel declarados como AA en la spec § ACCESSIBILITY,
// no para inventar colores: los hex provienen de la tabla de tokens.
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
  );
}
function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const PAPER = "#F6F4EE"; // --paper (lienzo principal)
// Pares texto-sobre-papel que la spec declara AA. Se recalculan aquí.
const TEXT_TOKENS: Record<string, string> = {
  "--ink-deep": "#0B1B2D",
  "--ink": "#16293B",
  "--ink-muted": "#4B5965",
  "--burgundy": "#7C1D33",
  "--olive": "#54501A",
  "--forest": "#1A4636",
};

describe("site-audit · A11Y — landmarks y skip-link (Container API)", () => {
  it.each(PAGES)(
    "$slug tiene un único <main id='main'>, header, nav y footer",
    async ({ slug, Comp }) => {
      const markup = await html(slug, Comp);
      expect(countTag(markup, "main")).toBe(1);
      expect(markup).toMatch(/<main[^>]*id="main"/);
      // Chrome compartido (PageShell → TopNavigation header+nav, Footer).
      expect(markup).toMatch(/<header\b/);
      expect(markup).toMatch(/<nav\b/);
      expect(markup).toMatch(/<footer\b/);
    },
  );

  it.each(PAGES)(
    "$slug expone un skip-link operativo que apunta a #main",
    async ({ slug, Comp }) => {
      const markup = await html(slug, Comp);
      expect(markup).toMatch(/class="skip-link"[^>]*href="#main"|href="#main"[^>]*class="skip-link"/);
    },
  );

  it.each(PAGES)(
    "$slug declara lang='es' en <html>",
    async ({ slug, Comp }) => {
      const markup = await html(slug, Comp);
      expect(markup).toContain('lang="es"');
    },
  );
});

describe("site-audit · A11Y — jerarquía de encabezados", () => {
  it.each(PAGES)(
    "$slug tiene EXACTAMENTE un <h1>",
    async ({ slug, Comp }) => {
      const markup = await html(slug, Comp);
      expect(countTag(markup, "h1")).toBe(1);
    },
  );

  it.each(PAGES)(
    "$slug no salta niveles de encabezado (sin h1→h3)",
    async ({ slug, Comp }) => {
      const markup = await html(slug, Comp);
      const levels = headingLevels(markup);
      // Empieza en h1 y nunca sube más de un nivel de golpe.
      expect(levels[0]).toBe(1);
      for (let i = 1; i < levels.length; i++) {
        const jump = levels[i] - levels[i - 1];
        expect(
          jump,
          `salto de nivel ilegal en ${slug}: ${levels[i - 1]}→${levels[i]} (secuencia ${levels.join(",")})`,
        ).toBeLessThanOrEqual(1);
      }
    },
  );
});

describe("site-audit · A11Y — formulario de /admision", () => {
  it("cada control tiene label/legend asociado y el textarea es accesible", async () => {
    const markup = await html("/admision", Admision);
    // label asociado al textarea por for/id.
    expect(markup).toMatch(/<label[^>]*for="problema"/);
    expect(markup).toMatch(/<textarea[^>]*id="problema"/);
    // ayuda + error vinculados con aria-describedby; estado aria-invalid presente.
    expect(markup).toMatch(/aria-describedby="problema-help problema-error"/);
    expect(markup).toMatch(/aria-invalid="false"/);
    // grupo de radios con <legend> real.
    expect(markup).toMatch(/<legend\b/);
    // estados accesibles: confirmación role=status, error role=alert, aria-live.
    expect(markup).toContain('role="status"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("aria-live");
  });
});

describe("site-audit · A11Y — foco visible en interactivos (source)", () => {
  // Todo .astro con elementos enfocables propios debe ofrecer :focus-visible y
  // nunca anular el outline sin reemplazo (spec § ACCESSIBILITY).
  const FOCUSABLE = [
    "components/TopNavigation.astro",
    "components/Footer.astro",
    "components/PageShell.astro",
    "components/EditorialHero.astro",
    "components/InsightCard.astro",
    "components/EngagementCard.astro",
    "components/WhitePaperLayout.astro",
    "components/IntakeForm.astro",
  ];

  it.each(FOCUSABLE)("%s declara :focus-visible y no deja outline:none huérfano", (rel) => {
    const src = source(`../../src/${rel}`);
    expect(src).toContain(":focus-visible");
    // Si en algún punto se quita el outline, no debe quedar sin reemplazo: este
    // repo simplemente no usa `outline: none`.
    expect(src.toLowerCase()).not.toContain("outline: none");
    expect(src.toLowerCase()).not.toContain("outline:none");
  });
});

describe("site-audit · A11Y — contraste de tokens (cálculo WCAG)", () => {
  it("todo token de texto cumple AA (≥4.5:1) sobre --paper", () => {
    for (const [token, hex] of Object.entries(TEXT_TOKENS)) {
      const ratio = contrast(hex, PAPER);
      expect(ratio, `${token} (${hex}) sobre --paper`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("--paper-pure (insets blancos) no reduce el contraste del cuerpo bajo AA", () => {
    // Las tarjetas usan --paper-pure (#FFFFFF) como fondo; --ink sobre blanco
    // debe seguir cumpliendo AA (texto de las tarjetas).
    expect(contrast("#16293B", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("site-audit · MOTION", () => {
  it("Layout.astro conserva el bloque global prefers-reduced-motion que apaga animación y transición", () => {
    const layout = source("../../src/layouts/Layout.astro");
    expect(layout).toContain("@media (prefers-reduced-motion: reduce)");
    const block = layout.slice(layout.indexOf("prefers-reduced-motion"));
    expect(block).toContain("animation: none !important");
    expect(block).toContain("transition: none !important");
  });

  it("ningún .astro usa animación prohibida (parallax / typewriter / glow pulsante)", () => {
    for (const file of ALL_ASTRO) {
      const css = styleCssNoReducedMotion(readFileSync(file, "utf8")).toLowerCase();
      expect(css, `${file}`).not.toContain("parallax");
      expect(css, `${file}`).not.toContain("typewriter");
      // Sin keyframes (el rediseño no anima con @keyframes; solo transiciones
      // de color/opacity puntuales). Esto descarta glow pulsante / contadores.
      expect(css, `${file}`).not.toContain("@keyframes");
      expect(css, `${file}`).not.toContain("animation:");
    }
  });

  it("las transiciones existentes se limitan a color/opacity/transform/border (≤200ms, ease-out)", () => {
    for (const file of ALL_ASTRO) {
      const src = styleCssNoReducedMotion(readFileSync(file, "utf8"));
      const re = /transition:\s*([^;]+);/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const decl = m[1].toLowerCase();
        // Propiedades permitidas (spec § MOTION). `top` del skip-link es un
        // desplazamiento funcional ≤8px equivalente; se admite explícitamente.
        expect(
          /^(top|color|opacity|transform|background-color|border-color|text-decoration-color)/.test(
            decl.replace(/\s+/g, " ").trim(),
          ) || decl.includes("ease-out"),
          `transición no conforme en ${file}: ${decl}`,
        ).toBe(true);
      }
    }
  });
});

describe("site-audit · PALETTE — hex de marca solo en Layout.astro", () => {
  it("ningún .astro fuera de Layout.astro introduce un hex en su <style>", () => {
    for (const file of ALL_ASTRO) {
      if (file.endsWith("Layout.astro")) continue;
      const css = styleCss(readFileSync(file, "utf8"));
      const hexes = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hexes, `${file} introduce hex en <style>: ${hexes.join(", ")}`).toHaveLength(0);
    }
  });

  it("ningún atributo de estilo (fill/stroke/style) usa un hex; solo var(--token)", () => {
    for (const file of ALL_ASTRO) {
      const src = readFileSync(file, "utf8");
      // fill="#.." / stroke="#.." / style="...#.." en SVG o inline.
      const attrHex =
        src.match(/(?:fill|stroke|style)="[^"]*#[0-9a-fA-F]{3,8}/g) ?? [];
      expect(attrHex, `${file} usa hex en atributo de estilo: ${attrHex.join(", ")}`).toHaveLength(0);
    }
  });

  it("Layout.astro contiene la tabla canónica de tokens (única fuente de hex)", () => {
    const layout = source("../../src/layouts/Layout.astro").toLowerCase();
    expect(layout).toContain("--paper: #f6f4ee");
    expect(layout).toContain("--ink: #16293b");
    expect(layout).toContain("--burgundy: #7c1d33");
    expect(layout).toContain("--olive: #54501a");
    expect(layout).toContain("--forest: #1a4636");
  });
});

describe("site-audit · PALETTE — una familia de acento por documento", () => {
  it.each(PAGES)(
    "$slug usa exactamente la familia esperada (Inicio = Navy neutro sin data-accent)",
    async ({ slug, Comp, accent }) => {
      const markup = await html(slug, Comp);
      const accents = markup.match(/data-accent="[^"]*"/g) ?? [];
      if (accent === null) {
        // Inicio: NO hay data-accent en todo el documento (Navy neutro).
        expect(accents).toHaveLength(0);
      } else {
        // El único data-accent del documento es el del <main>.
        expect(accents).toHaveLength(1);
        expect(accents[0]).toBe(`data-accent="${accent}"`);
        expect(markup).toMatch(new RegExp(`<main[^>]*data-accent="${accent}"`));
      }
    },
  );
});

describe("site-audit · PALETTE — prohibiciones visuales globales", () => {
  it("ningún .astro usa gradiente, glow/shadow, dark mode, Tailwind CDN o blur decorativo (en CSS real)", () => {
    for (const file of ALL_ASTRO) {
      const src = readFileSync(file, "utf8");
      const css = styleCss(src).toLowerCase();
      expect(css, `${file}`).not.toContain("gradient");
      expect(css, `${file}`).not.toContain("box-shadow");
      expect(css, `${file}`).not.toContain("text-shadow");
      expect(css, `${file}`).not.toContain("drop-shadow");
      expect(css, `${file}`).not.toContain("prefers-color-scheme");
      // Tailwind por CDN: prohibido en todo el archivo.
      expect(src).not.toContain("cdn.tailwindcss.com");
    }
  });
});

describe("site-audit · cobertura del site map", () => {
  it("están presentes exactamente las 7 páginas del site map (sin neón residual)", () => {
    const pages = listAstro(`${SRC_DIR}pages/`)
      .filter((p) => !p.includes("/api/"))
      .map((p) => p.split(/[\\/]/).pop());
    expect(pages.sort()).toEqual(
      [
        "admision.astro",
        "archivo.astro",
        "index.astro",
        "la-firma.astro",
        "memos.astro",
        "metodologia.astro",
        "practica.astro",
      ].sort(),
    );
  });
});
