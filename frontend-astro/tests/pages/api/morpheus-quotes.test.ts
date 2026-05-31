import { describe, it, expect } from "vitest";
import { GET } from "../../../src/pages/api/morpheus-quotes";

function invoke() {
  // El handler estático no usa el contexto; se pasa un objeto vacío.
  return (GET as unknown as () => Response | Promise<Response>)();
}

describe("GET /api/morpheus-quotes", () => {
  it("responde 200 con Content-Type application/json", async () => {
    const res = await invoke();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
  });

  it("devuelve un array de strings no vacío", async () => {
    const res = await invoke();
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const quote of body) {
      expect(typeof quote).toBe("string");
      expect(quote.length).toBeGreaterThan(0);
    }
  });

  it("conserva el canon del PHP (primera y última frase)", async () => {
    const res = await invoke();
    const body: string[] = await res.json();
    expect(body[0]).toBe(
      "La Matrix está en todas partes. Nos rodea. Incluso ahora, en esta misma habitación.",
    );
    expect(body[body.length - 1]).toBe(
      "Estoy intentando liberar tu mente, Neo. Pero solo puedo mostrarte la puerta. Tú eres quien tiene que atravesarla.",
    );
  });
});
