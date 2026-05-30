import type { APIRoute } from "astro";
import { buildSystemPrompt } from "../../lib/persona";
import { generate } from "../../lib/gemini";

/**
 * Respuesta del Gurú de Bits a una pregunta de un fan.
 *
 * Recibe `{ pregunta: string }` en el body, construye el system prompt
 * consumiendo `lib/persona.ts` (nunca redefine el tono inline) y genera la
 * respuesta vía `lib/gemini.ts`. Valida el input localmente (400) y mapea los
 * fallos de Gemini a 502, dejando el 500 para lo inesperado, sin filtrar el
 * mensaje crudo del error (ver docs/conventions.md § manejo de errores).
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "El body debe ser JSON válido." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const pregunta = (payload as { pregunta?: unknown })?.pregunta;
    if (typeof pregunta !== "string" || pregunta.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Falta 'pregunta' o no es un texto válido." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const task = [
      "Responde la pregunta del fan en tu voz, en una o dos frases afiladas.",
      "Nada de listas ni explicaciones largas: pica y corta.",
      `La pregunta del fan es: ${pregunta.trim()}`,
    ].join(" ");

    const systemInstruction = buildSystemPrompt({ task });

    let respuesta: string;
    try {
      respuesta = await generate(task, {
        systemInstruction,
        temperature: 1.0,
        maxOutputTokens: 300,
      });
    } catch (cause) {
      // El wrapper lanza Error al fallar el SDK o venir vacío: Gemini caído.
      console.error("[pregunta] fallo al generar con Gemini:", cause);
      return new Response(
        JSON.stringify({ error: "El Gurú no respondió. Intenta de nuevo." }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ respuesta: respuesta.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (cause) {
    console.error("[pregunta] error interno:", cause);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
