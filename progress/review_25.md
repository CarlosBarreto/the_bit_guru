# review_25 — Reporte del reviewer · feature #25 redesign_page_admision

- **Fecha:** 2026-06-11
- **Rol:** reviewer (APRUEBA / RECHAZA; no edita código)
- **Veredicto:** **APPROVED**

## Resultado de la verificación

- `.\init.ps1` (raíz): **exit 0**. Todos los pasos `[OK]`; `feature_list.json` válido (26 features); "[OK] Entorno listo."
- `npm test --prefix frontend-astro` (vía init.ps1): **508/508 verdes** (44 files). Coincide con el reporte del implementer (baseline 464 → +44 nuevos, +2 archivos).
- `npm run build --prefix frontend-astro`: **exit 0**. "Server built in 6.90s · Complete!" (adapter Vercel, sin errores).

## Perímetro (verificado con git)

`git diff --name-only HEAD -- frontend-astro/` → **vacío**: NINGÚN archivo trackeado del frontend fue modificado. Por tanto `src/lib/`, `src/pages/api/*`, `src/layouts/Layout.astro` y `src/components/PageShell.astro` quedan **intactos**, y ninguna feature `done` fue tocada.

Archivos nuevos de la feature #25 (4):
- `frontend-astro/src/utils/admision-client.ts` — cliente de I/O del IntakeForm.
- `frontend-astro/src/components/IntakeForm.astro` — formulario de admisión.
- `frontend-astro/src/pages/admision.astro` — página /admision, acento Olive.
- `frontend-astro/tests/utils/admision-client.test.ts` + `frontend-astro/tests/pages/admision.test.ts` — tests.

`la-firma.*` y `progress/impl_24.md`/`review_24.md` que aparecen sin trackear son residuo de la feature #24 (ya APPROVED en `review_24.md`), no de #25.

## Arquitectura / convenciones

- **Capas correctas:** PASS. El cliente de I/O vive en `src/utils/admision-client.ts` (helper de navegador), NO en `lib/`. El dominio `lib/` se mantiene puro. `fetch` inyectable (`AdmisionFetch`, `admision-client.ts:58-61`) para testear sin red. Regla de dependencias `pages/ → utils/` respetada; el form importa solo del cliente (`IntakeForm.astro:22-28`), no de `pages/api/`.
- **Nombres / estilo:** PASS. Funciones `camelCase` (`normalizeProblema`, `buildAdmisionRequest`, `submitAdmision`, `wireIntakeForm`); constantes `UPPER_SNAKE` (`READING_ENDPOINT`, `ADMISION_*_TEXT`); tipos `PascalCase` (`ConsultaTipo`, `DiagnosticoResultado`, `AdmisionResponseLike`); archivo TS `kebab-case`. Comillas dobles, semicolons, 2 espacios.
- **Manejo de errores:** PASS. `submitAdmision` lanza ante HTTP no-ok (`admision-client.ts:166-168`) y ante payload inválido (`parseAdmisionPayload:147`); `wireIntakeForm` captura en el `.catch` (`:263-265`) y degrada a `ErrorState`. El microcopy de error nunca expone stack trace (`ADMISION_ERROR_TEXT:40-41`).
- **Microcopy única fuente de verdad:** PASS. Las 4 constantes se exportan del cliente y las reusan el componente (`IntakeForm.astro:22-28`) y ambos tests; no hay copy duplicado inline.
- **Sin imports nuevos / sin deps externas:** PASS. Cero dependencias añadidas; reusa `Layout`, `PageShell`, `Container`, `EditorialHero`, `SectionDivider`, `Prose` (`admision.astro:17-23`).
- **Sin logs/prints/TODOs sueltos:** PASS. Comentarios documentan el porqué (capa, progresividad), sin debug.
- **Tokens del olive resuelven:** verificado en `Layout.astro:125-130`: `--accent-deep/--accent/--accent-bright/--accent-wash` definidos para `[data-accent="olive"]`. `--ink-rule` (`:60`), `--paper-pure` (`:52`) también existen. Cero hex sueltos en el `<style>` del form (test `admision.test.ts:210` lo afirma).

## Validación de los criterios de `acceptance` (feature_list.json #25)

1. **`<main data-accent="olive">`; EXACTAMENTE 1 data-accent; una sola familia.** PASS.
   - `admision.astro:27` pasa `<PageShell accent="olive">`; `PageShell.astro:33` emite `<main id="main" data-accent="olive">`. Nav/footer quedan fuera del `<main>` (siguen Navy). Mismo patrón canónico de features 19–24 ya `done`.
   - Tests `admision.test.ts:35-45` afirman el `<main data-accent="olive">` y que hay UN único `data-accent` en el documento, igual a `"olive"`.
   - Nota literal idéntica a #24: el criterio escrito dice "body data-accent='olive'" pero el repo coloca el acento en `<main>` vía `PageShell` desde la feature 19. No es desviación de esta página; aprobado conforme al patrón vigente.

2. **IntakeForm cablea POST /api/reading y/o /api/pregunta SIN modificar endpoints.** PASS.
   - `buildAdmisionRequest` (`admision-client.ts:93-112`) arma POST a `/api/reading` (diagnóstico, `{problema}`) o `/api/pregunta` (consulta, `{pregunta}`). `parseAdmisionPayload` (`:121-148`) normaliza ambos contratos (`{arcanos,interpretacion}` / `{respuesta}`).
   - Endpoints intactos (git, ver Perímetro). Tests `admision.test.ts:177-182` afirman que ni la página ni el form importan de `pages/api`. El form usa `method="post" action={READING_ENDPOINT}` (`IntakeForm.astro:35-36`) → degradación sin JS al endpoint por defecto.

3. **Cada campo con `<label>`; errores con `aria-describedby` + `aria-invalid`; foco visible.** PASS.
   - `<label for="problema">` ↔ `<textarea id="problema">` (`IntakeForm.astro:58,65`); radios envueltos en su `<label>` + `<legend>` (`:40,46-53`).
   - `aria-describedby="problema-help problema-error"`, `aria-required`, `aria-invalid="false"` inicial (`:69-71`), toggled a `"true"/"false"` por el cliente (`admision-client.ts:226,235`). Destinos del describedby existen (`:59,73-80`).
   - `:focus-visible { outline: 2px solid var(--accent) }` en textarea (`:206`), radios (`:175`) y botón (`:250`). Tests `admision.test.ts:72-93` anclan label/id, describedby, invalid, required.

4. **ConfirmationState `role="status"` y ErrorState `role="alert"` con microcopy de registro.** PASS.
   - Confirmación: `data-intake-confirm role="status" aria-live="polite" hidden` (`IntakeForm.astro:99-105`) + `ADMISION_SUCCESS_TEXT`. Error: `data-intake-error role="alert" hidden` (`:111`) + `ADMISION_ERROR_TEXT`. Estado de carga aparte: `role="status"` (`:90-92`).
   - Tests `admision.test.ts:95-120` afirman roles, `aria-live`, `hidden` y presencia del microcopy. Microcopy en registro consultora deadpan, sin "!" (verificado en `admision-client.test.ts:60-71`).

5. **tests/ mockea el POST y valida éxito/error + accesibilidad del form (sin red).** PASS.
   - `admision-client.test.ts`: `fetch` siempre mockeado (`vi.stubGlobal` + stub inyectado, `:27-35`). Cubre contrato de endpoints, microcopy, normalize, buildRequest, parse (ambos contratos + fallos), submit (éxito ambos endpoints, HTTP 502, payload inválido), y `wireIntakeForm` con DOM falso (validación vacía sin red `:333-343`, éxito diagnóstico con arcanos, éxito consulta sin arcanos, error HTTP `role=alert`, sin form).
   - `admision.test.ts`: patrón doble del repo (Container API + readFileSync). Sin servicios externos.

6. **`init.ps1` verde y `npm test` pasa.** PASS (ver Verificación: exit 0, 508/508).

### Prohibiciones (escopadas a `<style>`/HTML renderizado)

- Sin hex de marca sueltos: PASS — `<style>` del form solo `var(--...)`, test `admision.test.ts:210` afirma `not.toContain("#")`.
- Sin gradiente (`*-gradient`): PASS — test `:131-139` (HTML render) + `:204-205` (style block) afirman `not.toContain("gradient")`.
- Sin glow/box-shadow/text-shadow: PASS — tests `:137-138,206-207`.
- Sin dark mode: PASS — `not.toContain("prefers-color-scheme")` (`:208`); sin `background-image` (`:135`).
- Sin Tailwind CDN: PASS — no hay `<script src=...cdn.tailwindcss` ni clases utilitarias; estilo en `<style>` scoped con tokens.
- Sin emoji: PASS — `not.toMatch(/\p{Extended_Pictographic}/u)` en HTML render (`:148`), source (`:211`) y microcopy (`admision-client.test.ts:69`).
- Las únicas ocurrencias de "gradiente" son prosa en los comentarios de cabecera (frontmatter), fuera del perímetro auditado — precedente features 20–24.

## Checkpoints C1–C5

### C1 — El arnés está completo
- [x] 4 archivos base presentes (init.ps1 los reporta `[OK]`).
- [x] 3 docs presentes (`[OK]` en init.ps1).
- [x] `.\init.ps1` termina con exit 0.

### C2 — El estado es coherente
- [x] Una sola feature `in_progress` (#25; el resto done/pending). El implementer no tocó el status — correcto.
- [x] Toda feature `done` tiene tests que pasan (508/508).
- [x] `progress/current.md` existe y describe la sesión activa (validado por init.ps1).

### C3 — El código respeta la arquitectura
- [x] `src/` solo módulos previstos: cliente de I/O en `utils/`, componente en `components/`, página en `pages/`. `lib/` y `api/` intactos (git).
- [x] Sin dependencias externas nuevas.
- [x] Sin logs/prints de debug ni TODOs sin contexto en los archivos nuevos.

### C4 — La verificación es real
- [x] `tests/utils/admision-client.test.ts` + `tests/pages/admision.test.ts` cubren cada módulo nuevo (44 tests).
- [x] Tests sin servicios externos: `fetch` mockeado en su frontera; DOM falso sin jsdom; render por Container API.
- [x] `npm test` muestra 508 > 0, todos verdes.

### C5 — La sesión se cerró bien
- [x] Sin artefactos sospechosos: solo los 4 archivos de la feature creados (+ residuo de #24 ya aprobado, fuera de esta revisión).
- [x] `progress/history.md` tiene entrada de la sesión; `progress/impl_25.md` documenta la implementación; este `review_25.md` cierra la revisión.
- [x] Feature #25 sigue `in_progress` en `feature_list.json` — correcto: el cierre a `done` lo decide el leader tras este APPROVED.

## Cambios requeridos

Ninguno.

## Notas (no bloqueantes)

1. **Smoke con Gemini real pendiente del dueño.** `/api/reading` y `/api/pregunta` llaman a Gemini; `docs/verification.md` §3 exige smoke manual con `GEMINI_API_KEY` real para features que *tocan* endpoints Gemini. Esta feature solo los CONSUME por HTTP (no los modifica), así que la regla aplica de forma indirecta; el flujo end-to-end del IntakeForm contra el modelo vivo no se ha probado. No bloquea el APPROVED del reviewer, pero el leader debería recabar el smoke del dueño antes de marcar `done` si interpreta §3 estrictamente.
2. **`/api/reading` ignora `{problema}`.** El POST de diagnóstico envía el problema como contexto que el endpoint actual no lee (sortea 3 arcanos al azar). Coherente con "no tocar endpoints"; condicionar la lectura al problema sería una feature nueva del lado endpoint (decisión abierta).
3. **Literalidad "body data-accent".** Igual que en #24: el repo aplica el acento en `<main>` vía `PageShell`. Sin desviación; cambiarlo sería transversal y fuera de alcance.

---

**Firma del Agente Mictlán** · reviewer · bit_guru · 2026-06-11
