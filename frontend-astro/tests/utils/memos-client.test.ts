import { describe, it, expect, vi, afterEach } from "vitest";
import {
  WISDOM_TWEET_ENDPOINT,
  MORPHEUS_QUOTES_ENDPOINT,
  MEMO_LOADING_TEXT,
  MEMO_ERROR_TEXT,
  memoRequestUrl,
  parseMemoPayload,
  fetchMemoBody,
  fetchEpigraphs,
  pickEpigraph,
  hydrateMemoCards,
  type MemoFetch,
} from "../../src/utils/memos-client";

// Tests del módulo cliente de /memos (feature 22, Phase 4). El fetch se mockea
// SIEMPRE (vi.stubGlobal("fetch", ...) para el default y stubs inyectados vía
// MemoFetch): cero red. La hidratación se prueba con un DOM falso mínimo
// (objetos planos casteados a Document/HTMLElement, mismo recurso de cast que
// usa tests/pages/api/wisdom-tweet.test.ts con el APIRoute).

function jsonResponse(payload: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => payload };
}

function stubFetch(payload: unknown, ok = true, status = 200) {
  return vi.fn(async (_url: string) =>
    jsonResponse(payload, ok, status),
  ) as unknown as MemoFetch & ReturnType<typeof vi.fn>;
}

// ---- DOM falso mínimo para hydrateMemoCards (sin jsdom) --------------------

interface FakePart {
  textContent: string | null;
  hidden: boolean;
}

function makeFakeCard(opts: { tema?: string; withEpigraph?: boolean } = {}) {
  const attrs = new Map<string, string>([["data-memo-state", "loading"]]);
  if (opts.tema) {
    attrs.set("data-memo-tema", opts.tema);
  }
  const body: FakePart = { textContent: MEMO_LOADING_TEXT, hidden: false };
  const alert: FakePart = { textContent: MEMO_ERROR_TEXT, hidden: true };
  const epigraphBlock: FakePart | null = opts.withEpigraph
    ? { textContent: "", hidden: true }
    : null;
  const epigraphText: FakePart | null = opts.withEpigraph
    ? { textContent: "", hidden: false }
    : null;
  const parts: Record<string, FakePart | null> = {
    "[data-memo-body]": body,
    "[data-memo-error]": alert,
    "[data-memo-epigraph]": epigraphBlock,
    "[data-memo-epigraph-text]": epigraphText,
  };
  return {
    body,
    alert,
    epigraphBlock,
    epigraphText,
    state: () => attrs.get("data-memo-state"),
    getAttribute: (name: string) => attrs.get(name) ?? null,
    setAttribute: (name: string, value: string) => {
      attrs.set(name, value);
    },
    querySelector: (selector: string) => parts[selector] ?? null,
  };
}

function makeFakeDocument(cards: ReturnType<typeof makeFakeCard>[]): Document {
  return {
    querySelectorAll: (selector: string) =>
      selector === "[data-memo-card]" ? cards : [],
  } as unknown as Document;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("memos-client — contrato de endpoints (solo lectura)", () => {
  it("apunta a los endpoints existentes sin tocarlos", () => {
    expect(WISDOM_TWEET_ENDPOINT).toBe("/api/wisdom-tweet");
    expect(MORPHEUS_QUOTES_ENDPOINT).toBe("/api/morpheus-quotes");
  });

  it("memoRequestUrl sin tema devuelve el endpoint pelado", () => {
    expect(memoRequestUrl()).toBe("/api/wisdom-tweet");
    expect(memoRequestUrl("   ")).toBe("/api/wisdom-tweet");
  });

  it("memoRequestUrl con tema agrega ?tema= codificado", () => {
    expect(memoRequestUrl("la deuda técnica")).toBe(
      `/api/wisdom-tweet?tema=${encodeURIComponent("la deuda técnica")}`,
    );
  });
});

describe("memos-client — microcopy de registro consultora", () => {
  it("la carga habla en deliberación institucional (usted, deadpan)", () => {
    expect(MEMO_LOADING_TEXT).toContain("deliberación");
    expect(MEMO_LOADING_TEXT).toContain("Oráculo");
  });

  it("el error es digno: latencia oracular y reintento en usted", () => {
    expect(MEMO_ERROR_TEXT).toContain("latencia");
    expect(MEMO_ERROR_TEXT).toContain("Reintente");
  });

  it("sin signos de exclamación ni microcopy cute", () => {
    for (const texto of [MEMO_LOADING_TEXT, MEMO_ERROR_TEXT]) {
      expect(texto).not.toContain("!");
      expect(texto).not.toMatch(/\p{Extended_Pictographic}/u);
    }
    expect(MEMO_LOADING_TEXT).not.toBe(MEMO_ERROR_TEXT);
  });
});

describe("memos-client — fetchMemoBody (fetch mockeado)", () => {
  it("usa el fetch global cuando no se inyecta uno (vi.stubGlobal)", async () => {
    const globalFetch = vi.fn(async () =>
      jsonResponse({ tweet: "Su roadmap es un acto de fe con presupuesto." }),
    );
    vi.stubGlobal("fetch", globalFetch);

    const memo = await fetchMemoBody();
    expect(memo).toBe("Su roadmap es un acto de fe con presupuesto.");
    expect(globalFetch).toHaveBeenCalledWith("/api/wisdom-tweet");
  });

  it("pasa el tema como query string al endpoint", async () => {
    const fetchMock = stubFetch({ tweet: "El karma también factura." });
    await fetchMemoBody(fetchMock, "la deuda técnica");
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/wisdom-tweet?tema=${encodeURIComponent("la deuda técnica")}`,
    );
  });

  it("lanza ante HTTP no-ok (502 del oráculo)", async () => {
    const fetchMock = stubFetch({ error: "El Gurú no respondió." }, false, 502);
    await expect(fetchMemoBody(fetchMock)).rejects.toThrow();
  });

  it("lanza ante payload sin { tweet: string } utilizable", async () => {
    await expect(fetchMemoBody(stubFetch({}))).rejects.toThrow();
    await expect(fetchMemoBody(stubFetch({ tweet: "   " }))).rejects.toThrow();
    await expect(fetchMemoBody(stubFetch(null))).rejects.toThrow();
  });

  it("parseMemoPayload recorta espacios del memo válido", () => {
    expect(parseMemoPayload({ tweet: "  Conclusión seca.  " })).toBe(
      "Conclusión seca.",
    );
  });
});

describe("memos-client — fetchEpigraphs (opcionales, nunca rompen)", () => {
  it("devuelve las citas string no vacías del array", async () => {
    const fetchMock = stubFetch(["Cita uno.", "", 42, "Cita dos."]);
    await expect(fetchEpigraphs(fetchMock)).resolves.toEqual([
      "Cita uno.",
      "Cita dos.",
    ]);
    expect(fetchMock).toHaveBeenCalledWith("/api/morpheus-quotes");
  });

  it("devuelve [] ante HTTP no-ok", async () => {
    await expect(
      fetchEpigraphs(stubFetch({ error: "x" }, false, 500)),
    ).resolves.toEqual([]);
  });

  it("devuelve [] ante payload que no es array", async () => {
    await expect(fetchEpigraphs(stubFetch({ quotes: [] }))).resolves.toEqual(
      [],
    );
  });

  it("devuelve [] ante fallo de red (rechazo del fetch)", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as MemoFetch;
    await expect(fetchEpigraphs(fetchMock)).resolves.toEqual([]);
  });
});

describe("memos-client — pickEpigraph", () => {
  it("cicla determinísticamente sobre las citas por índice", () => {
    const quotes = ["a", "b", "c"];
    expect(pickEpigraph(quotes, 0)).toBe("a");
    expect(pickEpigraph(quotes, 2)).toBe("c");
    expect(pickEpigraph(quotes, 3)).toBe("a");
    expect(pickEpigraph(quotes, 4)).toBe("b");
  });

  it("sin citas devuelve undefined", () => {
    expect(pickEpigraph([], 0)).toBeUndefined();
  });
});

describe("memos-client — hydrateMemoCards (DOM falso, fetch mockeado)", () => {
  it("éxito: escribe el memo en el cuerpo y marca data-memo-state='ready'", async () => {
    const card = makeFakeCard();
    const fetchMock = vi.fn(async (url: string) =>
      url === MORPHEUS_QUOTES_ENDPOINT
        ? jsonResponse([])
        : jsonResponse({ tweet: "Su transformación digital ya ocurrió. No le avisaron." }),
    ) as unknown as MemoFetch;

    await hydrateMemoCards(makeFakeDocument([card]), fetchMock);

    expect(card.body.textContent).toBe(
      "Su transformación digital ya ocurrió. No le avisaron.",
    );
    expect(card.state()).toBe("ready");
    expect(card.alert.hidden).toBe(true);
  });

  it("consulta /api/wisdom-tweet con el ?tema= del data-memo-tema", async () => {
    const card = makeFakeCard({ tema: "la deuda técnica" });
    const urls: string[] = [];
    const fetchMock = vi.fn(async (url: string) => {
      urls.push(url);
      return url === MORPHEUS_QUOTES_ENDPOINT
        ? jsonResponse([])
        : jsonResponse({ tweet: "Memo." });
    }) as unknown as MemoFetch;

    await hydrateMemoCards(makeFakeDocument([card]), fetchMock);

    expect(urls).toContain(
      `/api/wisdom-tweet?tema=${encodeURIComponent("la deuda técnica")}`,
    );
  });

  it("error: oculta el cuerpo, muestra la alerta y marca 'error'", async () => {
    const card = makeFakeCard();
    const fetchMock = vi.fn(async (url: string) =>
      url === MORPHEUS_QUOTES_ENDPOINT
        ? jsonResponse([])
        : jsonResponse({ error: "latencia" }, false, 502),
    ) as unknown as MemoFetch;

    await hydrateMemoCards(makeFakeDocument([card]), fetchMock);

    expect(card.body.hidden).toBe(true);
    expect(card.alert.hidden).toBe(false);
    expect(card.alert.textContent).toBe(MEMO_ERROR_TEXT);
    expect(card.state()).toBe("error");
  });

  it("reparte epígrafes SOLO en tarjetas listas con hueco de epígrafe", async () => {
    const withEpigraph = makeFakeCard({ withEpigraph: true });
    const without = makeFakeCard();
    const fetchMock = vi.fn(async (url: string) =>
      url === MORPHEUS_QUOTES_ENDPOINT
        ? jsonResponse(["La Matrix está en todas partes."])
        : jsonResponse({ tweet: "Memo." }),
    ) as unknown as MemoFetch;

    await hydrateMemoCards(makeFakeDocument([withEpigraph, without]), fetchMock);

    expect(withEpigraph.epigraphText?.textContent).toBe(
      "La Matrix está en todas partes.",
    );
    expect(withEpigraph.epigraphBlock?.hidden).toBe(false);
    expect(without.epigraphBlock).toBeNull();
  });

  it("no asigna epígrafe a una tarjeta en estado de error", async () => {
    const card = makeFakeCard({ withEpigraph: true });
    const fetchMock = vi.fn(async (url: string) =>
      url === MORPHEUS_QUOTES_ENDPOINT
        ? jsonResponse(["Cita disponible."])
        : jsonResponse({}, false, 502),
    ) as unknown as MemoFetch;

    await hydrateMemoCards(makeFakeDocument([card]), fetchMock);

    expect(card.state()).toBe("error");
    expect(card.epigraphBlock?.hidden).toBe(true);
    expect(card.epigraphText?.textContent).toBe("");
  });

  it("si los epígrafes fallan, los memos cargan igual (son opcionales)", async () => {
    const card = makeFakeCard({ withEpigraph: true });
    const fetchMock = vi.fn(async (url: string) => {
      if (url === MORPHEUS_QUOTES_ENDPOINT) {
        throw new Error("network down");
      }
      return jsonResponse({ tweet: "Memo intacto." });
    }) as unknown as MemoFetch;

    await hydrateMemoCards(makeFakeDocument([card]), fetchMock);

    expect(card.body.textContent).toBe("Memo intacto.");
    expect(card.state()).toBe("ready");
    expect(card.epigraphBlock?.hidden).toBe(true);
  });

  it("sin tarjetas no dispara ningún fetch", async () => {
    const fetchMock = vi.fn() as unknown as MemoFetch & ReturnType<typeof vi.fn>;
    await hydrateMemoCards(makeFakeDocument([]), fetchMock);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
