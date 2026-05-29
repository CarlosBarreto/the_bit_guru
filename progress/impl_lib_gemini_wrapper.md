# Informe de implementación — feature 3: lib_gemini_wrapper

- **Fecha:** 2026-05-29
- **Agente:** implementer
- **Feature:** 3 — Wrapper único de Gemini en `lib/gemini.ts`
- **Estado al cerrar:** implementada y autoverificada (NO marcada `done`; pendiente review)

## Archivos tocados

| Archivo | Acción |
|---|---|
| `frontend-astro/src/lib/gemini.ts` | **creado** — wrapper `generate(prompt, opts)` sobre `@google/genai` |
| `frontend-astro/tests/lib/gemini.test.ts` | **creado** — 10 tests, mockea el SDK con `vi.mock()` |
| `feature_list.json` | feature 3 → `in_progress` |
| `progress/current.md` | sesión actual + plan + notas |

## Modelo y parámetros por defecto (de dónde salen)

- **Default de modelo:** `gemini-2.0-flash`, exportado como `DEFAULT_MODEL`.
  - Fuente: `legacy/backend-php/app/Controllers/TarotController.php`. Es el
    modelo de **texto** canónico, usado en 4 de las 5 llamadas (pregunta,
    lectura, tweet, fan-response). La 5.ª (`gemini-2.5-flash-image-preview`)
    es de imagen y queda fuera de este wrapper de texto.
- **Parámetros opcionales** expuestos en `GenerateOptions`: `model`,
  `systemInstruction`, `temperature`, `maxOutputTokens`. Solo se añaden al
  `config` del SDK cuando se proporcionan (no se mandan claves `undefined`).
- **Decisión de diseño:** el PHP legacy metía toda la persona dentro del
  prompt de texto. El diseño nuevo separa la voz (`systemInstruction`, que
  los endpoints alimentarán desde `lib/persona.ts`) del prompt de tarea
  (`contents`). Esto respeta la arquitectura (capa de dominio cita la voz,
  no la redefine).

## Contrato del wrapper

- `generate(prompt: string, opts?: GenerateOptions): Promise<string>`
- Lee `import.meta.env.GEMINI_API_KEY`. **Nunca hardcodeada.**
- Si la key falta/vacía: lanza `Error` con mensaje descriptivo que nombra
  `GEMINI_API_KEY` y dónde configurarla (.env local / Vercel env var). No
  llega a instanciar el SDK.
- Mapea internamente: `ai.models.generateContent({ model, contents, config })`
  y devuelve `response.text`.
- Lanza `Error` descriptivo (con `cause`) si el SDK falla, y otro si la
  respuesta viene vacía/sin texto. No conoce HTTP/Astro (el mapeo a 502/500
  es responsabilidad de los endpoints — features futuras).

## Cómo se mockeó el SDK

- `vi.mock("@google/genai", ...)` reemplaza la clase `GoogleGenAI` por una
  fake cuyo `models.generateContent` es un `vi.fn()` (`generateContentMock`)
  y cuyo constructor registra sus opciones en `constructorMock`.
- La API key se inyecta con `vi.stubEnv("GEMINI_API_KEY", ...)` /
  `vi.unstubAllEnvs()` por test, para no depender del `.env` real.
- Los tests validan: API key pasada al constructor, modelo default
  (`gemini-2.0-flash`), override de modelo, `contents == prompt`, paso de
  `systemInstruction/temperature/maxOutputTokens`, ausencia de claves no
  provistas, retorno del texto, error por key ausente (sin llamar al SDK),
  error por fallo del SDK y error por respuesta vacía.

## Verificación

- `.\init.ps1` (Windows PowerShell) → **EXIT 0**. Test Files 4 passed (4),
  Tests **21 passed (21)** — 10 nuevos de gemini + 11 previos.
- `npx eslint src/lib/gemini.ts tests/lib/gemini.test.ts` → **0 errores**.
  (El `eslint .` global reporta errores **pre-existentes** en
  `pages/mini-oraculo.astro` y `pages/zoltar.astro`, fuera del scope de esta
  feature; lint no forma parte de `init.ps1`.)
- Grep confirmado: **ningún archivo bajo `frontend-astro/src/` importa
  `@google/genai`** salvo `lib/gemini.ts`. Single point of contact respetado.

## Acceptance (feature 3) — cobertura

- [x] `src/lib/gemini.ts` exporta `generate(prompt, opts)`.
- [x] Lee `import.meta.env.GEMINI_API_KEY`, nunca hardcodeada.
- [x] Error claro/descriptivo si la key no está definida.
- [x] `tests/lib/gemini.test.ts` mockea el SDK con `vi.mock()` y valida
      parámetros (modelo, prompt, opts).
- [x] Ningún otro archivo importa directamente `@google/genai`.

## Notas para el reviewer

- No marqué `done` ni moví nada a `history.md` (lo hace el líder tras review).
- No toqué endpoints (`pages/api/`) — son features 4+.
