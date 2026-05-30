import { describe, it, expect } from "vitest";

/**
 * El endpoint construye el prompt visual de forma determinística (sin Gemini),
 * por lo que no requiere mock. Validamos que el prompt devuelto siempre lleva
 * la paleta canónica y las restricciones visuales de §8 de PERSONA.md.
 */
import { POST } from "../../../src/pages/api/create-image";

function invoke(body?: unknown, raw = false): Promise<Response> {
  const init: RequestInit = { method: "POST" };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = raw ? (body as string) : JSON.stringify(body);
  }
  const request = new Request("http://localhost:4321/api/create-image", init);
  return (
    POST as unknown as (ctx: { request: Request }) => Promise<Response>
  )({ request });
}

describe("POST /api/create-image", () => {
  it("responde 200 con { prompt: string } y Content-Type application/json", async () => {
    const res = await invoke();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(typeof body.prompt).toBe("string");
    expect(body.prompt.length).toBeGreaterThan(0);
  });

  it("incluye la paleta canónica: morado, cyan, negro y neón rosa", async () => {
    const res = await invoke();
    const body = await res.json();
    const prompt = (body.prompt as string).toLowerCase();
    expect(prompt).toContain("morado");
    expect(prompt).toContain("cyan");
    expect(prompt).toContain("negro");
    expect(prompt).toContain("neón rosa");
  });

  it("prohíbe explícitamente el fotorrealismo", async () => {
    const res = await invoke();
    const body = await res.json();
    const prompt = (body.prompt as string).toLowerCase();
    expect(prompt).toContain("fotorrealismo");
    expect(prompt).toContain("prohibido el fotorrealismo");
  });

  it("prohíbe explícitamente las caras humanas completas", async () => {
    const res = await invoke();
    const body = await res.json();
    const prompt = (body.prompt as string).toLowerCase();
    expect(prompt).toContain("caras humanas completas");
    expect(prompt).toContain("nunca un humano realista");
  });

  it("incorpora la escena del cliente en el prompt", async () => {
    const res = await invoke({ escena: "el Gurú frente a un servidor en llamas" });
    const body = await res.json();
    const prompt = body.prompt as string;
    expect(prompt).toContain("el Gurú frente a un servidor en llamas");
    // Las restricciones siguen presentes aunque cambie la escena.
    expect(prompt.toLowerCase()).toContain("fotorrealismo");
    expect(prompt.toLowerCase()).toContain("caras humanas completas");
  });

  it("usa una escena por defecto cuando no se especifica", async () => {
    const res = await invoke({});
    const body = await res.json();
    const prompt = (body.prompt as string).toLowerCase();
    expect(prompt).toContain("tarot cibernético");
    expect(prompt).toContain("morado");
  });

  it("devuelve 400 cuando 'escena' no es string", async () => {
    const res = await invoke({ escena: 42 });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
  });

  it("devuelve 400 cuando el body declara JSON pero es inválido", async () => {
    const res = await invoke("{ esto no es json", true);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe("string");
  });
});
