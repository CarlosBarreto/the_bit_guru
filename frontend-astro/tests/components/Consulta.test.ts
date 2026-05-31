import { describe, it, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Consulta from "../../src/components/Consulta.astro";

// Feature 13 — Consulta.astro. Dos métodos (ver foundation.test.ts):
//   1. Container API → markup (id, textarea, botón INVOCAR).
//   2. readFileSync del source → POST a /api/pregunta, tokens de paleta.

const src = readFileSync(
  fileURLToPath(new URL("../../src/components/Consulta.astro", import.meta.url)),
  "utf8",
);

describe("Consulta — markup (Container API)", () => {
  it("renderiza el landmark con id='consulta'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Consulta);
    expect(html).toContain('id="consulta"');
  });

  it("incluye un <textarea para la pregunta", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Consulta);
    expect(html).toContain("<textarea");
  });

  it("muestra el botón 'INVOCAR'", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Consulta);
    expect(html).toContain("INVOCAR");
  });
});

describe("Consulta — source (fetch, paleta)", () => {
  it("hace POST al endpoint /api/pregunta", () => {
    expect(src).toContain("/api/pregunta");
    expect(src).toMatch(/method:\s*["']POST["']/);
  });

  it("usa el fondo var(--surface-card)", () => {
    expect(src).toContain("var(--surface-card");
  });

  it("microcopy de error con filo cínico, no técnico", () => {
    expect(src).toMatch(/espíritus tienen lag/i);
  });

  it("NO usa var(--rosa) (reservado para la tirada)", () => {
    expect(src).not.toContain("var(--rosa");
  });

  it("NO usa el ámbar prohibido del mockup", () => {
    expect(src).not.toMatch(/#ffb954/i);
  });
});
