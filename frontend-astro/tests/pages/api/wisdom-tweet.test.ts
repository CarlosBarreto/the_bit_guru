import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mockeamos el WRAPPER `lib/gemini.ts` (no el SDK), según docs/conventions.md.
 * Capturamos los argumentos para validar que el system prompt incorpora el tema.
 */
const generateMock = vi.fn();

vi.mock("../../../src/lib/gemini", () => ({
  generate: (...args: unknown[]) => generateMock(...args),
}));

import { GET } from "../../../src/pages/api/wisdom-tweet";

function invoke(query = ""): Promise<Response> {
  const url = new URL(`http://localhost:4321/api/wisdom-tweet${query}`);
  return (
    GET as unknown as (ctx: { url: URL }) => Promise<Response>
  )({ url });
}

describe("GET /api/wisdom-tweet", () => {
  beforeEach(() => {
    generateMock.mockReset();
    generateMock.mockResolvedValue("Tu stack y tu karma corren el mismo error: nunca cierran la sesión.");
  });

  it("responde 200 con { tweet: string } y Content-Type application/json", async () => {
    const res = await invoke();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(typeof body.tweet).toBe("string");
    expect(body.tweet.length).toBeGreaterThan(0);
  });

  it("el tweet nunca excede 280 caracteres", async () => {
    const res = await invoke();
    const body = await res.json();
    expect(body.tweet.length).toBeLessThanOrEqual(280);
  });

  it("trunca defensivamente cuando Gemini se pasa de 280 caracteres", async () => {
    const largo = "palabra ".repeat(60); // ~480 chars
    generateMock.mockResolvedValue(largo);
    const res = await invoke();
    const body = await res.json();
    expect(body.tweet.length).toBeLessThanOrEqual(280);
  });

  it("usa buildSystemPrompt (persona) sin tema cuando no se provee", async () => {
    await invoke();
    expect(generateMock).toHaveBeenCalledTimes(1);
    const [, opts] = generateMock.mock.calls[0] as [string, { systemInstruction: string }];
    // PERSONA_BASE arranca con esta frase canónica.
    expect(opts.systemInstruction).toContain("El Gurú de Bits");
  });

  it("incorpora ?tema al prompt cuando se provee", async () => {
    await invoke("?tema=lunes");
    const [prompt, opts] = generateMock.mock.calls[0] as [
      string,
      { systemInstruction: string },
    ];
    expect(opts.systemInstruction).toContain("lunes");
    expect(prompt).toContain("lunes");
  });

  it("no incluye el tema en el prompt cuando no se provee", async () => {
    await invoke();
    const [prompt] = generateMock.mock.calls[0] as [string];
    expect(prompt).not.toContain("trata sobre este tema");
  });

  it("devuelve 502 sin filtrar el error crudo cuando Gemini falla", async () => {
    generateMock.mockRejectedValue(new Error("503 Service Unavailable interno secreto"));
    const res = await invoke();
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
    expect(body.error).not.toContain("503");
    expect(body.error).not.toContain("Service Unavailable");
  });
});
