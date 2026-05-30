# Review — feature 7 (`endpoint_reading`)

**Veredicto:** APPROVED

## Resumen
`frontend-astro/src/pages/api/reading.ts` + `frontend-astro/tests/pages/api/reading.test.ts`
cumplen el acceptance de la feature 7. Suite verde (5/5 en el test del endpoint;
63/63 en la suite completa, 11 archivos). Scope limpio: solo se tocaron esos 2
archivos (los otros untracked pertenecen a features 9/10 del lote paralelo).

## Acceptance
- [x] `reading.ts` implementa POST — `export const POST: APIRoute = async () => {...}` (línea 18).
- [x] Sortea 3 arcanos **distintos** de `lib/tarot` (Fisher-Yates parcial, líneas 20-25,
      `.slice(0, 3)` sin reemplazo).
- [x] Interpretación vía `buildSystemPrompt` de `lib/persona` (línea 33, pasa los 3 arcanos)
      + `generate` de `lib/gemini` (línea 37). No redefine el tono inline.
- [x] Devuelve `{ arcanos: [...3], interpretacion: string }` con 200 (líneas 54-60).
- [x] Test mockea el **wrapper** `lib/gemini` con `vi.mock()` (test líneas 10-12), NO el SDK.
      Valida 3 arcanos distintos del canon (líneas 45-55), estructura `interpretacion` string
      (líneas 35-43), varianza entre llamadas (57-65) y que los arcanos viajan al system prompt (67-82).
- [ ] Smoke local confirmado por el dueño — PENDIENTE DE DUEÑO (no es motivo de rechazo).
      Comando curl presente y correcto en `progress/impl_endpoint_reading.md` (POST a
      `http://localhost:4321/api/reading`).

## Arquitectura y convenciones
- [x] Capas: `pages/api/` → `lib/` (tarot, persona, gemini). Dirección correcta, sin import del SDK.
- [x] Sin `GEMINI_API_KEY` hardcodeada (la clave la lee `lib/gemini.ts` de `import.meta.env`).
- [x] Errores controlados: 502 cuando `generate` lanza (líneas 42-52, mensaje neutro,
      error crudo solo a `console.error`), 500 para lo inesperado (líneas 61-67).
      El test 502 confirma que no se filtra "503"/"Service Unavailable" (líneas 84-94).
- [x] Convenciones: archivo kebab-case, 2 espacios, comillas dobles, semicolons,
      JSDoc en el export. Sin TODOs/logs de debug sueltos (los `console.error` son
      manejo de error legítimo, sin payload con secretos).

## Checkpoints
- C1: [x]  (arnés completo; el `[FAIL]` de init.ps1 por 3 features in_progress es lote paralelo AUTORIZADO, no se usa su exit code como criterio)
- C2: [x]  (estado coherente dentro del lote autorizado; tests asociados presentes y verdes)
- C3: [x]  (módulo previsto en architecture.md; sin deps externas nuevas; sin debug/TODOs sueltos)
- C4: [x]  (test espejo en tests/pages/api/; Gemini mockeado en su frontera; suite verde 63/63)
- C5: [x]  (sin untracked sospechosos fuera de scope; feature 7 reflejada como in_progress)

## Cambios requeridos
Ninguno.

## Verificación
- `cd frontend-astro && npx vitest run tests/pages/api/reading.test.ts` => 5 passed (5).
- `cd frontend-astro && npx vitest run` => Test Files 11 passed (11) | Tests 63 passed (63).
- `init.ps1`: reporta `[FAIL] 3 features in_progress` por el lote paralelo autorizado (7,9,10).
  ESPERADO; verdor juzgado por vitest desde frontend-astro, no por exit code de init.ps1.
