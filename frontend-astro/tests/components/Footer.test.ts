import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Footer from "../../src/components/Footer.astro";
import { NAV_LINKS } from "../../src/components/nav-links";

// Tests de Footer.astro (feature 16, Phase 2 — redesign_nav_footer). Reemplaza
// el contrato neón de la feature 13 por el del rediseño. Patrón doble del repo:
//   Método 1 — Container API: markup/copy (directorio, disclaimer, firma).
//   Método 2 — readFileSync del SOURCE: tokens y prohibiciones del <style>.

const footerSource = readFileSync(
  fileURLToPath(new URL("../../src/components/Footer.astro", import.meta.url)),
  "utf8",
);

async function render(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Footer);
}

describe("Footer.astro — markup (Container API)", () => {
  it("mantiene el landmark <footer id='footer'> con aria-label", async () => {
    const html = await render();
    expect(html).toMatch(/<footer[^>]*id="footer"/);
    expect(html).toMatch(/<footer[^>]*aria-label=/);
  });

  it("incluye un directorio con las 6 secciones de la spec", async () => {
    const html = await render();
    expect(html).toMatch(/<nav[^>]*aria-label="Directorio de secciones"/);
    for (const link of NAV_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.label);
    }
  });

  it("incluye el disclaimer cínico-institucional (spec § VOICE & COPY)", async () => {
    const html = await render();
    expect(html).toContain("no garantizan");
    expect(html).toContain("ya sabe con quién trata");
  });

  it("firma como Socio Fundador, voz canónica preservada", async () => {
    const html = await render();
    expect(html).toContain("Socio Fundador");
    expect(html).toContain("espacios muertos entre paquetes");
  });

  it("no fija ningún año ni un '© sin fecha' (fuera del tiempo)", async () => {
    const html = await render();
    expect(html).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(html).not.toContain("©");
    expect(html).not.toContain("&copy;");
  });
});

describe("Footer.astro — source (tokens y prohibiciones)", () => {
  it("usa tokens de la spec (--paper*/--ink*/--accent*) y se alinea a la izquierda", () => {
    expect(footerSource).toContain("var(--paper-deep)");
    expect(footerSource).toContain("var(--ink-rule)");
    expect(footerSource).toContain("var(--accent");
    expect(footerSource).toContain("text-align: left");
    expect(footerSource).not.toContain("text-align: center");
  });

  it("no introduce hex sueltos, gradiente, glow ni Tailwind por CDN", () => {
    const src = footerSource.toLowerCase();
    expect(src).not.toMatch(/#[0-9a-f]{3,8}\b/);
    expect(src).not.toContain("gradient");
    expect(src).not.toContain("box-shadow");
    expect(src).not.toContain("cdn.tailwindcss.com");
  });

  it("no arrastra los tokens neón obsoletos de la feature 13", () => {
    expect(footerSource).not.toContain("var(--morado");
    expect(footerSource).not.toContain("var(--cyan");
    expect(footerSource).not.toContain("var(--rosa");
    expect(footerSource).not.toContain("var(--surface-footer");
  });

  it("no fija ningún año en el source", () => {
    expect(footerSource).not.toMatch(/\b(19|20)\d{2}\b/);
  });
});
