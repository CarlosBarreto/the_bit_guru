import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import TopNavigation from "../../src/components/TopNavigation.astro";
import { NAV_LINKS, HOME_HREF } from "../../src/components/nav-links";

// Tests de TopNavigation.astro (feature 16, Phase 2). Patrón doble del repo:
//   Método 1 — Container API: valida MARKUP (wordmark, 6 enlaces, aria-current).
//   Método 2 — readFileSync del SOURCE: valida tokens y prohibiciones del
//     <style> (no aparece en renderToString). Se pasa la prop `pathname` para
//     ejercer el estado activo sin depender del routing real.

const navSource = readFileSync(
  fileURLToPath(new URL("../../src/components/TopNavigation.astro", import.meta.url)),
  "utf8",
);

async function render(props: Record<string, unknown> = {}): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(TopNavigation, { props });
}

describe("nav-links — fuente de verdad del directorio", () => {
  it("declara EXACTAMENTE 6 enlaces (spec § SITE MAP)", () => {
    expect(NAV_LINKS).toHaveLength(6);
  });

  it("usa el orden y las rutas autoritativas de la spec", () => {
    expect(NAV_LINKS.map((l) => l.href)).toEqual([
      "/practica",
      "/metodologia",
      "/memos",
      "/archivo",
      "/la-firma",
      "/admision",
    ]);
  });

  it("el wordmark enlaza a Inicio (/)", () => {
    expect(HOME_HREF).toBe("/");
  });

  it("ninguna ruta del directorio es Inicio (Inicio no está en el nav)", () => {
    expect(NAV_LINKS.map((l) => l.href)).not.toContain("/");
  });
});

describe("TopNavigation.astro — markup (Container API)", () => {
  it("mantiene los landmarks <header>/<nav> con aria-label", async () => {
    const html = await render();
    expect(html).toMatch(/<header[^>]*id="top"/);
    expect(html).toMatch(/<nav[^>]*aria-label="Navegación principal"/);
  });

  it("expone el wordmark 'Bit Gurú · Asesoría Estratégica' enlazando a /", async () => {
    const html = await render();
    expect(html).toContain("Bit Gurú");
    expect(html).toContain("Asesoría Estratégica");
    expect(html).toMatch(/<a[^>]*class="wordmark"[^>]*href="\/"/);
  });

  it("renderiza EXACTAMENTE 6 enlaces de navegación", async () => {
    const html = await render();
    // Cuenta solo los <a class="link"|"link active">, no el <ul class="links">
    // ni el wordmark (class="wordmark"). El límite [ "] descarta "links".
    const count = (html.match(/class="link[ "]/g) ?? []).length;
    expect(count).toBe(6);
  });

  it("incluye las 6 rutas de la spec en el orden correcto", async () => {
    const html = await render();
    for (const link of NAV_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.label);
    }
  });

  it("marca aria-current='page' SOLO en la ruta actual", async () => {
    const html = await render({ pathname: "/metodologia" });
    const ariaCurrentCount = (html.match(/aria-current="page"/g) ?? []).length;
    expect(ariaCurrentCount).toBe(1);
    // El atributo debe colgar del enlace de /metodologia.
    expect(html).toMatch(/href="\/metodologia"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/metodologia"/);
  });

  it("trata rutas con barra final como la misma ruta activa", async () => {
    const html = await render({ pathname: "/memos/" });
    expect(html).toMatch(/href="\/memos"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/memos"/);
  });

  it("no marca ninguna ruta activa en Inicio (/)", async () => {
    const html = await render({ pathname: "/" });
    expect(html).not.toContain('aria-current="page"');
  });
});

describe("TopNavigation.astro — source (tokens y prohibiciones)", () => {
  it("es sticky y usa tokens de la spec (--ink*/--paper*/--accent*)", () => {
    expect(navSource).toContain("position: sticky");
    expect(navSource).toContain("var(--ink-rule)");
    expect(navSource).toContain("var(--paper)");
    expect(navSource).toContain("var(--accent");
  });

  it("define foco visible accesible con --accent (spec § ACCESSIBILITY)", () => {
    expect(navSource).toContain("outline: 2px solid var(--accent)");
    expect(navSource).toContain("outline-offset: 2px");
  });

  it("no introduce hex sueltos, gradiente, glow ni Tailwind por CDN", () => {
    const src = navSource.toLowerCase();
    expect(src).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(src).not.toContain("gradient");
    expect(src).not.toContain("box-shadow");
    expect(src).not.toContain("backdrop-filter");
    expect(src).not.toContain("cdn.tailwindcss.com");
  });

  it("no arrastra los tokens neón obsoletos de la feature 13", () => {
    expect(navSource).not.toContain("var(--morado");
    expect(navSource).not.toContain("var(--cyan");
    expect(navSource).not.toContain("var(--rosa");
  });
});
