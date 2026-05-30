import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mockeamos el WRAPPER `lib/gemini.ts` (no el SDK), según docs/conventions.md.
 * Capturamos los argumentos para validar que los 3 arcanos sorteados viajan al
 * system prompt y que la estructura de la respuesta es la esperada.
 */
const generateMock = vi.fn();

vi.mock("../../../src/lib/gemini", () => ({
  generate: (...args: unknown[]) => generateMock(...args),
}));

import { POST } from "../../../src/pages/api/reading";
import { ARCANOS } from "../../../src/lib/tarot";

function invoke(): Promise<Response> {
  const request = new Request("http://localhost:4321/api/reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return (
    POST as unknown as (ctx: { request: Request }) => Promise<Response>
  )({ request });
}

describe("POST /api/reading", () => {
  beforeEach(() => {
    generateMock.mockReset();
    generateMock.mockResolvedValue(
      "Tres cartas y la misma moraleja: tu destino corre en una rama que nadie va a mergear.",
    );
  });

  it("responde 200 con { arcanos, interpretacion } y Content-Type application/json", async () => {
    const res = await invoke();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(Array.isArray(body.arcanos)).toBe(true);
    expect(typeof body.interpretacion).toBe("string");
    expect(body.interpretacion.length).toBeGreaterThan(0);
  });

  it("sortea exactamente 3 arcanos distintos del canon ARCANOS", async () => {
    const res = await invoke();
    const body = await res.json();
    expect(body.arcanos).toHaveLength(3);
    // Distintos entre sí.
    expect(new Set(body.arcanos).size).toBe(3);
    // Todos pertenecen al canon.
    for (const arcano of body.arcanos) {
      expect(ARCANOS).toContain(arcano);
    }
  });

  it("varía la tirada entre llamadas (no devuelve siempre la misma)", async () => {
    const sets = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const body = await (await invoke()).json();
      sets.add(body.arcanos.join("|"));
    }
    // 22 cartas tomadas de a 3, 20 intentos: ver siempre la misma sería patológico.
    expect(sets.size).toBeGreaterThan(1);
  });

  it("pasa a generate un system prompt con persona y los 3 arcanos sorteados", async () => {
    const res = await invoke();
    const body = await res.json();
    expect(generateMock).toHaveBeenCalledTimes(1);
    const [, opts] = generateMock.mock.calls[0] as [
      string,
      { systemInstruction: string },
    ];
    // PERSONA_BASE arranca con esta frase canónica y marca el género masculino.
    expect(opts.systemInstruction).toContain("El Gurú de Bits");
    expect(opts.systemInstruction).toContain("CÓMPLICE CÍNICO");
    // Los 3 arcanos devueltos deben viajar en el system prompt.
    for (const arcano of body.arcanos) {
      expect(opts.systemInstruction).toContain(arcano);
    }
  });

  it("devuelve 502 sin filtrar el error crudo cuando Gemini falla", async () => {
    generateMock.mockRejectedValue(
      new Error("503 Service Unavailable interno secreto"),
    );
    const res = await invoke();
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(body.error).not.toContain("503");
    expect(body.error).not.toContain("Service Unavailable");
  });
});
