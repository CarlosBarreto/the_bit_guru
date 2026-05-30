# Review — feature 10 (endpoint_create_image)

**Veredicto:** APPROVED

## Acceptance (feature 10)
- [x] `frontend-astro/src/pages/api/create-image.ts` implementa POST
      (`export const POST: APIRoute`, línea 45).
- [x] El endpoint NO genera imagen: devuelve `{ prompt: string }` (línea 81).
      No hay fetch/descarga ni llamada a `lib/gemini`. Construcción determinística.
- [x] El prompt incluye la paleta canónica: morado, cyan, negro, neón rosa
      (`PALETA_CANONICA`, líneas 19-24; incrustada en `buildImagePrompt`, línea 39).
- [x] El prompt prohíbe explícitamente fotorrealismo y caras humanas completas
      (`RESTRICCIONES`, líneas 27-30 — "Prohibido el fotorrealismo",
      "Prohibidas las caras humanas completas", "Nunca un humano realista").
      Alineado con PERSONA.md §8.
- [x] Tests validan presencia de palabras clave de paleta Y de las restricciones
      (test: morado/cyan/negro/neón rosa líneas 32-40; fotorrealismo 42-48;
      caras humanas completas 50-56; restricciones persisten con escena del
      cliente 58-66).

## Convenciones (docs/conventions.md)
- [x] Archivo TS kebab-case (`create-image.ts`), test espejo en
      `tests/pages/api/create-image.test.ts`.
- [x] 2 espacios, comillas dobles, semicolons.
- [x] Constantes módulo-nivel en UPPER_SNAKE (`PALETA_CANONICA`,
      `RESTRICCIONES`, `ESCENA_DEFAULT`).
- [x] Errores: 400 input inválido (escena no-string, línea 64; JSON inválido,
      línea 52), 500 con mensaje neutro "Error interno" (línea 87) — NO se
      filtra `error.message` crudo; el detalle va a `console.error` interno
      (línea 86). Conforme a §Manejo de errores y a architecture §"Sin secretos
      en logs" (el endpoint nunca toca la API key).
- [x] Determinístico ⇒ no usa `lib/gemini` ⇒ no requiere `vi.mock`. Conforme a
      §Tests (el mock solo se exige cuando el test toca Gemini).

## Arquitectura (docs/architecture.md)
- [x] Endpoint en `pages/api/`, capa de entrada. No viola la regla de
      dependencias `pages/ -> lib/ -> utils/`.
- [x] Sin dependencias externas nuevas (solo `import type { APIRoute }`).
- [x] No hardcodea `GEMINI_API_KEY` (no la usa).

## Alcance
- [x] Solo tocó `frontend-astro/src/pages/api/create-image.ts` +
      `frontend-astro/tests/pages/api/create-image.test.ts`.
- [x] No tocó `lib/`, ni otros endpoints, ni `package.json`. (Los demás
      untracked — reading/fan-response — pertenecen a features 7 y 9 del lote
      paralelo, fuera de este review.)

## Verificación
- [x] `cd frontend-astro && npx vitest run tests/pages/api/create-image.test.ts`
      → Test Files 1 passed (1) · Tests 8 passed (8).
- [x] Suite completa desde frontend-astro: Test Files 11 passed · Tests 63
      passed. Verde.

## Nota de coordinación
`init.ps1` reporta `[FAIL] 3 features en in_progress`: estado ESPERADO del lote
paralelo autorizado (7, 9, 10). NO es motivo de rechazo para feature 10.

## Cambios requeridos
Ninguno.
