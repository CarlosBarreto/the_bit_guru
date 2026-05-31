import type { APIRoute } from "astro";

/**
 * Citas de Morpheus para el efecto de máquina de escribir.
 *
 * Canon idéntico al backend PHP congelado
 * (`legacy/backend-php/app/Controllers/TarotController.php`, método
 * `morpheusQuotes()`). No se editan sin proceso.
 */
const MORPHEUS_QUOTES: readonly string[] = [
  "La Matrix está en todas partes. Nos rodea. Incluso ahora, en esta misma habitación.",
  "Es el mundo que ha sido puesto ante tus ojos para cegarte de la verdad.",
  "Es un mundo de ensueño generado por computadora, construido para mantenernos bajo control.",
  "Es tu última oportunidad. Después de esto, no hay vuelta atrás.",
  "Tomas la pastilla azul, la historia termina, te despiertas en tu cama y crees lo que quieras creer.",
  "Tomas la pastilla roja, te quedas en el País de las Maravillas y te muestro cuán profundo es el agujero del conejo.",
  "Recuerda... todo lo que te ofrezco es la verdad. Nada más.",
  "Estoy intentando liberar tu mente, Neo. Pero solo puedo mostrarte la puerta. Tú eres quien tiene que atravesarla.",
];

export const GET: APIRoute = () => {
  try {
    return new Response(JSON.stringify(MORPHEUS_QUOTES), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
