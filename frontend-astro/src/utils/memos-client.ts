// src/utils/memos-client.ts — feature 22 (redesign_page_memos, Phase 4).
// Módulo cliente de la página /memos (docs/design/redesign_advisory_spec.md
// § PAGE-BY-PAGE "/memos" / ANCLAJE AL BACKEND): cada MemoCard se hidrata en el
// navegador desde GET /api/wisdom-tweet (reencuadre "memo trimestral") y los
// epígrafes opcionales desde GET /api/morpheus-quotes (aperturas de memo).
//
// Vive en utils/ (capa de helpers transversales) y NO en lib/: el dominio de
// lib/ es puro y sin I/O (docs/architecture.md); este módulo es presentación
// del navegador y consume los endpoints ya `done` SIN modificarlos (solo GET).
// El fetch es inyectable (`MemoFetch`) para que los tests lo mockeen sin red
// (vi.stubGlobal("fetch", ...) o pasando un stub directo).

/** Endpoint del que se nutre el cuerpo de cada memo (solo lectura). */
export const WISDOM_TWEET_ENDPOINT = "/api/wisdom-tweet";

/** Endpoint de los epígrafes opcionales de memo (solo lectura). */
export const MORPHEUS_QUOTES_ENDPOINT = "/api/morpheus-quotes";

/**
 * Microcopy del estado de carga (registro consultora: usted, deadpan,
 * institucional; spec § VOICE & COPY "Microcopy de error").
 */
export const MEMO_LOADING_TEXT =
  "Memorando en deliberación. El Oráculo está redactando su conclusión; le pedimos la paciencia habitual.";

/** Microcopy del estado de error, digno e institucional. Nunca un stack trace. */
export const MEMO_ERROR_TEXT =
  "El sistema oracular presenta latencia. Reintente la consulta de este memorando en unos minutos; la conclusión no caduca.";

/** Atribución del epígrafe (server-rendered junto al blockquote). */
export const EPIGRAPH_SOURCE_TEXT =
  "Apertura suministrada por un asesor externo de la firma.";

/**
 * Subconjunto estructural de Response que necesita este módulo. Permite que
 * los tests devuelvan objetos planos sin construir Response reales.
 */
export interface MemoResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

/** Firma mínima de fetch para GET (sin init: este módulo solo lee). */
export type MemoFetch = (url: string) => Promise<MemoResponseLike>;

/**
 * Entrada del índice trimestral. Es la forma editorial estática que la página
 * declara y que QuarterlyArchive/MemoCard renderizan; el cuerpo llega después
 * por hidratación.
 */
export interface MemoEntry {
  /** Número de memo en el registro de la firma (se renderiza en mono). */
  number: string;
  /** Asunto del memorando. */
  title: string;
  /** Trimestre de emisión, p. ej. "T2 2026" (agrupa el índice). */
  quarter: string;
  /** Fecha de registro opcional (mono). */
  date?: string;
  /** Tema opcional que se pasa como ?tema= a /api/wisdom-tweet. */
  tema?: string;
  /** Si el memo abre con epígrafe (se llena desde /api/morpheus-quotes). */
  withEpigraph?: boolean;
}

/** Fetch por defecto: el global del navegador, resuelto al momento de llamar. */
const defaultFetch: MemoFetch = (url) => globalThis.fetch(url);

/**
 * Construye la URL de consulta del memo. Con `tema` agrega `?tema=` codificado;
 * sin tema (o tema en blanco) devuelve el endpoint pelado.
 */
export function memoRequestUrl(tema?: string): string {
  const clean = tema?.trim();
  if (!clean) {
    return WISDOM_TWEET_ENDPOINT;
  }
  return `${WISDOM_TWEET_ENDPOINT}?tema=${encodeURIComponent(clean)}`;
}

/**
 * Valida el contrato { tweet: string } de GET /api/wisdom-tweet. Lanza si la
 * respuesta no trae un memo utilizable (el caller lo traduce a estado de error).
 */
export function parseMemoPayload(payload: unknown): string {
  if (payload !== null && typeof payload === "object") {
    const tweet = (payload as { tweet?: unknown }).tweet;
    if (typeof tweet === "string" && tweet.trim().length > 0) {
      return tweet.trim();
    }
  }
  throw new Error("Respuesta del oráculo sin memorando");
}

/**
 * Obtiene el cuerpo de un memo desde GET /api/wisdom-tweet (con tema opcional).
 * Lanza ante HTTP no-ok o payload inválido; NO captura: el estado de error lo
 * decide quien hidrata.
 */
export async function fetchMemoBody(
  fetchLike: MemoFetch = defaultFetch,
  tema?: string,
): Promise<string> {
  const response = await fetchLike(memoRequestUrl(tema));
  if (!response.ok) {
    throw new Error(`Oráculo no disponible (HTTP ${response.status})`);
  }
  return parseMemoPayload(await response.json());
}

/**
 * Obtiene los epígrafes desde GET /api/morpheus-quotes. Los epígrafes son
 * OPCIONALES: cualquier fallo (red, HTTP, payload extraño) devuelve [] y los
 * memos siguen su curso sin apertura.
 */
export async function fetchEpigraphs(
  fetchLike: MemoFetch = defaultFetch,
): Promise<string[]> {
  try {
    const response = await fetchLike(MORPHEUS_QUOTES_ENDPOINT);
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return [];
    }
    return payload.filter(
      (quote): quote is string =>
        typeof quote === "string" && quote.trim().length > 0,
    );
  } catch {
    return [];
  }
}

/**
 * Selección determinista de epígrafe por índice de tarjeta (cicla sobre las
 * citas disponibles). Sin citas devuelve undefined.
 */
export function pickEpigraph(
  quotes: readonly string[],
  index: number,
): string | undefined {
  if (quotes.length === 0) {
    return undefined;
  }
  const safeIndex = ((index % quotes.length) + quotes.length) % quotes.length;
  return quotes[safeIndex];
}

/**
 * Hidrata todas las MemoCard de la página:
 *   1. Por cada `[data-memo-card]` consulta /api/wisdom-tweet (con su
 *      `data-memo-tema` si existe) y escribe el cuerpo en `[data-memo-body]`
 *      (role="status": el cambio se anuncia sin interrumpir).
 *   2. En fallo oculta el cuerpo y muestra `[data-memo-error]` (role="alert").
 *   3. Al final reparte epígrafes de /api/morpheus-quotes SOLO en tarjetas
 *      listas que traigan hueco `[data-memo-epigraph]`; si los epígrafes
 *      fallan, no pasa nada: son opcionales.
 * El estado queda registrado en `data-memo-state`: loading → ready | error.
 */
export async function hydrateMemoCards(
  doc: Document,
  fetchLike: MemoFetch = defaultFetch,
): Promise<void> {
  const cards = Array.from(
    doc.querySelectorAll<HTMLElement>("[data-memo-card]"),
  );
  if (cards.length === 0) {
    return;
  }

  // Una sola consulta de epígrafes compartida por todas las tarjetas.
  const epigraphsPromise = fetchEpigraphs(fetchLike);

  await Promise.all(
    cards.map(async (card) => {
      const body = card.querySelector<HTMLElement>("[data-memo-body]");
      const alert = card.querySelector<HTMLElement>("[data-memo-error]");
      const tema = card.getAttribute("data-memo-tema") ?? undefined;
      try {
        const memo = await fetchMemoBody(fetchLike, tema);
        if (body) {
          body.textContent = memo;
        }
        card.setAttribute("data-memo-state", "ready");
      } catch {
        if (body) {
          body.hidden = true;
        }
        if (alert) {
          alert.hidden = false;
        }
        card.setAttribute("data-memo-state", "error");
      }
    }),
  );

  const epigraphs = await epigraphsPromise;
  if (epigraphs.length === 0) {
    return;
  }

  cards.forEach((card, index) => {
    if (card.getAttribute("data-memo-state") !== "ready") {
      return;
    }
    const block = card.querySelector<HTMLElement>("[data-memo-epigraph]");
    const text = card.querySelector<HTMLElement>("[data-memo-epigraph-text]");
    const quote = pickEpigraph(epigraphs, index);
    if (!block || !text || !quote) {
      return;
    }
    text.textContent = quote;
    block.hidden = false;
  });
}
