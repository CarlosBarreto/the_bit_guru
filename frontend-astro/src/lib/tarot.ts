/**
 * Tarot cibernético — 22 arcanos mayores canónicos del Gurú de Bits.
 *
 * Los nombres son canónicos y replican EXACTAMENTE el array
 * `$cartasCiberneticas` del backend PHP congelado
 * (`legacy/backend-php/app/Controllers/TarotController.php`, método `tirada()`).
 * No se cambian sin proceso (ver §7 y §9 de PERSONA.md).
 *
 * Capa de dominio pura: este módulo no importa nada de HTTP/Astro/Gemini.
 */
export const ARCANOS: readonly string[] = [
  "0 - El Bit",
  "I - El Mago Cibernético",
  "II - La Sacerdotisa de la Nube",
  "III - La Emperatriz del Jardín Digital",
  "IV - El Emperador de la Torre de Servidores",
  "IX - El Ermitaño del Metaverso",
  "V - El Oráculo del Stream",
  "VI - Los Enlaces Gemelos",
  "VII - El Vehículo Autónomo",
  "VIII - La Justicia del Algoritmo",
  "X - La Rueda de la Fortuna (404)",
  "XI - La Fuerza del Híbrido",
  "XII - El Colgado de la Red",
  "XIII - La Muerte del Sistema",
  "XIV - La Templanza del Flujo de Datos",
  "XIX - El Sol de Silicio",
  "XV - El Demonio del Spam",
  "XVI - La Torre Caída",
  "XVII - La Estrella de Neón",
  "XVIII - La Luna del Espejismo",
  "XX - El Juicio del Código",
  "XXI - El Mundo del Metaverso",
];
