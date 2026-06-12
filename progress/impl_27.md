# impl_27 — fix_gemini_model_deprecated

## Tarea
Feature #27: el modelo por defecto `gemini-2.0-flash` devuelve 404 NOT_FOUND
(Google lo retiró para `generateContent`). Reemplazo verificado por el leader:
`gemini-2.5-flash` (generateContent 200).

## Archivos tocados
1. `frontend-astro/src/lib/gemini.ts`
   - `DEFAULT_MODEL`: `"gemini-2.0-flash"` -> `"gemini-2.5-flash"`.
   - Comentario JSDoc del modelo (lineas ~15-22) reescrito: el modelo VIGENTE es
     `gemini-2.5-flash`; la referencia al PHP legacy se mantiene como historica
     pero se aclara que Google retiro 2.0-flash en 2026-06 (404 NOT_FOUND) y ya
     no es el canonico vigente. Sin emojis.
2. `frontend-astro/tests/lib/gemini.test.ts`
   - Test del modelo por defecto.

## Asserts exactos ajustados

Test "usa el modelo por defecto" (antes "...coherente con el legacy PHP"):
```
// antes
expect(DEFAULT_MODEL).toBe("gemini-2.0-flash");
expect(call.model).toBe("gemini-2.0-flash");
// despues
expect(DEFAULT_MODEL).toBe("gemini-2.5-flash");
expect(call.model).toBe("gemini-2.5-flash");
```
(Titulo del `it` actualizado a "usa el modelo por defecto vigente (gemini-2.5-flash)".)

Test "permite sobreescribir el modelo via opts" — para no perder la cobertura
de "override != default" (antes el override era 2.5-flash, que ahora coincide
con el nuevo default y volveria tautologico el assert), el override pasa a
`gemini-2.0-flash` y se agrega un assert explicito:
```
// antes
await generate("hola", { model: "gemini-2.5-flash" });
expect(call.model).toBe("gemini-2.5-flash");
// despues
await generate("hola", { model: "gemini-2.0-flash" });
expect(call.model).toBe("gemini-2.0-flash");
expect(call.model).not.toBe(DEFAULT_MODEL);
```

Sin cambios en el resto del archivo: el wrapper sigue mockeando la SDK
(`vi.mock("@google/genai")`), no hay llamadas reales.

## Conteo de tests
- Antes: 532 passed / 40 files.
- Despues: 532 passed / 40 files. (Mismo conteo; solo cambian valores esperados.)

## Verificacion
- `init.ps1`: exit 0. Tests 532 passed (40 files). [OK] Entorno listo.
- `npm run build --prefix frontend-astro`: verde. "Server built in 6.26s — Complete!".
- Smoke contra Gemini real: NO ejecutado (lo re-verifica el leader con la key).

## Estado
Feature #27 se deja `in_progress` (no marcada `done`).
