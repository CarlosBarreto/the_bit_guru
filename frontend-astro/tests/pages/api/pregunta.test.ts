import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mockeamos el WRAPPER `lib/gemini.ts` (no el SDK), según docs/conventions.md.
 * Capturamos los argumentos para validar que el system prompt incorpora las
 * marcas de persona y que la pregunta llega al prompt.
 */
const generateMock = vi.fn();

vi.mock("../../../src/lib/gemini", () => ({
  generate: (...args: unknown[]) => generateMock(...args),
}));

import { POST } from "../../../src/pages/api/pregunta";

function invoke(body: unknown, raw = false): Promise<Response> {
  const request = new Request("http://localhost:4321/api/pregunta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
  return (
    POST as unknown as (ctx: { request: Request }) => Promise<Response>
  )({ request });
}

describe("POST /api/pregunta", () => {
  beforeEach(() => {
    generateMock.mockReset();
    generateMock.mockResolvedValue(
      "Vas a triunfar igual que tu cache: solo cuando nadie revisa la fecha de expiración.",
    );
  });

  it("responde 200 con { respuesta: string } y Content-Type application/json", async () => {
    const res = await invoke({ pregunta: "¿voy a triunfar en redes?" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(typeof body.respuesta).toBe("string");
    expect(body.respuesta.length).toBeGreaterThan(0);
  });

  it("pasa a generate un system prompt con las marcas de persona", async () => {
    await invoke({ pregunta: "¿debería renunciar?" });
    expect(generateMock).toHaveBeenCalledTimes(1);
    const [prompt, opts] = generateMock.mock.calls[0] as [
      string,
      { systemInstruction: string },
    ];
    // PERSONA_BASE arranca con esta frase canónica y marca el género masculino.
    expect(opts.systemInstruction).toContain("El Gurú de Bits");
    expect(opts.systemInstruction).toContain("CÓMPLICE CÍNICO");
    // La pregunta del fan debe viajar tanto en el prompt como en el system prompt.
    expect(prompt).toContain("¿debería renunciar?");
  });

  it("devuelve 400 cuando falta 'pregunta'", async () => {
    const res = await invoke({});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 cuando 'pregunta' no es string", async () => {
    const res = await invoke({ pregunta: 42 });
    expect(res.status).toBe(400);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 cuando 'pregunta' es un string vacío", async () => {
    const res = await invoke({ pregunta: "   " });
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
    const res = await invoke({ pregunta: "¿voy bien?" });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(body.error).not.toContain("503");
    expect(body.error).not.toContain("Service Unavailable");
  });
});
