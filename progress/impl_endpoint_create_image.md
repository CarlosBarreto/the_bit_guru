# Implementación — Feature 10: endpoint_create_image

Estado: implementada, tests verdes (pendiente review).

## Archivos tocados

- `frontend-astro/src/pages/api/create-image.ts` (nuevo)
- `frontend-astro/tests/pages/api/create-image.test.ts` (nuevo)

## Enfoque: determinístico (sin Gemini)

El endpoint construye el prompt visual **determinísticamente**, sin llamar a
`lib/gemini`. Razón: la paleta y las restricciones de §8 de PERSONA.md son
constantes no negociables; al construirlas en código se garantiza que SIEMPRE
estén presentes, sin depender de la red ni del modelo. Esto además evita el
requisito de smoke con `GEMINI_API_KEY` real (docs/verification.md §3, que solo
aplica a endpoints que llaman a Gemini).

`export const POST: APIRoute`. Body opcional `{ escena?: string }`:
- Si llega `escena` (string no vacío) → se incrusta en el prompt.
- Si no llega → escena por defecto (Gurú leyendo tarot cibernético).
- El output es `{ prompt: string }` — un prompt de imagen, NO una imagen.

## Cómo se garantiza paleta + restricciones

Dos constantes módulo-nivel que se concatenan SIEMPRE al prompt:

- `PALETA_CANONICA`: "morado profundo (#3a0ca3), cyan eléctrico (#00f0ff),
  negro (#000000), acentos de neón rosa (#ff2bd6)" — términos canónicos §8 +
  hex aproximados.
- `RESTRICCIONES`: prohíbe explícitamente "el fotorrealismo" y las "caras
  humanas completas" ("Nunca un humano realista", rostro oculto/capucha, ojos
  brillantes no humanos).

Como la escena del cliente es la única parte variable, las restricciones y la
paleta no pueden perderse aunque cambie la escena (cubierto por test).

## Manejo de errores (docs/conventions.md)

- 400 si `escena` viene pero no es string.
- 400 si el body declara `Content-Type: application/json` pero es JSON inválido.
- 200 con escena por defecto si no hay body.
- 500 con mensaje neutro ("Error interno"), sin filtrar `error.message` crudo;
  el detalle se loguea con `console.error`.

## Tests (8, todos verdes)

`cd frontend-astro && npx vitest run tests/pages/api/create-image.test.ts`
→ Test Files 1 passed (1) · Tests 8 passed (8).

Cubren: 200 + Content-Type; presencia de morado/cyan/negro/neón rosa;
prohibición de fotorrealismo; prohibición de caras humanas completas;
incrustación de escena del cliente (manteniendo restricciones); escena default;
400 escena no-string; 400 JSON inválido.

## Notas para el reviewer

- No mockeé `lib/gemini` porque el endpoint no lo usa (construcción
  determinística). Conforme a conventions.md: el mock solo se exige cuando el
  test toca Gemini.
- No toqué `feature_list.json`, `progress/current.md`, `package.json` ni lib/.
