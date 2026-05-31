# Implementación — feature 5: endpoint_tirada

## Estado
Implementada, tests verdes. Pendiente review del reviewer (NO marcada done).

## Archivos tocados
- `frontend-astro/src/pages/api/tirada.ts` (nuevo) — GET `APIRoute`. Baraja
  parcial Fisher-Yates sobre copia de `ARCANOS` (lib/tarot.ts), `slice(0,3)`,
  mapea a `{ nombre }`. Sin Gemini. try/catch + Response, 500 con mensaje
  neutro.
- `frontend-astro/tests/pages/api/tirada.test.ts` (nuevo) — 3 casos:
  - 200 + Content-Type application/json.
  - cardinalidad: exactamente 3, cada `nombre` pertenece a ARCANOS.
  - unicidad sobre 100 ejecuciones: Set de los 3 nombres tiene size 3.

## Acceptance (feature 5) cubierto
- [x] `src/pages/api/tirada.ts` implementa GET.
- [x] Devuelve 3 arcanos distintos cada vez (sin reemplazo).
- [x] `tests/pages/api/tirada.test.ts` valida cardinalidad 3 y unicidad sobre
      100 ejecuciones.

## Convenciones
2 espacios, comillas dobles, semicolons, kebab-case, try/catch + Response.
JSDoc en el handler. Importa solo de `lib/tarot` (dep permitida).

## Resultado de tests (aislado)
`npx vitest run tests/pages/api/tirada.test.ts` desde frontend-astro:
Test Files 1 passed (1) · Tests 3 passed (3).

## Notas
- No toqué feature_list.json, progress/current.md, package.json ni otros endpoints/lib.
- No corrí init.ps1 (compañeros con features a medias). El leader lo correrá al final.
