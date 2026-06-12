import { describe, it, expect, vi, afterEach } from "vitest";
import {
  READING_ENDPOINT,
  PREGUNTA_ENDPOINT,
  ADMISION_LOADING_TEXT,
  ADMISION_SUCCESS_TEXT,
  ADMISION_ERROR_TEXT,
  ADMISION_REQUIRED_TEXT,
  normalizeProblema,
  buildAdmisionRequest,
  parseAdmisionPayload,
  submitAdmision,
  wireIntakeForm,
  type AdmisionFetch,
} from "../../src/utils/admision-client";

// Tests del módulo cliente de /admision (feature 25, Phase 4). El fetch se
// mockea SIEMPRE (vi.stubGlobal("fetch", ...) para el default y stubs
// inyectados vía AdmisionFetch): cero red. El cableado del form se prueba con
// un DOM falso mínimo (objetos planos casteados a Document/HTMLElement, mismo
// recurso de cast que usa tests/utils/memos-client.test.ts).

function jsonResponse(payload: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => payload };
}

function stubFetch(payload: unknown, ok = true, status = 200) {
  return vi.fn(async (_url: string, _init: unknown) =>
    jsonResponse(payload, ok, status),
  ) as unknown as AdmisionFetch & ReturnType<typeof vi.fn>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admision-client — contrato de endpoints (solo lectura)", () => {
  it("apunta a los endpoints existentes sin tocarlos", () => {
    expect(READING_ENDPOINT).toBe("/api/reading");
    expect(PREGUNTA_ENDPOINT).toBe("/api/pregunta");
  });
});

describe("admision-client — microcopy de registro consultora", () => {
  it("la carga habla en deliberación institucional (usted, deadpan)", () => {
    expect(ADMISION_LOADING_TEXT).toContain("deliberación");
    expect(ADMISION_LOADING_TEXT.toLowerCase()).toContain("socio");
  });

  it("el éxito confirma recepción en el registro de la firma", () => {
    expect(ADMISION_SUCCESS_TEXT).toContain("recibida");
    expect(ADMISION_SUCCESS_TEXT.toLowerCase()).toContain("registro");
  });

  it("el error es digno: latencia oracular y reintento en usted", () => {
    expect(ADMISION_ERROR_TEXT).toContain("latencia");
    expect(ADMISION_ERROR_TEXT).toContain("Reintente");
  });

  it("sin signos de exclamación ni emoji en ningún microcopy", () => {
    const textos = [
      ADMISION_LOADING_TEXT,
      ADMISION_SUCCESS_TEXT,
      ADMISION_ERROR_TEXT,
      ADMISION_REQUIRED_TEXT,
    ];
    for (const texto of textos) {
      expect(texto).not.toContain("!");
      expect(texto).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
});

describe("admision-client — normalizeProblema", () => {
  it("recorta y devuelve el texto válido", () => {
    expect(normalizeProblema("  mi crisis  ")).toBe("mi crisis");
  });

  it("devuelve null ante blanco o no-string", () => {
    expect(normalizeProblema("")).toBeNull();
    expect(normalizeProblema("   ")).toBeNull();
    expect(normalizeProblema(undefined)).toBeNull();
    expect(normalizeProblema(42)).toBeNull();
  });
});

describe("admision-client — buildAdmisionRequest", () => {
  it("diagnostico → POST /api/reading con el problema en el body", () => {
    const req = buildAdmisionRequest("diagnostico", "mi roadmap arde");
    expect(req.url).toBe("/api/reading");
    expect(req.method).toBe("POST");
    expect(req.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(req.body)).toEqual({ problema: "mi roadmap arde" });
  });

  it("consulta → POST /api/pregunta con { pregunta }", () => {
    const req = buildAdmisionRequest("consulta", "¿debo migrar?");
    expect(req.url).toBe("/api/pregunta");
    expect(req.method).toBe("POST");
    expect(JSON.parse(req.body)).toEqual({ pregunta: "¿debo migrar?" });
  });
});

describe("admision-client — parseAdmisionPayload", () => {
  it("diagnostico normaliza { arcanos, interpretacion }", () => {
    const out = parseAdmisionPayload("diagnostico", {
      arcanos: ["El Mago Compilador", "La Torre 404", "El Loco"],
      interpretacion: "  Su arquitectura es un acto de fe.  ",
    });
    expect(out.arcanos).toEqual([
      "El Mago Compilador",
      "La Torre 404",
      "El Loco",
    ]);
    expect(out.veredicto).toBe("Su arquitectura es un acto de fe.");
  });

  it("consulta normaliza { respuesta } y no trae arcanos", () => {
    const out = parseAdmisionPayload("consulta", {
      respuesta: "  Migre, o no. Da igual.  ",
    });
    expect(out.arcanos).toEqual([]);
    expect(out.veredicto).toBe("Migre, o no. Da igual.");
  });

  it("lanza ante payload de diagnóstico incompleto", () => {
    expect(() =>
      parseAdmisionPayload("diagnostico", { interpretacion: "x" }),
    ).toThrow();
    expect(() =>
      parseAdmisionPayload("diagnostico", { arcanos: [] }),
    ).toThrow();
    expect(() => parseAdmisionPayload("diagnostico", null)).toThrow();
  });

  it("lanza ante respuesta de consulta vacía", () => {
    expect(() =>
      parseAdmisionPayload("consulta", { respuesta: "   " }),
    ).toThrow();
    expect(() => parseAdmisionPayload("consulta", {})).toThrow();
  });
});

describe("admision-client — submitAdmision (fetch mockeado)", () => {
  it("usa el fetch global cuando no se inyecta uno (vi.stubGlobal)", async () => {
    const globalFetch = vi.fn(async () =>
      jsonResponse({
        arcanos: ["A", "B", "C"],
        interpretacion: "Veredicto.",
      }),
    );
    vi.stubGlobal("fetch", globalFetch);

    const out = await submitAdmision("diagnostico", "mi problema");
    expect(out.veredicto).toBe("Veredicto.");
    expect(globalFetch).toHaveBeenCalledWith(
      "/api/reading",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("diagnostico: POST /api/reading con el payload correcto", async () => {
    const fetchMock = stubFetch({
      arcanos: ["A", "B", "C"],
      interpretacion: "Su deuda kármica es real.",
    });
    const out = await submitAdmision("diagnostico", "estoy en crisis", fetchMock);
    expect(out.arcanos).toEqual(["A", "B", "C"]);
    expect(out.veredicto).toBe("Su deuda kármica es real.");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/reading",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ problema: "estoy en crisis" }),
      }),
    );
  });

  it("consulta: POST /api/pregunta con { pregunta }", async () => {
    const fetchMock = stubFetch({ respuesta: "La respuesta seca." });
    const out = await submitAdmision("consulta", "¿triunfaré?", fetchMock);
    expect(out.arcanos).toEqual([]);
    expect(out.veredicto).toBe("La respuesta seca.");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pregunta",
      expect.objectContaining({
        body: JSON.stringify({ pregunta: "¿triunfaré?" }),
      }),
    );
  });

  it("lanza ante HTTP no-ok (502 del oráculo)", async () => {
    const fetchMock = stubFetch({ error: "x" }, false, 502);
    await expect(
      submitAdmision("diagnostico", "x", fetchMock),
    ).rejects.toThrow();
  });

  it("lanza ante payload inválido del endpoint", async () => {
    const fetchMock = stubFetch({ arcanos: ["A"] });
    await expect(
      submitAdmision("diagnostico", "x", fetchMock),
    ).rejects.toThrow();
  });
});

// ---- DOM falso mínimo para wireIntakeForm (sin jsdom) ----------------------

interface FakeNode {
  textContent: string | null;
  hidden: boolean;
  attrs: Map<string, string>;
  children: FakeNode[];
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  appendChild(child: FakeNode): void;
  focus(): void;
}

function makeNode(initial: Record<string, string> = {}): FakeNode {
  const attrs = new Map<string, string>(Object.entries(initial));
  return {
    textContent: "",
    hidden: true,
    attrs,
    children: [],
    setAttribute(name, value) {
      attrs.set(name, value);
    },
    getAttribute(name) {
      return attrs.get(name) ?? null;
    },
    appendChild(child) {
      this.children.push(child);
    },
    focus() {
      /* no-op */
    },
  };
}

interface FakeForm {
  field: FakeNode & { value: string };
  fieldError: FakeNode;
  status: FakeNode;
  errorBox: FakeNode;
  confirm: FakeNode;
  veredicto: FakeNode;
  arcanos: FakeNode;
  tipo: string;
  submit(): Promise<void>;
  state(): string | null;
  document: Document;
}

function makeFakeForm(tipo: "diagnostico" | "consulta" = "diagnostico"): FakeForm {
  const field = Object.assign(makeNode({ "aria-invalid": "false" }), {
    value: "",
  });
  const fieldError = makeNode();
  const status = makeNode();
  const errorBox = makeNode();
  const confirm = makeNode();
  const veredicto = makeNode();
  const arcanos = makeNode();
  const formAttrs = new Map<string, string>([["data-intake-state", "idle"]]);

  let submitHandler: ((event: { preventDefault(): void }) => void) | null =
    null;

  const selectorMap: Record<string, FakeNode> = {
    "[data-intake-problema]": field,
    "[data-intake-field-error]": fieldError,
    "[data-intake-status]": status,
    "[data-intake-error]": errorBox,
    "[data-intake-confirm]": confirm,
    "[data-intake-veredicto]": veredicto,
    "[data-intake-arcanos]": arcanos,
  };

  const form = {
    setAttribute(name: string, value: string) {
      formAttrs.set(name, value);
    },
    getAttribute(name: string) {
      return formAttrs.get(name) ?? null;
    },
    addEventListener(_evt: string, handler: typeof submitHandler) {
      submitHandler = handler;
    },
    querySelector(selector: string) {
      if (selector === 'input[name="tipo"]:checked') {
        return { value: tipo };
      }
      return selectorMap[selector] ?? null;
    },
  };

  const doc = {
    querySelector(selector: string) {
      return selector === "[data-intake-form]" ? form : null;
    },
    createElement(_tag: string) {
      return makeNode();
    },
  } as unknown as Document;

  return {
    field,
    fieldError,
    status,
    errorBox,
    confirm,
    veredicto,
    arcanos,
    tipo,
    state: () => formAttrs.get("data-intake-state") ?? null,
    document: doc,
    async submit() {
      if (!submitHandler) {
        throw new Error("submit no cableado");
      }
      submitHandler({ preventDefault() {} });
      // Da una vuelta a la microtask queue para resolver el then/catch.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

describe("admision-client — wireIntakeForm (DOM falso, fetch mockeado)", () => {
  it("validación: campo vacío marca aria-invalid y muestra el error sin red", async () => {
    const f = makeFakeForm();
    f.field.value = "   ";
    const fetchMock = stubFetch({});
    wireIntakeForm(f.document, fetchMock);
    await f.submit();

    expect(f.field.getAttribute("aria-invalid")).toBe("true");
    expect(f.fieldError.hidden).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("éxito (diagnóstico): muestra confirmación, veredicto y arcanos", async () => {
    const f = makeFakeForm("diagnostico");
    f.field.value = "mi roadmap arde";
    const fetchMock = stubFetch({
      arcanos: ["El Loco", "La Torre 404", "El Mago Compilador"],
      interpretacion: "Su plan es un acto de fe con presupuesto.",
    });
    wireIntakeForm(f.document, fetchMock);
    await f.submit();

    expect(f.state()).toBe("success");
    expect(f.confirm.hidden).toBe(false);
    expect(f.errorBox.hidden).toBe(true);
    expect(f.field.getAttribute("aria-invalid")).toBe("false");
    expect(f.veredicto.textContent).toBe(
      "Su plan es un acto de fe con presupuesto.",
    );
    expect(f.arcanos.hidden).toBe(false);
    expect(f.arcanos.children).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/reading",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("éxito (consulta): postea a /api/pregunta y no lista arcanos", async () => {
    const f = makeFakeForm("consulta");
    f.field.value = "¿debo migrar a Vercel?";
    const fetchMock = stubFetch({ respuesta: "Ya migró. No le avisaron." });
    wireIntakeForm(f.document, fetchMock);
    await f.submit();

    expect(f.state()).toBe("success");
    expect(f.veredicto.textContent).toBe("Ya migró. No le avisaron.");
    expect(f.arcanos.hidden).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pregunta",
      expect.objectContaining({
        body: JSON.stringify({ pregunta: "¿debo migrar a Vercel?" }),
      }),
    );
  });

  it("error: HTTP no-ok deja el form en estado de error (role=alert visible)", async () => {
    const f = makeFakeForm();
    f.field.value = "mi crisis existencial";
    const fetchMock = stubFetch({ error: "latencia" }, false, 502);
    wireIntakeForm(f.document, fetchMock);
    await f.submit();

    expect(f.state()).toBe("error");
    expect(f.errorBox.hidden).toBe(false);
    expect(f.confirm.hidden).toBe(true);
  });

  it("sin form en el documento no truena", () => {
    const emptyDoc = {
      querySelector: () => null,
    } as unknown as Document;
    expect(() => wireIntakeForm(emptyDoc, stubFetch({}))).not.toThrow();
  });
});
