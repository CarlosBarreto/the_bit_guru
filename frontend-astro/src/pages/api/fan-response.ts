import type { APIRoute } from "astro";
import { buildSystemPrompt } from "../../lib/persona";
import { generate } from "../../lib/gemini";

/**
 * Respuesta del Gurú de Bits a un fan emocionado.
 *
 * Recibe `{ mensaje: string, contexto?: string }` en el body. Construye el
 * system prompt consumiendo `lib/persona.ts` (nunca redefine el tono inline) y
 * genera la respuesta vía `lib/gemini.ts`. Aplica la regla §6 de PERSONA.md
 * ("fan emocionado → cómplice cariñoso"): trata al fan como iniciado del
 * círculo, con ternura disfrazada de burla.
 *
 * Valida el input localmente (400) y mapea los fallos de Gemini a 502, dejando
 * el 500 para lo inesperado, sin filtrar el mensaje crudo del error
 * (ver docs/conventions.md § manejo de errores).
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

    const mensaje = (payload as { mensaje?: unknown })?.mensaje;
    if (typeof mensaje !== "string" || mensaje.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Falta 'mensaje' o no es un texto válido." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const contexto = (payload as { contexto?: unknown })?.contexto;
    const tieneContexto =
      typeof contexto === "string" && contexto.trim().length > 0;

    const taskParts: string[] = [
      "Llega un fan emocionado. Regla §6 de la persona: fan emocionado → cómplice cariñoso:",
      "trátalo como iniciado del círculo, con ternura disfrazada de burla, nunca como extraño.",
      "Responde en una o dos frases afiladas; nada de listas ni discursos: pica y corta.",
      `El mensaje del fan es: ${mensaje.trim()}`,
    ];
    if (tieneContexto) {
      taskParts.push(`Contexto adicional del fan: ${(contexto as string).trim()}`);
    }
    const task = taskParts.join(" ");

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
      console.error("[fan-response] fallo al generar con Gemini:", cause);
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
    console.error("[fan-response] error interno:", cause);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
