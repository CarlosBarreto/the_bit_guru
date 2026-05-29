# Informe de implementación — feature 2: lib_persona_and_tarot

- **Fecha:** 2026-05-29
- **Agente:** implementer
- **Estado:** implementada y autoverificada (pendiente review; NO marcada done)

## Archivos tocados

| Archivo | Acción |
|---|---|
| `frontend-astro/src/lib/tarot.ts` | creado — exporta `ARCANOS` (22 elementos) |
| `frontend-astro/src/lib/persona.ts` | creado — exporta `PERSONA_BASE` y `buildSystemPrompt(opts)` + interfaz `BuildSystemPromptOptions` |
| `frontend-astro/tests/lib/tarot.test.ts` | creado — longitud 22, unicidad, nombres canónicos |
| `frontend-astro/tests/lib/persona.test.ts` | creado — marca masculino, marca cómplice, base canónica, tarea y arcanos opcionales |
| `feature_list.json` | feature 2 → `in_progress` |
| `progress/current.md` | sesión actual documentada |

## De dónde salió el canon de arcanos

`legacy/backend-php/app/Controllers/TarotController.php`, método `tirada()`,
array `$cartasCiberneticas`, líneas 15-36. Son 22 entradas. Se replicaron los
nombres EXACTOS (campo `nombre`), conservando el prefijo de numeral romano y el
guion (p. ej. `"0 - El Bit"`, `"II - La Sacerdotisa de la Nube"`,
`"XV - El Demonio del Spam"`), y respetando el orden original del PHP (que
incluye su salto de orden característico: IX antes de V, XIX antes de XV, etc.).
No se inventó ningún nombre.

## De dónde salieron las marcas de persona

`PERSONA.md` (raíz del repo):
- **Género masculino:** §1 IDENTIDAD ("Género: Masculino (él / lo / le / suyo)")
  y §10 ("El Gurú es masculino" / "mundialmente conocido"). El prompt-base usa
  literalmente la palabra "masculino" y "mundialmente conocido".
- **Tono cómplice:** §3 ARQUETIPO Y POSICIÓN ("Posición frente a la audiencia:
  CÓMPLICE CÍNICO" + "tú y yo sabemos cómo es esto realmente, mientras allá
  afuera siguen tragando"). El prompt-base usa "CÓMPLICE CÍNICO".
- **Voz/estilo (§4):** humor ácido, contradicción deliberada, metáforas
  esotérico+tech, brevedad, y el bloque "Cómo NO suena" (no motivacional, no
  wellness, no tech-bro, "no insulta de frente: pica").

## Pureza de capa (acceptance: ningún import de HTTP/Astro/Gemini)

Ambos módulos de `lib/` no tienen sentencias `import`. `tarot.ts` solo declara
una constante; `persona.ts` solo declara constante + función + interfaz. No se
referencia `astro`, `@google/genai`, `Request`/`Response`, ni `import.meta.env`.

## Verificación

`.\init.ps1` (via `powershell.exe`) termina verde:
- Pasos 1-3: archivos base y `feature_list.json` (12 features) OK.
- Paso 4: `npm test --prefix frontend-astro` → **3 test files, 11 tests passing**
  (smoke + tarot + persona).
- Paso 5: "Entorno listo."

## Notas para el reviewer

- Acceptance cubierto 1:1: exports correctos, 22 arcanos canónicos, tests de
  marcas de persona (masculino + cómplice), tests de longitud 22 + unicidad,
  capa pura sin imports prohibidos.
- Fuera de scope (no tocado): `lib/gemini.ts`, `pages/api/*` (features 3+).
- Feature dejada en `in_progress`; el cierre a `done` corresponde al post-review.
