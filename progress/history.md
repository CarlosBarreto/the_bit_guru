# progress/history.md — Bitácora append-only

> Cada sesión cerrada deja aquí una entrada. No se edita el pasado, solo se
> añade al final.

---

<!--
Plantilla de entrada (copiar al cerrar sesión):

## YYYY-MM-DD — feature <id> <name>

- **Veredicto:** done | blocked
- **Resumen:** (1-3 líneas)
- **Archivos tocados:** lista breve
- **Notas para la próxima sesión:** (si las hay)

---
-->

## 2026-05-29 — feature 1 setup_astro_unified

- **Veredicto:** done
- **Resumen:** Astro habilitado en modo SSR (`output: 'server'`) con adapter `@astrojs/vercel` (pineado a `^9` por peer astro@^5); instaladas deps `@google/genai`, `vitest` + toolchain de lint; scripts npm `dev/build/preview/test/lint`. Build verde sin endpoints, smoke test verde, `init.ps1` exit 0. Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/astro.config.mjs`, `frontend-astro/package.json`, `frontend-astro/package-lock.json`, `frontend-astro/eslint.config.js`, `frontend-astro/tsconfig.json`, `frontend-astro/tests/smoke.test.ts`, `.gitignore`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 2 `lib_persona_and_tarot` (capa de dominio: `lib/persona.ts` + `lib/tarot.ts`). Deuda fuera de scope: `eslint.config.js` importa `globals` sin declararlo como devDependency explícita, y `npm run lint` deja 3 errores en scaffold preexistente (`mini-oraculo.astro`, `zoltar.astro`).

## 2026-05-29 — feature 2 lib_persona_and_tarot

- **Veredicto:** done
- **Resumen:** Capa de dominio pura: `lib/persona.ts` (exporta `PERSONA_BASE` + `buildSystemPrompt(opts)`, derivado de PERSONA.md con género masculino y tono cómplice cínico) y `lib/tarot.ts` (constante `ARCANOS` con los 22 arcanos cibernéticos, idénticos carácter por carácter al canon del PHP en `legacy/`). Cero imports de HTTP/Astro/Gemini. `.\init.ps1` verde: 3 test files, 11 tests passing. Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/src/lib/persona.ts`, `frontend-astro/src/lib/tarot.ts`, `frontend-astro/tests/lib/persona.test.ts`, `frontend-astro/tests/lib/tarot.test.ts`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 3 `lib_gemini_wrapper` (wrapper único de Gemini en `lib/gemini.ts`, mockeable desde tests, lee API key de `import.meta.env.GEMINI_API_KEY`). Deuda heredada de feature 1 aún abierta (lint en scaffold preexistente).

## 2026-05-29 — feature 3 lib_gemini_wrapper

- **Veredicto:** done
- **Resumen:** Wrapper único de Gemini en `lib/gemini.ts`: `generate(prompt, opts)` encapsula el SDK `@google/genai` (`GoogleGenAI` → `models.generateContent`), lee la key solo de `import.meta.env.GEMINI_API_KEY` (error descriptivo si falta, antes de instanciar el SDK) y soporta opts model/systemInstruction/temperature/maxOutputTokens. SDK mockeado con `vi.mock()`; ningún otro archivo de src importa el SDK. `.\init.ps1` verde: 4 test files, 21 tests passing (10 nuevos). Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/src/lib/gemini.ts`, `frontend-astro/tests/lib/gemini.test.ts`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 4 `endpoint_morpheus_quotes` (GET `/api/morpheus-quotes`: array fijo de frases tipo Morpheus, sin Gemini; primer smoke del setup Vercel). Deuda heredada de feature 1 aún abierta (lint en scaffold preexistente).

## 2026-05-29 — feature 4 endpoint_morpheus_quotes

- **Veredicto:** done (smoke curl del dueño pendiente — no bloqueante)
- **Resumen:** Endpoint estático `GET /api/morpheus-quotes` (`export const GET: APIRoute`, try/catch, `Response` 200 `application/json`) que devuelve `MORPHEUS_QUOTES`, las 8 frases tipo Morpheus copiadas byte-a-byte del canon PHP (`TarotController.php::morpheusQuotes()`). Sin Gemini, sin `lib/`. `.\init.ps1` verde: 5 test files, 24 tests passing. Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/src/pages/api/morpheus-quotes.ts`, `frontend-astro/tests/pages/api/morpheus-quotes.test.ts`.
- **Pendiente de dueño:** smoke con curl. Comando exacto del informe del implementer:
  ```powershell
  npm run dev --prefix frontend-astro
  # en otra terminal:
  curl http://localhost:4321/api/morpheus-quotes
  ```
  Esperado: HTTP 200, `Content-Type: application/json`, array JSON de 8 strings empezando por "La Matrix está en todas partes...".
- **Notas para la próxima sesión:** La siguiente feature pending es la 5 `endpoint_tirada` (GET `/api/tirada`: selecciona 3 arcanos al azar sin reemplazo de `lib/tarot.ts`; solo lógica de dominio, sin Gemini). Deuda heredada de feature 1 aún abierta (lint en scaffold preexistente).

## 2026-05-29 — feature 5 endpoint_tirada

- **Veredicto:** done
- **Resumen:** Endpoint `GET /api/tirada` que devuelve 3 arcanos distintos (sin reemplazo) tomados de `ARCANOS` (lib/tarot.ts) vía barajado parcial Fisher-Yates sobre copia + `slice(0,3)`. Sin Gemini, solo lógica de dominio. Tests verdes (cardinalidad 3 + unicidad sobre 100 ejecuciones). Aprobado por reviewer.
- **Archivos tocados:** frontend-astro/src/pages/api/tirada.ts, frontend-astro/tests/pages/api/tirada.test.ts
- **Notas:** lote paralelo (5,6,8)

## 2026-05-29 — feature 6 endpoint_pregunta

- **Veredicto:** done (smoke curl + clave real del dueño pendiente — no bloqueante)
- **Resumen:** Endpoint `POST /api/pregunta` que recibe `{ pregunta: string }`, arma el system prompt con `buildSystemPrompt` (lib/persona) y genera la respuesta del Gurú vía `generate` (lib/gemini). Validación 400 (falta/no-string/vacío/body no-JSON), 502 si Gemini falla, 500 inesperado; mensajes neutros sin filtrar internals. 7 tests verdes con `vi.mock()` del wrapper. Aprobado por reviewer.
- **Archivos tocados:** frontend-astro/src/pages/api/pregunta.ts, frontend-astro/tests/pages/api/pregunta.test.ts
- **Pendiente de dueño:** smoke curl con clave real:
  ```bash
  npm run dev --prefix frontend-astro
  curl -X POST http://localhost:4321/api/pregunta \
    -H "Content-Type: application/json" \
    -d '{"pregunta": "¿voy a triunfar en redes?"}'
  ```
- **Notas:** lote paralelo (5,6,8)

## 2026-05-29 — feature 8 endpoint_wisdom_tweet

- **Veredicto:** done (smoke local del dueño pendiente — no bloqueante)
- **Resumen:** Endpoint `GET /api/wisdom-tweet` con `?tema=<x>` opcional; devuelve `{ tweet: string }` con length <= 280 (instrucción al prompt + truncado defensivo `truncateTweet`). Usa `buildSystemPrompt` + `generate`; 502 si Gemini falla, 500 inesperado, mensajes neutros. 7 tests verdes con `vi.mock()` del wrapper. NOTA: el implementer se cortó por error de socket antes de escribir su informe; el reviewer verificó que el código quedó íntegro (sin truncamiento, sin TODO/FIXME) y aprobó. NO existe progress/impl_endpoint_wisdom_tweet.md.
- **Archivos tocados:** frontend-astro/src/pages/api/wisdom-tweet.ts, frontend-astro/tests/pages/api/wisdom-tweet.test.ts
- **Pendiente de dueño:** smoke local
- **Notas:** lote paralelo (5,6,8)

## 2026-05-29 — feature 7 endpoint_reading

- **Veredicto:** done (smoke local del dueño pendiente — no bloqueante)
- **Resumen:** Endpoint `POST /api/reading` que sortea 3 arcanos distintos (sin reemplazo) de `lib/tarot` vía Fisher-Yates parcial y genera la interpretación en tono del Gurú con `buildSystemPrompt` (lib/persona) + `generate` (lib/gemini); devuelve `{ arcanos: [...3], interpretacion: string }`. 502 si Gemini falla, 500 inesperado, mensajes neutros. Tests mockean el wrapper `lib/gemini` y validan estructura, 3 arcanos distintos del canon y que viajan al system prompt. Aprobado por reviewer.
- **Archivos tocados:** frontend-astro/src/pages/api/reading.ts, frontend-astro/tests/pages/api/reading.test.ts
- **Notas:** lote paralelo (7,9,10)

## 2026-05-29 — feature 9 endpoint_fan_response

- **Veredicto:** done (smoke local del dueño pendiente — no bloqueante)
- **Resumen:** Endpoint `POST /api/fan-response` que recibe `{ mensaje: string, contexto?: string }` y responde en tono cómplice cariñoso. La marca §6 'fan emocionado → cómplice cariñoso' se inyecta vía el `task` del endpoint (no se hardcodea en el test) y se valida sobre el `systemInstruction` real que recibe `generate`. 400 input inválido, 502 Gemini caído, 500 inesperado; mensajes neutros. `lib/persona.ts` y `lib/gemini.ts` intactos. Aprobado por reviewer.
- **Archivos tocados:** frontend-astro/src/pages/api/fan-response.ts, frontend-astro/tests/pages/api/fan-response.test.ts
- **Notas:** lote paralelo (7,9,10)

## 2026-05-29 — feature 10 endpoint_create_image

- **Veredicto:** done
- **Resumen:** Endpoint `POST /api/create-image` que construye un prompt textual determinístico (sin Gemini) con la paleta canónica (morado, cyan, negro, neón rosa) y prohibición explícita de fotorrealismo y caras humanas completas (§8 PERSONA); devuelve `{ prompt: string }`. 400 input inválido, 500 con mensaje neutro. Tests validan presencia de palabras clave de paleta y restricciones. Aprobado por reviewer.
- **Archivos tocados:** frontend-astro/src/pages/api/create-image.ts, frontend-astro/tests/pages/api/create-image.test.ts
- **Notas:** lote paralelo (7,9,10). Con esto los 7 endpoints (4,5,6,7,8,9,10) están done; siguiente: feature 11 deploy_vercel_preview.
