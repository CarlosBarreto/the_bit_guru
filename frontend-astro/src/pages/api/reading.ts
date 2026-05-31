import type { APIRoute } from "astro";
import { ARCANOS } from "../../lib/tarot";
import { buildSystemPrompt } from "../../lib/persona";
import { generate } from "../../lib/gemini";

/**
 * Lectura completa de tarot cibernético del Gurú de Bits.
 *
 * Sortea 3 arcanos distintos del array canónico ARCANOS (sin reemplazo,
 * barajado parcial de Fisher-Yates) y pide a Gemini una interpretación en la
 * voz del Gurú, construyendo el system prompt vía `lib/persona.ts` (nunca
 * redefine el tono inline). Mapea los fallos de Gemini a 502 y deja el 500
 * para lo inesperado, sin filtrar el mensaje crudo del error (ver
 * docs/conventions.md § manejo de errores).
 *
 * Devuelve `{ arcanos: [...3], interpretacion: string }`.
 */
export const POST: APIRoute = async () => {
  try {
    const baraja = [...ARCANOS];
    for (let i = baraja.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
    }
    const arcanos = baraja.slice(0, 3);

    const task = [
      "Interpreta esta lectura de 3 cartas como una sola narrativa, en tu voz.",
      "Conecta los tres arcanos entre sí; nada de leer carta por carta en lista.",
      "Sé breve y afilado: dos o tres frases que piquen, no un ensayo.",
    ].join(" ");

    const systemInstruction = buildSystemPrompt({ task, arcanos });

    let interpretacion: string;
    try {
      interpretacion = await generate(task, {
        systemInstruction,
        temperature: 1.0,
        maxOutputTokens: 400,
      });
    } catch (cause) {
      // El wrapper lanza Error al fallar el SDK o venir vacío: Gemini caído.
      console.error("[reading] fallo al generar con Gemini:", cause);
      return new Response(
        JSON.stringify({ error: "El Gurú no respondió. Intenta de nuevo." }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ arcanos, interpretacion: interpretacion.trim() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (cause) {
    console.error("[reading] error interno:", cause);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
