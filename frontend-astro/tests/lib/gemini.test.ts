import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Mock del SDK `@google/genai`. Capturamos los argumentos que el wrapper
 * pasa a `models.generateContent` para validarlos, y controlamos la respuesta.
 */
const generateContentMock = vi.fn();
const constructorMock = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = { generateContent: generateContentMock };
      constructor(options: unknown) {
        constructorMock(options);
      }
    },
  };
});

import { generate, DEFAULT_MODEL } from "../../src/lib/gemini";

describe("generate", () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    constructorMock.mockReset();
    generateContentMock.mockResolvedValue({ text: "respuesta del Gurú" });
    vi.stubEnv("GEMINI_API_KEY", "test-key-123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lee la API key de import.meta.env y la pasa al SDK (no hardcodeada)", async () => {
    await generate("hola");
    expect(constructorMock).toHaveBeenCalledWith({ apiKey: "test-key-123" });
  });

  it("usa el modelo por defecto vigente (gemini-2.5-flash)", async () => {
    await generate("hola");
    expect(DEFAULT_MODEL).toBe("gemini-2.5-flash");
    const call = generateContentMock.mock.calls[0][0];
    expect(call.model).toBe("gemini-2.5-flash");
  });

  it("pasa el prompt como contents al SDK", async () => {
    await generate("¿voy a triunfar en redes?");
    const call = generateContentMock.mock.calls[0][0];
    expect(call.contents).toBe("¿voy a triunfar en redes?");
  });

  it("permite sobreescribir el modelo vía opts", async () => {
    await generate("hola", { model: "gemini-2.0-flash" });
    const call = generateContentMock.mock.calls[0][0];
    expect(call.model).toBe("gemini-2.0-flash");
    expect(call.model).not.toBe(DEFAULT_MODEL);
  });

  it("propaga systemInstruction, temperature y maxOutputTokens al config", async () => {
    await generate("hola", {
      systemInstruction: "Eres el Gurú de Bits.",
      temperature: 0.9,
      maxOutputTokens: 256,
    });
    const call = generateContentMock.mock.calls[0][0];
    expect(call.config.systemInstruction).toBe("Eres el Gurú de Bits.");
    expect(call.config.temperature).toBe(0.9);
    expect(call.config.maxOutputTokens).toBe(256);
  });

  it("no incluye claves de config que no se proporcionaron", async () => {
    await generate("hola");
    const call = generateContentMock.mock.calls[0][0];
    expect(call.config).not.toHaveProperty("systemInstruction");
    expect(call.config).not.toHaveProperty("temperature");
    expect(call.config).not.toHaveProperty("maxOutputTokens");
  });

  it("devuelve el texto generado por el modelo", async () => {
    const result = await generate("hola");
    expect(result).toBe("respuesta del Gurú");
  });

  it("lanza un error descriptivo si GEMINI_API_KEY no está definida", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(generate("hola")).rejects.toThrow(/GEMINI_API_KEY/);
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it("lanza error si el SDK falla", async () => {
    generateContentMock.mockRejectedValue(new Error("503 Service Unavailable"));
    await expect(generate("hola")).rejects.toThrow(/Gemini no respondió/);
  });

  it("lanza error si la respuesta no trae texto", async () => {
    generateContentMock.mockResolvedValue({ text: undefined });
    await expect(generate("hola")).rejects.toThrow(/vacía o sin texto/);
  });
});
