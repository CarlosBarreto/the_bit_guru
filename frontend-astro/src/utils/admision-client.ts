// src/utils/admision-client.ts — feature 25 (redesign_page_admision, Phase 4).
// Módulo cliente de la página /admision (docs/design/redesign_advisory_spec.md
// § PAGE-BY-PAGE "/admision" / ANCLAJE AL BACKEND): el IntakeForm recoge el
// "problema estratégico" del cliente y, según el tipo de consulta elegido,
// invoca uno de los dos endpoints ya `done`:
//   - "diagnostico" → POST /api/reading  (diagnóstico preliminar: 3 arcanos +
//                     interpretación).
//   - "consulta"    → POST /api/pregunta (consulta libre al Socio).
//
// Vive en utils/ (helpers transversales del navegador), NO en lib/: el dominio
// de lib/ es puro y sin I/O (docs/architecture.md). Este módulo es presentación
// del navegador y consume los endpoints SIN modificarlos. El `fetch` es
// inyectable (`AdmisionFetch`) para que los tests lo mockeen sin red ni jsdom
// (vi.stubGlobal("fetch", ...) o pasando un stub directo). El microcopy
// (carga/éxito/error) es la ÚNICA fuente de verdad: lo reusan el componente y
// los tests.

/** Endpoint del diagnóstico preliminar (3 arcanos + interpretación). Solo POST. */
export const READING_ENDPOINT = "/api/reading";

/** Endpoint de la consulta libre al Socio. Solo POST. */
export const PREGUNTA_ENDPOINT = "/api/pregunta";

/** Tipo de consulta que el cliente elige en el formulario. */
export type ConsultaTipo = "diagnostico" | "consulta";

/**
 * Microcopy del estado de carga (registro consultora: usted, deadpan,
 * institucional; spec § VOICE & COPY). Server-renderizable: el form funciona
 * sin JS y este texto se anuncia en el role="status" al enviar.
 */
export const ADMISION_LOADING_TEXT =
  "Solicitud en deliberación. El Socio Fundador revisa su expediente; le pedimos la paciencia habitual.";

/** Estado de éxito. Institucional, seco, sin signos de exclamación. */
export const ADMISION_SUCCESS_TEXT =
  "Su solicitud ha sido recibida y consta en el registro de la firma. Conserve el diagnóstico preliminar que aparece a continuación; no le garantiza nada, pero ya es suyo.";

/** Estado de error, digno e institucional. Nunca un stack trace. */
export const ADMISION_ERROR_TEXT =
  "El sistema oracular presenta latencia. Reintente su solicitud en unos minutos; su problema estratégico no caduca.";

/** Error de validación del campo "problema estratégico" (vacío). */
export const ADMISION_REQUIRED_TEXT =
  "Describa su problema estratégico antes de continuar. La firma no admite expedientes en blanco.";

/**
 * Subconjunto estructural de Response que necesita este módulo. Permite que los
 * tests devuelvan objetos planos sin construir Response reales.
 */
export interface AdmisionResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

/** Firma mínima de fetch para POST (este módulo envía JSON al endpoint). */
export type AdmisionFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<AdmisionResponseLike>;

/** Resultado de una admisión exitosa, normalizado para el render. */
export interface DiagnosticoResultado {
  /** Los 3 arcanos del diagnóstico (vacío cuando fue consulta libre). */
  arcanos: string[];
  /** El texto del diagnóstico (interpretación) o la respuesta del Socio. */
  veredicto: string;
}

/** Fetch por defecto: el global del navegador, resuelto al momento de llamar. */
const defaultFetch: AdmisionFetch = (url, init) => globalThis.fetch(url, init);

/**
 * Valida y normaliza el "problema estratégico" del cliente. Devuelve el texto
 * recortado o `null` si está en blanco (el caller lo traduce a estado de error
 * de validación, sin tocar la red).
 */
export function normalizeProblema(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const clean = raw.trim();
  return clean.length > 0 ? clean : null;
}

/**
 * Construye el request (url, method, headers, body) para el tipo de consulta.
 *   - "diagnostico" → POST /api/reading (el endpoint sortea los 3 arcanos; el
 *     body lleva el problema como contexto, que el endpoint ignora sin romper).
 *   - "consulta"    → POST /api/pregunta con { pregunta: <problema> }.
 */
export function buildAdmisionRequest(
  tipo: ConsultaTipo,
  problema: string,
): { url: string; method: string; headers: Record<string, string>; body: string } {
  const headers = { "Content-Type": "application/json" };
  if (tipo === "consulta") {
    return {
      url: PREGUNTA_ENDPOINT,
      method: "POST",
      headers,
      body: JSON.stringify({ pregunta: problema }),
    };
  }
  return {
    url: READING_ENDPOINT,
    method: "POST",
    headers,
    body: JSON.stringify({ problema }),
  };
}

/**
 * Normaliza el payload del endpoint correspondiente a DiagnosticoResultado.
 *   - /api/reading  → { arcanos: [...3], interpretacion: string }
 *   - /api/pregunta → { respuesta: string }
 * Lanza si el payload no trae un veredicto utilizable (el caller lo traduce a
 * estado de error).
 */
export function parseAdmisionPayload(
  tipo: ConsultaTipo,
  payload: unknown,
): DiagnosticoResultado {
  if (payload === null || typeof payload !== "object") {
    throw new Error("Respuesta del oráculo sin contenido");
  }
  if (tipo === "consulta") {
    const respuesta = (payload as { respuesta?: unknown }).respuesta;
    if (typeof respuesta === "string" && respuesta.trim().length > 0) {
      return { arcanos: [], veredicto: respuesta.trim() };
    }
    throw new Error("Respuesta del Socio vacía");
  }
  const interpretacion = (payload as { interpretacion?: unknown }).interpretacion;
  const arcanos = (payload as { arcanos?: unknown }).arcanos;
  if (
    typeof interpretacion === "string" &&
    interpretacion.trim().length > 0 &&
    Array.isArray(arcanos)
  ) {
    return {
      arcanos: arcanos.filter((a): a is string => typeof a === "string"),
      veredicto: interpretacion.trim(),
    };
  }
  throw new Error("Diagnóstico preliminar incompleto");
}

/**
 * Envía la admisión al endpoint correcto y devuelve el resultado normalizado.
 * Lanza ante HTTP no-ok o payload inválido; NO captura: el estado de error lo
 * decide quien hidrata el formulario.
 */
export async function submitAdmision(
  tipo: ConsultaTipo,
  problema: string,
  fetchLike: AdmisionFetch = defaultFetch,
): Promise<DiagnosticoResultado> {
  const req = buildAdmisionRequest(tipo, problema);
  const response = await fetchLike(req.url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
  if (!response.ok) {
    throw new Error(`Oráculo no disponible (HTTP ${response.status})`);
  }
  return parseAdmisionPayload(tipo, await response.json());
}

/** Lee el tipo de consulta seleccionado en el form (default: diagnostico). */
function readTipo(form: HTMLFormElement): ConsultaTipo {
  const checked = form.querySelector<HTMLInputElement>(
    'input[name="tipo"]:checked',
  );
  return checked?.value === "consulta" ? "consulta" : "diagnostico";
}

/**
 * Cablea el IntakeForm de la página /admision:
 *   1. Intercepta el submit (si JS está disponible) y valida el "problema
 *      estratégico". En blanco: marca aria-invalid + muestra el error de campo
 *      vinculado por aria-describedby, sin tocar la red.
 *   2. Envía al endpoint del tipo elegido (reading | pregunta) y muestra el
 *      estado de carga (role="status").
 *   3. Éxito → ConfirmationState (role="status") con el veredicto y, si es
 *      diagnóstico, la lista de arcanos. Error → ErrorState (role="alert").
 * Toda la hidratación es progresiva: sin JS el form hace POST nativo al
 * endpoint del tipo por defecto.
 */
export function wireIntakeForm(
  doc: Document,
  fetchLike: AdmisionFetch = defaultFetch,
): void {
  const form = doc.querySelector<HTMLFormElement>("[data-intake-form]");
  if (!form) {
    return;
  }
  const field = form.querySelector<HTMLTextAreaElement>("[data-intake-problema]");
  const fieldError = form.querySelector<HTMLElement>("[data-intake-field-error]");
  const status = form.querySelector<HTMLElement>("[data-intake-status]");
  const errorBox = form.querySelector<HTMLElement>("[data-intake-error]");
  const confirm = form.querySelector<HTMLElement>("[data-intake-confirm]");
  const veredicto = form.querySelector<HTMLElement>("[data-intake-veredicto]");
  const arcanosList = form.querySelector<HTMLElement>("[data-intake-arcanos]");

  function setState(state: "idle" | "loading" | "success" | "error"): void {
    form?.setAttribute("data-intake-state", state);
    if (status) {
      status.hidden = state !== "loading";
    }
    if (errorBox) {
      errorBox.hidden = state !== "error";
    }
    if (confirm) {
      confirm.hidden = state !== "success";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const problema = normalizeProblema(field?.value);
    if (!problema) {
      if (field) {
        field.setAttribute("aria-invalid", "true");
      }
      if (fieldError) {
        fieldError.hidden = false;
      }
      field?.focus();
      return;
    }
    if (field) {
      field.setAttribute("aria-invalid", "false");
    }
    if (fieldError) {
      fieldError.hidden = true;
    }
    const tipo = readTipo(form as HTMLFormElement);
    setState("loading");

    void submitAdmision(tipo, problema, fetchLike)
      .then((resultado) => {
        if (veredicto) {
          veredicto.textContent = resultado.veredicto;
        }
        if (arcanosList) {
          arcanosList.textContent = "";
          if (resultado.arcanos.length > 0) {
            arcanosList.hidden = false;
            for (const arcano of resultado.arcanos) {
              const li = doc.createElement("li");
              li.textContent = arcano;
              arcanosList.appendChild(li);
            }
          } else {
            arcanosList.hidden = true;
          }
        }
        setState("success");
      })
      .catch(() => {
        setState("error");
      });
  });
}
