# impl_25 — redesign_page_admision (/admision, acento Olive)

Feature #25 implementada por el subagente `implementer`. Estado: **in_progress**
(no marcada `done`; queda para el reviewer).

## Archivos tocados

Nuevos (4):

- `frontend-astro/src/utils/admision-client.ts` — módulo cliente del IntakeForm.
  Réplica del patrón de `utils/memos-client.ts` (feature 22): `fetch` inyectable
  (`AdmisionFetch`), microcopy como única fuente de verdad (constantes
  exportadas), tipos `Response`-like para testear sin red ni jsdom. Funciones:
  `normalizeProblema`, `buildAdmisionRequest`, `parseAdmisionPayload`,
  `submitAdmision`, `wireIntakeForm`.
- `frontend-astro/src/components/IntakeForm.astro` — formulario de admisión.
- `frontend-astro/src/pages/admision.astro` — página, registro consultora, Olive.
- `frontend-astro/tests/utils/admision-client.test.ts` — tests del cliente.
- `frontend-astro/tests/pages/admision.test.ts` — tests de página + componente.

NINGÚN archivo de `src/lib/` ni `src/pages/api/` fue tocado (solo se consumen
por HTTP). No se modificó `Layout.astro` ni primitivos.

## Decisiones de diseño

- **Cableado de endpoints (ambos, vía selector).** El IntakeForm ofrece un
  `fieldset` con dos opciones de "Tipo de consulta":
  - **Diagnóstico preliminar** → `POST /api/reading` → `{arcanos:[...3],
    interpretacion}`. Es el camino por defecto (coincide con la spec § PAGE-BY-PAGE
    "/admision": "diagnóstico preliminar = 3 arcanos + interpretación") y es el
    `action` nativo del `<form>` para que funcione sin JS.
  - **Consulta al Socio** → `POST /api/pregunta` con `{pregunta}` → `{respuesta}`.
  La spec (§ ANCLAJE AL BACKEND) lista AMBOS endpoints para /admision; por eso
  cableé los dos con un selector en vez de elegir uno. `parseAdmisionPayload`
  normaliza ambos contratos a `{arcanos, veredicto}`.
- **El campo de texto se llama `pregunta`** (name del textarea) para que el POST
  nativo sin-JS a `/api/pregunta` también sea válido si el usuario cambia el
  tipo; con JS el cliente arma el body correcto según el tipo. Para `/api/reading`
  el endpoint ignora el body (no lee input), así que el POST nativo a `/api/reading`
  con `{pregunta:...}` funciona igual (devuelve 3 arcanos + interpretación).
- **Progresivo / sin JS:** `<form method="post" action="/api/reading" novalidate>`.
  El JS (`wireIntakeForm`) sólo mejora: intercepta submit, valida in-place y
  pinta los estados accesibles.
- **Accesibilidad completa (spec § ACCESSIBILITY):**
  - `<label for="problema">` ↔ `<textarea id="problema">`; radios envueltos en su
    `<label>`; `<legend>` para el grupo.
  - `aria-describedby="problema-help problema-error"`, `aria-required`,
    `aria-invalid` (toggled a "true"/"false" por el cliente).
  - `:focus-visible { outline: 2px solid var(--accent) }` en textarea, radios y botón.
  - `ConfirmationState` = `role="status"` + `aria-live="polite"`.
  - `ErrorState` = `role="alert"`. Estado de carga = `role="status"` aparte.
- **Tokens only:** solo `--accent*/--ink*/--paper*/--space-*/--step-*/--font-*/
  --radius/--measure`. Cero hex sueltos, sin gradiente/glow/shadow/dark-mode/emoji.
- **Una sola familia de acento:** `<PageShell accent="olive">` pone el único
  `data-accent` en `<main>` (nav/footer siguen Navy fuera del `<main>`).
- **Copy:** registro consultora (usted, deadpan), catchphrases canónicas
  adaptadas ("Hoy las cartas indican que…", "…y si eso le tranquiliza, créalo").

## Tests

- Baseline previo: **464** tests / **42** files.
- Después: **508** tests / **44** files. Añadidos: **44** tests (2 archivos).
  - `admision-client.test.ts`: contrato de endpoints, microcopy, normalize,
    buildRequest, parse (ambos contratos), submit (fetch mockeado, ambos
    endpoints + errores), wireIntakeForm con DOM falso (validación vacía sin red,
    éxito diagnóstico con arcanos, éxito consulta sin arcanos, error HTTP, sin form).
  - `admision.test.ts`: patrón doble (Container API + readFileSync source).
    Acento olive único, un solo `<h1>`, orden de bloques, form method/action,
    label por campo, aria-describedby/invalid/required, role=status (confirm +
    loading), role=alert, error de campo vinculado, ausencia de
    img/gradiente/glow/shadow, copy sin lorem/hype, composición PageShell,
    no-importa-endpoints.
- Nota: el check de prohibición de "gradiente" se escopa al bloque `<style>`
  (precedente features 20-23): los comentarios en español del frontmatter
  contienen la palabra "gradiente" como prosa.

## Verificación

- `.\init.ps1` → **exit 0**. `Test Files 44 passed (44) · Tests 508 passed (508)`.
  "[OK] Entorno listo."
- `npm run build --prefix frontend-astro` → **verde** (output server + adapter
  Vercel; "Server built in 4.81s · Complete!").

## Deuda / observaciones no bloqueantes

- **Smoke con Gemini real pendiente del dueño.** `/api/reading` y `/api/pregunta`
  llaman a Gemini; `docs/verification.md` § "feature verificada" pide smoke manual
  con `GEMINI_API_KEY` real (`npm run dev`) para features que tocan endpoints
  Gemini. Esta feature sólo CONSUME esos endpoints (no los modifica), pero el
  flujo end-to-end del IntakeForm contra el modelo real no se ha probado en vivo.
- **Reading ignora el `problema` enviado.** El endpoint `/api/reading` no lee el
  body, así que el "problema estratégico" no influye en el diagnóstico (sortea 3
  arcanos al azar). Es coherente con el contrato actual (no se debe tocar el
  endpoint). Si se quisiera que el problema condicione la lectura, sería una
  feature nueva del lado endpoint (decisión abierta, no improvisar).
- El nav ya incluía el enlace "Admisión" a `/admision` (feature 16); esta página
  cierra ese destino.
