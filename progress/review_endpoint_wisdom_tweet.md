# Review — feature 8 (endpoint_wisdom_tweet)

**Veredicto:** APPROVED

> Nota de coordinación: `init.ps1` reporta `[FAIL] Hay 3 features en in_progress`
> por el lote paralelo autorizado (5, 6, 8). Ese fallo es ESPERADO y no es
> motivo de rechazo. El verdor se juzgó corriendo Vitest directamente.

## Verificación de no-truncamiento (corte de socket del implementer)

El implementer se cortó ANTES de escribir `progress/impl_endpoint_wisdom_tweet.md`
(no existe), pero el código quedó completo:

- `frontend-astro/src/pages/api/wisdom-tweet.ts` (82 líneas): imports completos,
  `truncateTweet` cierra correctamente (líneas 22-33), `export const GET`
  cierra con `};` (línea 82). Sin código a medias, sin TODO/FIXME colgando.
- `frontend-astro/tests/pages/api/wisdom-tweet.test.ts` (84 líneas): `describe`
  cierra en línea 84 con `});`. 7 `it` completos.
- Grep de `TODO|FIXME|XXX|console.log` en el endpoint: sin coincidencias.

No hay evidencia de truncamiento. Ambos archivos están íntegros.

## Acceptance de la feature 8

- [x] Implementa GET — `export const GET: APIRoute` (línea 35).
- [x] Soporta `?tema=<x>` opcional — lee `url.searchParams.get("tema")`
      (línea 37); test "incorpora ?tema al prompt" (test líneas 59-67) confirma
      que el tema entra tanto al `prompt` como a `systemInstruction`.
- [x] Devuelve `{ tweet: string }` con length <= 280 — garantía doble:
      instrucción al prompt ("280 caracteres como máximo", línea 41) + truncado
      defensivo `truncateTweet` (líneas 22-33, aplicado en línea 69).
      Tests de longitud: "nunca excede 280" (líneas 37-41) y "trunca
      defensivamente cuando Gemini se pasa" con input ~480 chars (líneas 43-49).
- [x] Usa `buildSystemPrompt` (lib/persona) + `generate` (lib/gemini) —
      imports líneas 2-3, uso líneas 48 y 52.
- [x] Tests mockean `lib/gemini` con `vi.mock()` (el wrapper, NO el SDK) —
      `vi.mock("../../../src/lib/gemini", ...)` (línea 9). El SDK `@google/genai`
      no se mockea.
- [ ] Smoke local confirmado por el dueño — PENDIENTE-DE-DUEÑO. Checkpoint
      humano, NO motivo de rechazo (per protocolo).

## Manejo de errores (docs/conventions.md)

- [x] 502 cuando Gemini falla, envuelto en try/catch sobre `generate`
      (líneas 51-67). El test "devuelve 502 sin filtrar el error crudo"
      (líneas 75-83) confirma que el body NO contiene "503" ni
      "Service Unavailable" del Error interno: solo mensaje neutro
      ("El Gurú no respondió. Intenta de nuevo.").
- [x] 500 para el resto, en catch externo (líneas 75-81), body neutro
      ("Error interno"). El detalle crudo solo va a `console.error`.

## Convenciones (docs/conventions.md)

- [x] Archivo kebab-case (`wisdom-tweet.ts`, `wisdom-tweet.test.ts`).
- [x] Indentación 2 espacios, sin tabs.
- [x] Comillas dobles para strings.
- [x] Semicolons presentes.
- [x] Test espeja la ruta de src (`tests/pages/api/` ↔ `src/pages/api/`).
- [x] `console.error` (no `console.log` de debug); loguea internamente sin
      filtrar API key ni payload sensible (cumple "sin secretos en logs").

## Arquitectura (docs/architecture.md)

- [x] Capa correcta: `pages/api/` → `lib/`. No importa el SDK directamente
      (cumple "único cliente de modelo = lib/gemini.ts").
- [x] No redefine el tono inline: consume `buildSystemPrompt`.
- [x] No hardcodea `GEMINI_API_KEY` (delegado a `lib/gemini.ts`).
- [x] Sin dependencias externas nuevas.

## Tests (ejecución real, NO init.ps1)

- Suite del endpoint: `npx vitest run tests/pages/api/wisdom-tweet.test.ts`
  → 7 passed (7).
- Suite completa: `npx vitest run` → 41 passed (41), 8 files. Todo verde.

## Checkpoints (alcance de esta feature)

- C3 (código respeta arquitectura): [x] para wisdom-tweet.
- C4 (verificación real): [x] test por módulo, Gemini mockeado en su frontera
      (el wrapper), > 0 tests verdes.

## Cambios requeridos

Ninguno. Queda pendiente únicamente el smoke local del dueño (checkpoint
humano), que no bloquea la aprobación del código.
