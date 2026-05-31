import { describe, it, expect } from "vitest";
import { GET } from "../../../src/pages/api/tirada";
import { ARCANOS } from "../../../src/lib/tarot";

function invoke() {
  // El handler no usa el contexto; se pasa un objeto vacío.
  return (GET as unknown as () => Response | Promise<Response>)();
}

describe("GET /api/tirada", () => {
  it("responde 200 con Content-Type application/json", async () => {
    const res = await invoke();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
  });

  it("devuelve exactamente 3 arcanos con su nombre", async () => {
    const res = await invoke();
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(3);
    for (const arcano of body) {
      expect(typeof arcano.nombre).toBe("string");
      expect(ARCANOS).toContain(arcano.nombre);
    }
  });

  it("los 3 arcanos son distintos en 100 ejecuciones (sin reemplazo)", async () => {
    for (let i = 0; i < 100; i++) {
      const res = await invoke();
      const body: { nombre: string }[] = await res.json();
      expect(body.length).toBe(3);
      const nombres = body.map((a) => a.nombre);
      const unicos = new Set(nombres);
      expect(unicos.size).toBe(3);
    }
  });
});
