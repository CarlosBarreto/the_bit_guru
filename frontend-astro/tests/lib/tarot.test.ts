import { describe, it, expect } from "vitest";
import { ARCANOS } from "../../src/lib/tarot";

describe("ARCANOS", () => {
  it("tiene exactamente 22 arcanos mayores", () => {
    expect(ARCANOS).toHaveLength(22);
  });

  it("no tiene nombres duplicados", () => {
    const unicos = new Set(ARCANOS);
    expect(unicos.size).toBe(ARCANOS.length);
  });

  it("conserva nombres canónicos del PHP (El Bit, La Sacerdotisa de la Nube, El Demonio del Spam)", () => {
    expect(ARCANOS).toContain("0 - El Bit");
    expect(ARCANOS).toContain("II - La Sacerdotisa de la Nube");
    expect(ARCANOS).toContain("XV - El Demonio del Spam");
  });
});
