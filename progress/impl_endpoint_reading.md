# Implementación — feature 7 (`endpoint_reading`)

## Estado
Implementada, tests verdes. Pendiente review + smoke del dueño.

## Archivos tocados
- `frontend-astro/src/pages/api/reading.ts` (nuevo) — `export const POST: APIRoute`.
- `frontend-astro/tests/pages/api/reading.test.ts` (nuevo).
- `progress/impl_endpoint_reading.md` (este informe).

## Qué hace
- Sortea 3 arcanos distintos de `ARCANOS` (lib/tarot) sin reemplazo, vía
  barajado parcial de Fisher-Yates (mismo patrón que `tirada.ts`).
- Construye el system prompt con `buildSystemPrompt({ task, arcanos })` de
  lib/persona (pasa los 3 arcanos) y genera la interpretación con `generate`
  de lib/gemini. No redefine el tono inline.
- Devuelve `{ arcanos: [...3], interpretacion: string }` con status 200.
- Errores: 502 si Gemini falla (mensaje neutro, error crudo solo a
  `console.error`), 500 para lo inesperado. Nunca filtra `error.message`.

## Tests (mockean `lib/gemini.ts` con `vi.mock`, no el SDK)
1. 200 con `{ arcanos, interpretacion }` + Content-Type application/json.
2. Sortea exactamente 3 arcanos distintos, todos del canon `ARCANOS`.
3. Varía la tirada entre 20 llamadas (no siempre la misma).
4. El system prompt incluye marcas de persona ("El Gurú de Bits",
   "CÓMPLICE CÍNICO") y los 3 arcanos sorteados.
5. 502 sin filtrar el error crudo cuando Gemini falla.

## Resultado de la verificación
Corrido desde `frontend-astro/` (no desde la raíz):
```
cd frontend-astro && npx vitest run tests/pages/api/reading.test.ts
=> Test Files 1 passed (1) | Tests 5 passed (5)
```

## Smoke sugerido (lo ejecuta el DUEÑO con GEMINI_API_KEY real)
```bash
npm run dev --prefix frontend-astro
curl -X POST http://localhost:4321/api/reading \
  -H "Content-Type: application/json"
# Esperado: { "arcanos": ["...","...","..."], "interpretacion": "..." }
# Verificar tono de PERSONA.md (ácido, cómplice cínico; no motivacional/wellness).
```

## Notas de scope
- No toqué `feature_list.json`, `progress/current.md`, `package.json`, ni lib/,
  ni otros endpoints. Solo los 3 archivos listados arriba.
