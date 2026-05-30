import type { APIRoute } from "astro";

/**
 * Genera el PROMPT VISUAL (texto) para una imagen del Gurú de Bits.
 *
 * Este endpoint NO genera la imagen: devuelve `{ prompt: string }`, el prompt
 * textual que luego se enviará a un generador de imágenes externo. Recibe un
 * body opcional `{ escena?: string }` con el motivo concreto a ilustrar.
 *
 * El prompt se construye de forma DETERMINÍSTICA para garantizar — sin depender
 * de la red ni del modelo — que siempre cumple las restricciones canónicas de
 * §8 de PERSONA.md: paleta morado / cyan / negro / neón rosa, universo
 * ciber-místico, y la prohibición explícita de fotorrealismo y caras humanas
 * completas. Por eso este endpoint no llama a Gemini y no requiere smoke con
 * API key real (ver docs/conventions.md § manejo de errores).
 */

/** Paleta canónica del Gurú (PERSONA.md §8). Hex aproximados al léxico canónico. */
const PALETA_CANONICA = [
  "morado profundo (#3a0ca3)",
  "cyan eléctrico (#00f0ff)",
  "negro (#000000)",
  "acentos de neón rosa (#ff2bd6)",
].join(", ");

/** Restricciones visuales no negociables (PERSONA.md §8). */
const RESTRICCIONES = [
  "Prohibido el fotorrealismo: estilo ilustrado, ciber-místico, con glitches y tipografía ritual.",
  "Prohibidas las caras humanas completas: rostro parcialmente oculto, capucha o capa, ojos brillantes no humanos. Nunca un humano realista.",
].join(" ");

/** Escena por defecto cuando el cliente no especifica una. */
const ESCENA_DEFAULT =
  "el Gurú de Bits leyendo cartas de tarot cibernético entre circuitos y arcanos";

function buildImagePrompt(escena: string): string {
  return [
    `Imagen ciber-mística del Gurú de Bits: ${escena}.`,
    `Paleta cromática obligatoria: ${PALETA_CANONICA}.`,
    "Universo visual: tarot + circuitos + glitches + tipografía ritual.",
    RESTRICCIONES,
  ].join(" ");
}

export const POST: APIRoute = async ({ request }) => {
  try {
    let payload: unknown = {};
    const hasBody = request.headers.get("Content-Type")?.includes("application/json");
    if (hasBody) {
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
    }

    const escenaRaw = (payload as { escena?: unknown })?.escena;
    if (escenaRaw !== undefined && typeof escenaRaw !== "string") {
      return new Response(
        JSON.stringify({ error: "'escena' debe ser un texto." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const escena =
      typeof escenaRaw === "string" && escenaRaw.trim().length > 0
        ? escenaRaw.trim()
        : ESCENA_DEFAULT;

    const prompt = buildImagePrompt(escena);

    return new Response(JSON.stringify({ prompt }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (cause) {
    console.error("[create-image] error interno:", cause);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
