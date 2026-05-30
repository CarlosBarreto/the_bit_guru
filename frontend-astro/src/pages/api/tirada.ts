import type { APIRoute } from "astro";
import { ARCANOS } from "../../lib/tarot";

/**
 * Tirada de 3 arcanos cibernéticos distintos, al azar y sin reemplazo.
 *
 * Lógica de dominio pura: no llama a Gemini. Selecciona 3 cartas únicas
 * del array canónico ARCANOS (ver lib/tarot.ts) mediante un barajado
 * parcial de Fisher-Yates.
 */
export const GET: APIRoute = () => {
  try {
    const baraja = [...ARCANOS];
    for (let i = baraja.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baraja[i], baraja[j]] = [baraja[j], baraja[i]];
    }
    const tirada = baraja.slice(0, 3).map((nombre) => ({ nombre }));

    return new Response(JSON.stringify(tirada), {
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
