# Review — feature 6 (endpoint_pregunta)

**Veredicto:** APPROVED

## Resumen
Endpoint `POST /api/pregunta` implementado en
`frontend-astro/src/pages/api/pregunta.ts` con test espejo en
`frontend-astro/tests/pages/api/pregunta.test.ts`. Cumple acceptance,
arquitectura y convenciones. Suite verde.

## Verificación contra acceptance (feature_list.json id 6)
- [x] `pregunta.ts` implementa POST: `export const POST: APIRoute` (línea 14).
- [x] Recibe `{ pregunta: string }`, usa `buildSystemPrompt` (lib/persona, línea 46)
      + `generate` (lib/gemini, línea 50). Sin redefinir tono inline.
- [x] Valida input → 400: falta `pregunta`, no es string, o string vacío/espacios
      (líneas 29-38); además 400 si el body no es JSON parseable (líneas 17-27).
      Tests del 400 presentes: falta pregunta, no-string, string vacío, body no-JSON.
- [x] Test mockea el WRAPPER `lib/gemini` con `vi.mock()` (no el SDK), líneas 10-12,
      y valida que el system prompt incluye marcas de persona
      ("El Gurú de Bits", "CÓMPLICE CÍNICO") y que la pregunta viaja en el prompt
      (test "pasa a generate un system prompt con las marcas de persona").
- [ ] "Smoke local con curl + clave real confirmado por el dueño"
      → PENDIENTE DE DUEÑO (no es bloqueo). El informe dejó el comando curl
      (impl_endpoint_pregunta.md, secciones smoke 200 y 400).

## Manejo de errores (docs/conventions.md)
- [x] 400 input inválido (validación local).
- [x] 502 cuando `generate` lanza (Gemini caído/respuesta vacía), mensaje neutro.
- [x] 500 para lo inesperado, mensaje neutro "Error interno".
- [x] NO filtra `error.message` crudo: el error se loguea con `console.error`
      y al cliente va mensaje neutro. Test verifica que ni "503" ni
      "Service Unavailable" aparecen en la respuesta 502.

## Arquitectura (docs/architecture.md)
- [x] Capa correcta: `pages/api/` valida, llama a `lib/`, formatea Response.
      Dependencias `pages/` → `lib/` (persona, gemini). Nunca al revés.
- [x] No hardcodea GEMINI_API_KEY (la maneja lib/gemini vía import.meta.env).
- [x] No I/O fuera de lib/gemini; el endpoint solo orquesta.
- [x] Sin imports fuera de la lista permitida.

## Convenciones (docs/conventions.md)
- [x] Archivo kebab-case (`pregunta.ts`).
- [x] 2 espacios, semicolons, comillas dobles.
- [x] Test `*.test.ts` espejo de ruta (`tests/pages/api/pregunta.test.ts`).
- [x] JSDoc en el handler exportado; comentarios mínimos y con porqué.

## Scope tocado
- [x] Solo `frontend-astro/src/pages/api/pregunta.ts` +
      `frontend-astro/tests/pages/api/pregunta.test.ts`.
      Los demás untracked (tirada, wisdom-tweet) pertenecen al lote paralelo
      features 5 y 8, fuera del scope de esta review.

## Tests (criterio = vitest, NO init.ps1)
- [x] `npx vitest run tests/pages/api/pregunta.test.ts` → 7 passed (7).
- [x] Suite completa `npx vitest run` → 8 files, 41 passed (41). Verde.

Nota: `init.ps1` reporta `[FAIL] Hay 3 features en in_progress (maximo 1)`,
esperado por el lote paralelo autorizado (5, 6, 8). No es motivo de rechazo.

## Cambios requeridos
Ninguno.
