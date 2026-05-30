# Impl — feature 9: endpoint_fan_response

Estado: implementada, tests verdes (pendiente review + smoke del dueño).

## Archivos tocados

- `frontend-astro/src/pages/api/fan-response.ts` (nuevo) — endpoint `POST` (APIRoute).
- `frontend-astro/tests/pages/api/fan-response.test.ts` (nuevo) — 9 tests Vitest.

No se tocó `lib/`, `feature_list.json`, `progress/current.md`, `package.json`, ni otros endpoints.

## Contrato

- Body: `{ mensaje: string, contexto?: string }`.
- 400 si falta `mensaje` / no es string / string vacío / body no-JSON.
- 200 `{ respuesta: string }` en éxito.
- 502 si Gemini falla (mensaje neutro, sin filtrar `error.message` crudo).
- 500 para lo inesperado (mensaje neutro).
- `contexto` se incorpora al prompt solo si viene (string no vacío).

## Cómo logré la marca §6

`buildSystemPrompt({ task })` concatena el `task` verbatim al `PERSONA_BASE`
(ver `lib/persona.ts` líneas 47-58). NO modifiqué `lib/persona.ts`. El endpoint
pasa en el `task` la cadena literal:

> "Llega un fan emocionado. Regla §6 de la persona: fan emocionado → cómplice cariñoso: ..."

Por tanto el system prompt resultante contiene exactamente
`fan emocionado → cómplice cariñoso`, y el test lo valida con
`expect(opts.systemInstruction).toContain("fan emocionado → cómplice cariñoso")`.
La marca es alcanzable sin tocar `lib/persona.ts`. Sin bloqueo.

## Tests (mock del wrapper, no del SDK)

`vi.mock("../../../src/lib/gemini")` mockea `generate`. Cobertura:
- 200 + Content-Type JSON + respuesta string no vacía.
- system prompt contiene la marca §6 + PERSONA_BASE ("El Gurú de Bits", "CÓMPLICE CÍNICO").
- contexto incorporado al prompt cuando viene.
- contexto ausente no rompe (sin "Contexto adicional").
- 400 x4 (falta mensaje / no string / vacío / no-JSON), sin llamar a generate.
- 502 sin filtrar "503" ni "Service Unavailable".

Resultado: `Test Files 1 passed (1)`, `Tests 9 passed (9)`.

Comando usado (desde frontend-astro):
`npx vitest run tests/pages/api/fan-response.test.ts`

## Smoke sugerido (lo ejecuta el DUEÑO con GEMINI_API_KEY real)

```bash
npm run dev --prefix frontend-astro
curl -X POST http://localhost:4321/api/fan-response \
  -H "Content-Type: application/json" \
  -d '{"mensaje": "Gurú eres lo máximo, cambiaste mi forma de ver las redes", "contexto": "lleva semanas comentando todas mis lecturas"}'
```
Verificar tono cómplice cariñoso (no Coach Genérico AI).
