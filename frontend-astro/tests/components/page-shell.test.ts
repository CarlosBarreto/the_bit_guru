import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import PageShell from "../../src/components/PageShell.astro";

// Tests de PageShell.astro (feature 19, Phase 3). Mismo patrón doble del repo
// (tests/components/partner-biography.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (skip-link, UN solo <main>, slot, data-accent condicional).
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (foco visible, ausencia de hex/glow/gradiente).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const shellSource = source("../../src/components/PageShell.astro");
const shellStyle = styleBlock(shellSource);

async function render(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = { default: "<p data-marker>contenido</p>" },
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(PageShell, { props, slots });
}

describe("PageShell.astro — markup (Container API)", () => {
  it("incluye un skip-link 'Saltar al contenido' que apunta a #main", async () => {
    const html = await render();
    expect(html).toMatch(
      /<a[^>]*class="[^"]*\bskip-link\b[^>]*href="#main"|<a[^>]*href="#main"[^>]*class="[^"]*\bskip-link\b/,
    );
    expect(html).toContain("Saltar al contenido");
  });

  it("renderiza UN solo <main> con id='main' (landmark único)", async () => {
    const html = await render();
    const mainOpenTags = (html.match(/<main\b/g) ?? []).length;
    expect(mainOpenTags).toBe(1);
    expect(html).toMatch(/<main[^>]*id="main"/);
  });

  it("renderiza el contenido del slot dentro del <main>", async () => {
    const html = await render(
      {},
      { default: "<p data-marker>carta del socio</p>" },
    );
    expect(html).toContain("carta del socio");
  });

  it("compone los chrome compartidos: header/nav y footer", async () => {
    const html = await render();
    expect(html).toMatch(/<header[^>]*id="top"/);
    expect(html).toMatch(/<nav[^>]*aria-label="Navegación principal"/);
    expect(html).toMatch(/<footer[^>]*id="footer"/);
  });

  it("NO pone data-accent cuando no se pasa la prop accent (Navy neutro)", async () => {
    const html = await render();
    expect(html).not.toContain("data-accent");
  });

  it("pone data-accent en el <main> cuando se pasa la prop accent", async () => {
    const burgundy = await render({ accent: "burgundy" });
    expect(burgundy).toMatch(/<main[^>]*data-accent="burgundy"/);

    const olive = await render({ accent: "olive" });
    expect(olive).toMatch(/<main[^>]*data-accent="olive"/);

    const forest = await render({ accent: "forest" });
    expect(forest).toMatch(/<main[^>]*data-accent="forest"/);
  });

  it("NO contiene ningún <img> (sin fotografía)", async () => {
    const html = await render();
    expect(html).not.toContain("<img");
  });
});

describe("PageShell.astro — source (foco visible + tokens, sin prohibiciones)", () => {
  it("define foco visible accesible con --accent (spec § ACCESSIBILITY)", () => {
    expect(shellSource).toContain("outline: 2px solid var(--accent)");
    expect(shellSource).toContain("outline-offset: 2px");
  });

  it("el skip-link se oculta hasta recibir foco (top fuera de pantalla → visible)", () => {
    expect(shellSource).toContain(".skip-link");
    expect(shellSource).toContain(".skip-link:focus");
  });

  it("alinea a la izquierda y no introduce hex sueltos, gradiente o glow (CSS)", () => {
    const css = shellStyle.toLowerCase();
    expect(css).toContain("text-align: left");
    expect(css).not.toContain("text-align: center");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(css).not.toContain("gradient");
    expect(css).not.toContain("box-shadow");
    expect(css).not.toContain("text-shadow");
    expect(css).not.toContain("backdrop-filter");
  });
});
