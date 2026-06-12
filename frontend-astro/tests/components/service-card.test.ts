import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ServiceCard from "../../src/components/ServiceCard.astro";

// Tests de ServiceCard.astro (feature 20, Phase 3). Mismo patrón doble del repo
// (tests/components/insight-card.test.ts):
//   Método 1 — Container API (`experimental_AstroContainer`): valida MARKUP
//     (<article>, título, descripción/entregables condicionales). El <style>
//     NO aparece.
//   Método 2 — readFileSync del SOURCE .astro: valida el bloque <style>
//     (borde hairline, filete de acento, ausencia de hex/gradiente/glow).

function source(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), "utf8");
}

// Extrae el bloque <style> del .astro. La auditoría de paleta (hex / gradiente /
// glow) aplica al CSS, no a los comentarios en prosa de la cabecera.
function styleBlock(src: string): string {
  const match = src.match(/<style>([\s\S]*?)<\/style>/);
  return match ? match[1] : "";
}

const cardSource = source("../../src/components/ServiceCard.astro");
const cardStyle = styleBlock(cardSource);

describe("ServiceCard.astro — markup (Container API)", () => {
  it("renderiza un <article> con el título dentro", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ServiceCard, {
      props: { title: "Diligencia Kármica" },
    });
    expect(html).toMatch(/<article[^>]*class="[^"]*\bservice-card\b/);
    expect(html).toContain("Diligencia Kármica");
  });

  it("renderiza el título dentro de un <h3> (jerarquía editorial)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ServiceCard, {
      props: { title: "Optimización del Karma Operativo" },
    });
    expect(html).toMatch(/<h3[^>]*class="[^"]*\btitle\b/);
  });

  it("incluye la descripción SOLO cuando se pasa la prop", async () => {
    const container = await AstroContainer.create();

    const sin = await container.renderToString(ServiceCard, {
      props: { title: "Línea de servicio" },
    });
    expect(sin).not.toContain('class="description"');

    const con = await container.renderToString(ServiceCard, {
      props: {
        title: "Línea de servicio",
        description:
          "Evaluamos el pasivo espiritual oculto en su arquitectura de decisiones.",
      },
    });
    expect(con).toContain('class="description"');
    expect(con).toContain(
      "Evaluamos el pasivo espiritual oculto en su arquitectura de decisiones.",
    );
  });

  it("renderiza la lista de entregables como <ul> con un <li> por entregable", async () => {
    const container = await AstroContainer.create();
    const deliverables = [
      "Inventario del pasivo espiritual",
      "Mapa de responsabilidades cósmicas",
      "Calendario de amortización en ciclos lunares",
    ];
    const html = await container.renderToString(ServiceCard, {
      props: { title: "Diligencia Kármica", deliverables },
    });
    expect(html).toMatch(/<ul[^>]*class="[^"]*\bdeliverables\b/);
    const liCount = (html.match(/<li\b/g) ?? []).length;
    expect(liCount).toBe(deliverables.length);
    for (const item of deliverables) {
      expect(html).toContain(item);
    }
  });

  it("omite la lista de entregables cuando el array está vacío o ausente", async () => {
    const container = await AstroContainer.create();

    const ausente = await container.renderToString(ServiceCard, {
      props: { title: "Línea de servicio" },
    });
    expect(ausente).not.toContain('class="deliverables"');

    const vacio = await container.renderToString(ServiceCard, {
      props: { title: "Línea de servicio", deliverables: [] },
    });
    expect(vacio).not.toContain('class="deliverables"');
  });

  it("NO contiene ningún <img> (sin fotografía)", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ServiceCard, {
      props: { title: "Diligencia Kármica" },
    });
    expect(html).not.toContain("<img");
  });
});

describe("ServiceCard.astro — source (jerarquía editorial + tokens)", () => {
  it("usa un borde hairline 1px var(--ink-rule) y filete superior de acento", () => {
    expect(cardSource).toContain("border: 1px solid var(--ink-rule)");
    expect(cardSource).toContain("border-top: 2px solid var(--accent)");
  });

  it("renderiza el título en serif con escala --step-2 (H3)", () => {
    expect(cardSource).toContain("font-family: var(--font-serif)");
    expect(cardSource).toContain("font-size: var(--step-2)");
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
});
