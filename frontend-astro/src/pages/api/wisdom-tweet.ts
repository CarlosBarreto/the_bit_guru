import type { APIRoute } from "astro";
import { buildSystemPrompt } from "../../lib/persona";
import { generate } from "../../lib/gemini";

/**
 * Tweet de sabiduría del Gurú de Bits, listo para publicar.
 *
 * Construye el system prompt consumiendo `lib/persona.ts` (nunca redefine el
 * tono inline) y genera el texto vía `lib/gemini.ts`. Soporta `?tema=<x>`
 * opcional para condicionar el tweet a un tema. Garantiza el límite de 280
 * caracteres de X/Twitter por instrucción al modelo y truncado defensivo.
 */

/** Límite duro de caracteres de un tweet. */
const TWEET_MAX_LENGTH = 280;

/**
 * Recorta el texto a `max` caracteres sin partir una palabra a la mitad
 * cuando es posible. Defensivo: el prompt ya pide brevedad, esto es red de
 * seguridad ante un modelo que se pase del límite.
 */
function truncateTweet(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) {
    return clean;
  }
  const recortado = clean.slice(0, max);
  const ultimoEspacio = recortado.lastIndexOf(" ");
  if (ultimoEspacio > 0) {
    return recortado.slice(0, ultimoEspacio).trim();
  }
  return recortado.trim();
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const tema = url.searchParams.get("tema")?.trim();

    const task = [
      "Escribe UN solo tweet listo para publicar en tu voz.",
      "Debe tener 280 caracteres como máximo, sin comillas envolventes ni hashtags de relleno.",
      "Una sola idea afilada, nada de hilos ni explicaciones.",
      tema ? `El tweet trata sobre este tema: ${tema}.` : "",
    ]
      .filter((linea) => linea.length > 0)
      .join(" ");

    const systemInstruction = buildSystemPrompt({ task });

    let texto: string;
    try {
      texto = await generate(task, {
        systemInstruction,
        temperature: 1.0,
        maxOutputTokens: 200,
      });
    } catch (cause) {
      // El wrapper lanza Error al fallar el SDK o venir vacío: Gemini caído.
      console.error("[wisdom-tweet] fallo al generar con Gemini:", cause);
      return new Response(
        JSON.stringify({ error: "El Gurú no respondió. Intenta de nuevo." }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const tweet = truncateTweet(texto, TWEET_MAX_LENGTH);

    return new Response(JSON.stringify({ tweet }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (cause) {
    console.error("[wisdom-tweet] error interno:", cause);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
