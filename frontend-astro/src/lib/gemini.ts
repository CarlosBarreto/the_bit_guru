/**
 * Wrapper único del SDK `@google/genai` — single point of contact con Gemini.
 *
 * Ningún otro módulo del proyecto debe importar `@google/genai` directamente:
 * todo paso por el modelo cruza esta función. Así los endpoints (features 6-10)
 * mockean `lib/gemini.ts` y no el SDK, y el dominio queda testable sin red.
 *
 * Capa de infraestructura de bajo nivel: no conoce HTTP ni Astro. Ante fallos
 * lanza `Error` con mensaje descriptivo (el mapeo a 502/500 lo harán los
 * endpoints — ver docs/conventions.md § manejo de errores).
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Modelo de texto por defecto.
 *
 * Coherente con el backend PHP legacy (`legacy/backend-php/app/Controllers/
 * TarotController.php`), donde `gemini-2.0-flash` es el modelo canónico de
 * texto usado en las llamadas de pregunta, lectura y tweet.
 */
export const DEFAULT_MODEL = "gemini-2.0-flash";

/**
 * Opciones de generación para {@link generate}.
 */
export interface GenerateOptions {
  /** Modelo a usar. Por defecto {@link DEFAULT_MODEL}. */
  model?: string;
  /** System prompt que orienta al modelo (típicamente la voz del Gurú). */
  systemInstruction?: string;
  /** Grado de aleatoriedad (0-2). Si se omite, el modelo usa su default. */
  temperature?: number;
  /** Tope de tokens de salida. Si se omite, el modelo usa su default. */
  maxOutputTokens?: number;
}

/**
 * Genera texto con Gemini a partir de un prompt.
 *
 * Lee la API key de `import.meta.env.GEMINI_API_KEY`; nunca está hardcodeada.
 *
 * @param prompt Texto de la solicitud (el contenido de usuario / tarea).
 * @param opts Opciones de generación (modelo, system prompt, temperatura, tope de tokens).
 * @returns El texto generado por el modelo.
 * @throws {Error} Si `GEMINI_API_KEY` no está definida.
 * @throws {Error} Si la llamada al SDK falla o devuelve una respuesta sin texto.
 */
export async function generate(
  prompt: string,
  opts: GenerateOptions = {},
): Promise<string> {
  const apiKey = import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está definida. Configúrala en frontend-astro/.env (local) " +
        "o como Environment Variable en Vercel. El Gurú no habla sin clave.",
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const config: Record<string, unknown> = {};
  if (opts.systemInstruction !== undefined) {
    config.systemInstruction = opts.systemInstruction;
  }
  if (opts.temperature !== undefined) {
    config.temperature = opts.temperature;
  }
  if (opts.maxOutputTokens !== undefined) {
    config.maxOutputTokens = opts.maxOutputTokens;
  }

  let response;
  try {
    response = await ai.models.generateContent({
      model: opts.model ?? DEFAULT_MODEL,
      contents: prompt,
      config,
    });
  } catch (cause) {
    throw new Error(
      `Gemini no respondió al invocar el modelo: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
      { cause },
    );
  }

  const text = response.text;
  if (text === undefined || text.length === 0) {
    throw new Error("Gemini devolvió una respuesta vacía o sin texto.");
  }

  return text;
}
