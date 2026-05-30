# Implementación feature 6 — endpoint_pregunta

## Resumen
Endpoint `POST /api/pregunta` que recibe `{ pregunta: string }`, arma el system
prompt con `buildSystemPrompt` (lib/persona) y genera la respuesta del Gurú vía
`generate` (lib/gemini). Patrón calcado de `wisdom-tweet.ts`.

## Archivos tocados
- `frontend-astro/src/pages/api/pregunta.ts` (nuevo) — handler `export const POST: APIRoute`.
- `frontend-astro/tests/pages/api/pregunta.test.ts` (nuevo) — 7 tests con `vi.mock()` del wrapper `lib/gemini`.

## Decisiones de scope
- Validación de input: 400 si falta `pregunta`, no es string, o es string vacío/solo espacios. También 400 si el body no es JSON parseable.
- Manejo de errores per docs/conventions.md:
  - 400 input inválido (validación local).
  - 502 cuando `generate` lanza (Gemini caído/respuesta vacía); mensaje neutro, NO se filtra `error.message` crudo (test lo verifica con cadena secreta).
  - 500 para lo inesperado, mensaje neutro "Error interno".
- Mock: se mockea el WRAPPER `lib/gemini` (no el SDK), según convención. Se valida que `systemInstruction` contiene marcas de persona ("El Gurú de Bits", "CÓMPLICE CÍNICO") y que la pregunta viaja en el prompt.
- Respuesta 200: `{ respuesta: string }`.

## Resultado de tests
`npx vitest run tests/pages/api/pregunta.test.ts`:
- Test Files 1 passed (1)
- Tests 7 passed (7)

## Smoke local sugerido (lo ejecuta el DUEÑO con clave real)
Levantar dev server y golpear el endpoint:

```bash
npm run dev --prefix frontend-astro
```

```bash
curl -X POST http://localhost:4321/api/pregunta \
  -H "Content-Type: application/json" \
  -d '{"pregunta": "¿voy a triunfar en redes?"}'
```

Verificar que la respuesta tenga tono PERSONA.md (cómplice cínico, ácido, breve;
no motivacional/wellness/tech-bro). Caso 400 esperado:

```bash
curl -X POST http://localhost:4321/api/pregunta \
  -H "Content-Type: application/json" \
  -d '{}'
# -> 400 { "error": "Falta 'pregunta' o no es un texto válido." }
```

## Notas
- No toqué `feature_list.json`, `progress/current.md`, `package.json`, lib/, ni
  otros endpoints.
- Acceptance "smoke local con clave real confirmado por el dueño": pendiente del
  dueño, no es bloqueo de implementación.
