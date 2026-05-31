import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Sabiduria from "../../src/components/Sabiduria.astro";

const sabSource = readFileSync(
  fileURLToPath(new URL("../../src/components/Sabiduria.astro", import.meta.url)),
  "utf8",
);

describe("Sabiduria.astro — markup (Container API)", () => {
  it("renderiza el landmark id='sabiduria'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sabiduria);
    expect(html).toContain('id="sabiduria"');
  });

  it("usa el handle canónico @ElGuruDeBits y nunca @ElTioBits", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sabiduria);
    expect(html).toContain("@ElGuruDeBits");
    expect(html).not.toContain("@ElTioBits");
  });

  it("usa la bio canónica, no 'Consejo del día'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Sabiduria);
    expect(html).toContain("Habitando los espacios muertos entre paquetes");
    expect(html).not.toContain("Consejo del día");
  });
});

describe("Sabiduria.astro — source (fetch, microcopy, avatar, paleta)", () => {
  it("hace fetch al endpoint /api/wisdom-tweet", () => {
    expect(sabSource).toContain("/api/wisdom-tweet");
  });

  it("usa microcopy de error cínico, no técnico", () => {
    expect(sabSource).toContain("Los espíritus tienen lag");
  });

  it("el avatar es SVG ilustrativo, no imagen raster", () => {
    expect(sabSource).toContain("<svg");
    expect(sabSource).not.toContain("<img");
  });

  it("no usa ámbar prohibido ni Tailwind por CDN", () => {
    expect(sabSource).not.toMatch(/#ffb954/i);
    expect(sabSource).not.toMatch(/#ffddb4/i);
    expect(sabSource).not.toContain("cdn.tailwindcss.com");
  });
});
