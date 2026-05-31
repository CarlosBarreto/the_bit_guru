# Review — feature 3 (lib_gemini_wrapper)

**Veredicto:** APPROVED

**Fecha:** 2026-05-29
**Agente:** reviewer
**Archivos revisados:**
- `frontend-astro/src/lib/gemini.ts` (creado)
- `frontend-astro/tests/lib/gemini.test.ts` (creado)
- `feature_list.json` (feature 3 → in_progress)
- `progress/current.md`, `progress/impl_lib_gemini_wrapper.md`

---

## Acceptance de la feature 3

- [x] `src/lib/gemini.ts` exporta `generate(prompt, opts)` — `gemini.ts:49-52`
      (`export async function generate(prompt, opts = {}): Promise<string>`).
- [x] Lee la key SOLO de `import.meta.env.GEMINI_API_KEY` — `gemini.ts:53`.
      No hay otra fuente.
- [x] Error claro/descriptivo si la key falta — `gemini.ts:54-59`: lanza
      `Error` que nombra `GEMINI_API_KEY` y dónde configurarla (.env / Vercel),
      ANTES de instanciar el SDK. Cubierto por test `gemini.test.ts:84-88`
      (valida `rejects.toThrow(/GEMINI_API_KEY/)` y que el SDK NO se llamó).
- [x] `tests/lib/gemini.test.ts` mockea el SDK con `vi.mock()` — `gemini.test.ts:10-19`
      y valida parámetros pasados: apiKey al constructor (l.35-38), modelo
      default (l.40-45), prompt como `contents` (l.47-51), override de modelo
      (l.53-57), system/temperature/maxOutputTokens (l.59-69), ausencia de
      claves no provistas (l.71-77), retorno de texto (l.79-82), error de SDK
      (l.90-93) y respuesta vacía (l.95-98). 10 tests.

## Restricciones de arquitectura (crítico)

- [x] **`@google/genai` solo se importa en `lib/gemini.ts`.** Grep en todo el
      repo (`frontend-astro/`) por `@google/genai`:
      - `src/lib/gemini.ts:13` → `import { GoogleGenAI } from "@google/genai";`
        (ÚNICO import real de código fuente). ✅
      - `tests/lib/gemini.test.ts:10` → `vi.mock("@google/genai", ...)` —
        declaración de mock requerida por las convenciones; NO es un import de
        producción que rompa el single-point-of-contact. ✅
      - `package.json:16` y `package-lock.json` → declaración de dependencia
        (esperado, listado en architecture.md como dep permitida). ✅
      - Las líneas 2/4 de `gemini.ts` son comentarios JSDoc. ✅
      Conclusión: ningún otro archivo de `src/` o `tests/` importa el SDK.
- [x] **No hardcodear `GEMINI_API_KEY`.** Grep en todo el repo por patrón de
      clave Google (`AIza...`): **0 coincidencias**. Solo se lee de
      `import.meta.env`.
- [x] `lib/gemini.ts` NO importa HTTP/Astro/Response. Grep por
      `astro|Response|fetch|http`: solo aparecen en comentarios (l.8) y strings
      (l.56), más `response` como variable local (l.74,76,90). Sin imports de
      HTTP ni Astro. Respeta la capa de dominio.
- [x] Fuera de scope: NO se tocaron endpoints (`pages/api/`). Confirmado por
      git status (solo `lib/gemini.ts` + su test).

## Convenciones

- [x] `camelCase` en funciones (`generate`), `PascalCase` en interfaces
      (`GenerateOptions`), `UPPER_SNAKE` en constante (`DEFAULT_MODEL`).
- [x] Archivo TS en `kebab-case` simple (`gemini.ts`).
- [x] 2 espacios, semicolons, comillas dobles. Verificado en ambos archivos.
- [x] JSDoc en lo exportado de `lib/` (`generate`, `GenerateOptions`,
      `DEFAULT_MODEL`) — cruza capas, requisito de conventions.md §doc.
- [x] Test espejo de la ruta: `src/lib/gemini.ts` → `tests/lib/gemini.test.ts`.
- [x] `describe` + `it` + `expect`. Mock del SDK en su frontera con `vi.mock()`.
- [x] Dominio lanza `Error` con mensaje descriptivo, no conoce HTTP
      (conventions.md §errores). Usa `cause` para propagar el fallo del SDK.

## Verificación (`.\init.ps1`)

- [x] **EXIT 0 (verde).** Test Files 4 passed (4), Tests **21 passed (21)**
      — 10 nuevos de gemini + 11 previos. Sin tests rojos.

---

## Checkpoints

- C1: [x]  Arnés completo; init.ps1 exit 0.
- C2: [x]  Solo feature 3 en `in_progress`; current.md describe la sesión activa.
- C3: [x]  `lib/gemini.ts` es módulo previsto en architecture.md; sin deps no
           justificadas (`@google/genai` está en la lista permitida); sin logs
           de debug ni TODOs sueltos.
- C4: [x]  Test por módulo (`gemini.test.ts`); SDK mockeado en su frontera;
           21 tests verdes (> 0).
- C5: [x]  Sin archivos temporales/build sospechosos. `docs/design/` untracked
           es un working dir adicional ajeno a esta feature (no es ruido de la
           feature). Estado de feature 3 correcto: `in_progress` (NO `done`,
           pendiente cierre por el líder tras este APPROVED).

## Cambios requeridos

(ninguno)

## Notas para el líder

- La feature NO incluye smoke con Gemini real (verification.md §3 solo lo exige
  para endpoints que llaman a Gemini; este wrapper no es endpoint). Procede
  cierre normal.
- `progress/history.md` debe recibir entrada de cierre al marcar `done`
  (responsabilidad del líder, fuera del trabajo del implementer).
