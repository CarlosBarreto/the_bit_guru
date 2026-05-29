# progress/history.md — Bitácora append-only

> Cada sesión cerrada deja aquí una entrada. No se edita el pasado, solo se
> añade al final.

---

<!--
Plantilla de entrada (copiar al cerrar sesión):

## YYYY-MM-DD — feature <id> <name>

- **Veredicto:** done | blocked
- **Resumen:** (1-3 líneas)
- **Archivos tocados:** lista breve
- **Notas para la próxima sesión:** (si las hay)

---
-->

## 2026-05-29 — feature 1 setup_astro_unified

- **Veredicto:** done
- **Resumen:** Astro habilitado en modo SSR (`output: 'server'`) con adapter `@astrojs/vercel` (pineado a `^9` por peer astro@^5); instaladas deps `@google/genai`, `vitest` + toolchain de lint; scripts npm `dev/build/preview/test/lint`. Build verde sin endpoints, smoke test verde, `init.ps1` exit 0. Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/astro.config.mjs`, `frontend-astro/package.json`, `frontend-astro/package-lock.json`, `frontend-astro/eslint.config.js`, `frontend-astro/tsconfig.json`, `frontend-astro/tests/smoke.test.ts`, `.gitignore`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 2 `lib_persona_and_tarot` (capa de dominio: `lib/persona.ts` + `lib/tarot.ts`). Deuda fuera de scope: `eslint.config.js` importa `globals` sin declararlo como devDependency explícita, y `npm run lint` deja 3 errores en scaffold preexistente (`mini-oraculo.astro`, `zoltar.astro`).

## 2026-05-29 — feature 2 lib_persona_and_tarot

- **Veredicto:** done
- **Resumen:** Capa de dominio pura: `lib/persona.ts` (exporta `PERSONA_BASE` + `buildSystemPrompt(opts)`, derivado de PERSONA.md con género masculino y tono cómplice cínico) y `lib/tarot.ts` (constante `ARCANOS` con los 22 arcanos cibernéticos, idénticos carácter por carácter al canon del PHP en `legacy/`). Cero imports de HTTP/Astro/Gemini. `.\init.ps1` verde: 3 test files, 11 tests passing. Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/src/lib/persona.ts`, `frontend-astro/src/lib/tarot.ts`, `frontend-astro/tests/lib/persona.test.ts`, `frontend-astro/tests/lib/tarot.test.ts`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 3 `lib_gemini_wrapper` (wrapper único de Gemini en `lib/gemini.ts`, mockeable desde tests, lee API key de `import.meta.env.GEMINI_API_KEY`). Deuda heredada de feature 1 aún abierta (lint en scaffold preexistente).

## 2026-05-29 — feature 3 lib_gemini_wrapper

- **Veredicto:** done
- **Resumen:** Wrapper único de Gemini en `lib/gemini.ts`: `generate(prompt, opts)` encapsula el SDK `@google/genai` (`GoogleGenAI` → `models.generateContent`), lee la key solo de `import.meta.env.GEMINI_API_KEY` (error descriptivo si falta, antes de instanciar el SDK) y soporta opts model/systemInstruction/temperature/maxOutputTokens. SDK mockeado con `vi.mock()`; ningún otro archivo de src importa el SDK. `.\init.ps1` verde: 4 test files, 21 tests passing (10 nuevos). Aprobado por reviewer.
- **Archivos tocados:** `frontend-astro/src/lib/gemini.ts`, `frontend-astro/tests/lib/gemini.test.ts`.
- **Notas para la próxima sesión:** La siguiente feature pending es la 4 `endpoint_morpheus_quotes` (GET `/api/morpheus-quotes`: array fijo de frases tipo Morpheus, sin Gemini; primer smoke del setup Vercel). Deuda heredada de feature 1 aún abierta (lint en scaffold preexistente).
