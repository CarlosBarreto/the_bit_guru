# Review — feature 2 (lib_persona_and_tarot)

- **Fecha:** 2026-05-29
- **Agente:** reviewer
- **Branch:** feat/migrate-to-vercel

**Veredicto:** APPROVED

## Acceptance (feature_list.json id 2) — 1:1

1. **`src/lib/persona.ts` exporta `PERSONA_BASE` (string) y `buildSystemPrompt(opts)`** — OK.
   - `PERSONA_BASE: string` (persona.ts:28-38), construido con `.join(" ")`.
   - `buildSystemPrompt(opts: BuildSystemPromptOptions = {})` (persona.ts:47-59).
   - Extra coherente con arquitectura: interfaz `BuildSystemPromptOptions` (persona.ts:14-19), permite tarea + arcanos.
2. **`src/lib/tarot.ts` exporta `ARCANOS` con 22 elementos, nombres idénticos al canon** — OK (ver comparación abajo).
3. **`tests/lib/persona.test.ts` valida marcas (género masculino, tono cómplice)** — OK.
   - persona.test.ts:12-15 asserta `toContain("masculino")`.
   - persona.test.ts:17-20 asserta `toContain("cómplice")` (lowercased).
   - Ambas marcas existen de verdad en PERSONA.md (§1 "Género: Masculino", §3 "CÓMPLICE CÍNICO") y en el prompt generado (persona.ts:30 "masculino"/"mundialmente conocido"; persona.ts:32 "CÓMPLICE CÍNICO").
4. **`tests/lib/tarot.test.ts` valida longitud 22 y unicidad** — OK.
   - tarot.test.ts:5-7 `toHaveLength(22)`.
   - tarot.test.ts:9-12 unicidad vía `new Set`.
   - Bonus: tarot.test.ts:14-18 verifica 3 nombres canónicos.
5. **Ningún módulo de lib/ importa HTTP/Astro/Gemini** — OK.
   - Grep en `src/lib/` por `import|astro|@google/genai|Response|Request|import.meta`: las únicas coincidencias son la palabra "Astro/Gemini" dentro de un comentario JSDoc. Cero sentencias `import`. Capa de dominio pura confirmada.

## Comparación arcano-por-arcano contra canon PHP

Canon: `legacy/backend-php/app/Controllers/TarotController.php`, `tirada()`,
array `$cartasCiberneticas`, líneas 15-36 (22 entradas, campo `nombre`).
Comparado contra `src/lib/tarot.ts` líneas 12-33.

| # | PHP (TarotController.php) | tarot.ts | Match |
|---|---|---|---|
| 1 | `0 - El Bit` | `0 - El Bit` | OK |
| 2 | `I - El Mago Cibernético` | `I - El Mago Cibernético` | OK |
| 3 | `II - La Sacerdotisa de la Nube` | idem | OK |
| 4 | `III - La Emperatriz del Jardín Digital` | idem | OK |
| 5 | `IV - El Emperador de la Torre de Servidores` | idem | OK |
| 6 | `IX - El Ermitaño del Metaverso` | idem | OK |
| 7 | `V - El Oráculo del Stream` | idem | OK |
| 8 | `VI - Los Enlaces Gemelos` | idem | OK |
| 9 | `VII - El Vehículo Autónomo` | idem | OK |
| 10 | `VIII - La Justicia del Algoritmo` | idem | OK |
| 11 | `X - La Rueda de la Fortuna (404)` | idem | OK |
| 12 | `XI - La Fuerza del Híbrido` | idem | OK |
| 13 | `XII - El Colgado de la Red` | idem | OK |
| 14 | `XIII - La Muerte del Sistema` | idem | OK |
| 15 | `XIV - La Templanza del Flujo de Datos` | idem | OK |
| 16 | `XIX - El Sol de Silicio` | idem | OK |
| 17 | `XV - El Demonio del Spam` | idem | OK |
| 18 | `XVI - La Torre Caída` | idem | OK |
| 19 | `XVII - La Estrella de Neón` | idem | OK |
| 20 | `XVIII - La Luna del Espejismo` | idem | OK |
| 21 | `XX - El Juicio del Código` | idem | OK |
| 22 | `XXI - El Mundo del Metaverso` | idem | OK |

22/22 idénticos carácter por carácter, incluyendo el orden no-monótono del PHP
(IX antes que V; XIX antes que XV). No se inventó ni omitió ningún arcano.

## Convenciones (docs/conventions.md)

- Constantes módulo-nivel en `UPPER_SNAKE`: `ARCANOS`, `PERSONA_BASE` — OK.
- Funciones `camelCase`: `buildSystemPrompt` — OK.
- Tipo `PascalCase`: `BuildSystemPromptOptions` — OK.
- Archivos TS `kebab-case` / tests `*.test.ts` espejo de src: `lib/persona.ts`→`tests/lib/persona.test.ts`, `lib/tarot.ts`→`tests/lib/tarot.test.ts` — OK.
- Indentación 2 espacios, comillas dobles, semicolons — OK en los 4 archivos.
- Line endings LF (verificado por bytes: CRLF=0 en los 4 archivos) — OK.
- JSDoc en exports de lib/ que cruzan capas — presente y sobrio — OK.
- Sin logs/prints de debug, sin TODO/FIXME sueltos — OK.

## Scope

- Solo se crearon `src/lib/persona.ts`, `src/lib/tarot.ts`, `tests/lib/persona.test.ts`, `tests/lib/tarot.test.ts` (git status: únicos untracked en frontend-astro).
- NO se implementó `lib/gemini.ts` (feature 3) ni endpoints `pages/api/*` (features 4+). Fuera de scope respetado.
- `feature_list.json` feature 2 en `in_progress` (correcto: el cierre a `done` es post-review).

## Verificación

`.\init.ps1` desde la raíz: **VERDE**, exit code 0.
- Pasos 1-3: archivos base + feature_list.json (12 features) OK.
- Paso 4: `npm test --prefix frontend-astro` → 3 test files, 11 tests passing.
- Paso 5: "Entorno listo."

## Checkpoints (CHECKPOINTS.md)

- C1 — El arnés está completo:
  - [x] 4 archivos base presentes.
  - [x] 3 docs presentes.
  - [x] `.\init.ps1` exit code 0.
- C2 — El estado es coherente:
  - [x] Solo feature 2 en `in_progress`.
  - [x] Features `done` (id 1) con tests que pasan (smoke incluido en la corrida verde).
  - [x] `progress/current.md` describe la sesión activa, sin basura previa.
- C3 — El código respeta la arquitectura:
  - [x] `src/lib/` solo contiene módulos previstos (persona.ts, tarot.ts).
  - [x] Sin dependencias externas no justificadas (cero imports en lib/).
  - [x] Sin logs/prints ni TODOs sueltos.
- C4 — La verificación es real:
  - [x] Cada módulo de lib/ tiene su test espejo en tests/lib/.
  - [x] Tests sin servicios externos (dominio puro; nada que mockear aquí).
  - [x] `npm test --prefix frontend-astro` muestra 11 tests, todos verdes.
- C5 — La sesión se cerró bien:
  - [x] Sin untracked sospechosos (solo lib/ y tests/lib/ + informe de impl).
  - [ ] `progress/history.md` aún sin entrada de esta sesión — corresponde al cierre/leader tras marcar done; no bloquea la aprobación de la feature.
  - [x] La feature trabajada (id 2) refleja estado `in_progress`, correcto pre-done.

## Cambios requeridos

Ninguno. Trabajo aprobado.

## Nota para el leader (no bloqueante)

Al cerrar la sesión: marcar feature 2 → `done` en feature_list.json y añadir
entrada en `progress/history.md` (C5 segundo box) antes de declarar la sesión
cerrada.
