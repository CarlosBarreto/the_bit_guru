import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mockeamos el WRAPPER `lib/gemini.ts` (no el SDK), según docs/conventions.md.
 * Capturamos los argumentos para validar que el system prompt incorpora la
 * regla §6 de PERSONA.md ("fan emocionado → cómplice cariñoso") y que el
 * mensaje (y el contexto opcional) del fan llegan al prompt.
 */
const generateMock = vi.fn();

vi.mock("../../../src/lib/gemini", () => ({
  generate: (...args: unknown[]) => generateMock(...args),
}));

import { POST } from "../../../src/pages/api/fan-response";

function invoke(body: unknown, raw = false): Promise<Response> {
  const request = new Request("http://localhost:4321/api/fan-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  return (
    POST as unknown as (ctx: { request: Request }) => Promise<Response>
  )({ request });
}

describe("POST /api/fan-response", () => {
  beforeEach(() => {
    generateMock.mockReset();
    generateMock.mockResolvedValue(
      "Ay, incauto del círculo: ya estás dentro, deja de tocar la puerta.",
    );
  });

  it("responde 200 con { respuesta: string } y Content-Type application/json", async () => {
    const res = await invoke({ mensaje: "¡Eres mi gurú favorito!" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(typeof body.respuesta).toBe("string");
    expect(body.respuesta.length).toBeGreaterThan(0);
  });

  it("pasa a generate un system prompt con la regla §6 'fan emocionado → cómplice cariñoso'", async () => {
    await invoke({ mensaje: "¡Te amo Gurú, cambiaste mi vida!" });
    expect(generateMock).toHaveBeenCalledTimes(1);
    const [prompt, opts] = generateMock.mock.calls[0] as [
      string,
      { systemInstruction: string },
    ];
    // Marca canónica de la regla §6 de PERSONA.md (tabla de interacción).
    expect(opts.systemInstruction).toContain(
      "fan emocionado → cómplice cariñoso",
    );
    // PERSONA_BASE sigue presente: el tono no se redefine inline.
    expect(opts.systemInstruction).toContain("El Gurú de Bits");
    expect(opts.systemInstruction).toContain("CÓMPLICE CÍNICO");
    // El mensaje del fan viaja en el prompt de usuario.
    expect(prompt).toContain("¡Te amo Gurú, cambiaste mi vida!");
  });

  it("incorpora el contexto al prompt cuando viene", async () => {
    await invoke({
      mensaje: "¡Gracias por la lectura!",
      contexto: "es la tercera vez que escribe esta semana",
    });
    const [prompt] = generateMock.mock.calls[0] as [string, unknown];
    expect(prompt).toContain("es la tercera vez que escribe esta semana");
  });

  it("no rompe cuando 'contexto' está ausente", async () => {
    const res = await invoke({ mensaje: "¡Saludos Gurú!" });
    expect(res.status).toBe(200);
    const [prompt] = generateMock.mock.calls[0] as [string, unknown];
    expect(prompt).not.toContain("Contexto adicional");
  });

  it("devuelve 400 cuando falta 'mensaje'", async () => {
    const res = await invoke({});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 cuando 'mensaje' no es string", async () => {
    const res = await invoke({ mensaje: 42 });
    expect(res.status).toBe(400);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 cuando 'mensaje' es un string vacío", async () => {
    const res = await invoke({ mensaje: "   " });
    expect(res.status).toBe(400);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 cuando el body no es JSON válido", async () => {
    const res = await invoke("{ esto no es json", true);
    expect(res.status).toBe(400);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("devuelve 502 sin filtrar el error crudo cuando Gemini falla", async () => {
    generateMock.mockRejectedValue(
      new Error("503 Service Unavailable interno secreto"),
    );
    const res = await invoke({ mensaje: "¡Eres lo máximo!" });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(body.error).not.toContain("503");
    expect(body.error).not.toContain("Service Unavailable");
  });
});
