import { describe, it, expect } from "vitest";
import { PERSONA_BASE, buildSystemPrompt } from "../../src/lib/persona";

describe("PERSONA_BASE", () => {
  it("es un string no vacío", () => {
    expect(typeof PERSONA_BASE).toBe("string");
    expect(PERSONA_BASE.length).toBeGreaterThan(0);
  });
});

describe("buildSystemPrompt", () => {
  it("incluye la marca de género masculino", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("masculino");
  });

  it("incluye la marca de tono cómplice cínico", () => {
    const prompt = buildSystemPrompt().toLowerCase();
    expect(prompt).toContain("cómplice");
  });

  it("parte siempre del PERSONA_BASE canónico", () => {
    expect(buildSystemPrompt()).toContain(PERSONA_BASE);
  });

  it("añade la tarea cuando se proporciona", () => {
    const prompt = buildSystemPrompt({ task: "Responde la pregunta del fan." });
    expect(prompt).toContain("Responde la pregunta del fan.");
  });

  it("añade los arcanos en juego cuando se proporcionan", () => {
    const prompt = buildSystemPrompt({ arcanos: ["0 - El Bit", "XV - El Demonio del Spam"] });
    expect(prompt).toContain("0 - El Bit");
    expect(prompt).toContain("XV - El Demonio del Spam");
  });

  it("sin opciones devuelve exactamente el PERSONA_BASE", () => {
    expect(buildSystemPrompt()).toBe(PERSONA_BASE);
  });
});
