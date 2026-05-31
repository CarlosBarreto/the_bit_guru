# docs/conventions.md — Convenciones de bit_guru

## Estilo de código

- **Formatter:** Prettier (config por defecto + `astroOrganizeImports`).
- **Linter:** ESLint con `eslint-plugin-astro` + `@typescript-eslint`.
- **Indentación:** 2 espacios. Sin tabs.
- **Comillas:** dobles para strings, simples para JSX/Astro attributes.
- **Semicolons:** sí.
- **Line endings:** LF (no CRLF) — `.gitattributes` lo fuerza si hace falta.

## Nombres

- **Funciones / métodos:** `camelCase` (`getTirada`, `buildPrompt`).
- **Tipos / interfaces / clases:** `PascalCase` (`Arcano`, `TiradaResponse`).
- **Constantes módulo-nivel:** `UPPER_SNAKE` (`ARCANOS`, `PERSONA_BASE`).
- **Archivos TS:** `kebab-case` (`morpheus-quotes.ts`, `wisdom-tweet.ts`).
- **Archivos de tipos:** `.types.ts` opcional para módulos con muchos tipos.
- **Tests:** `*.test.ts` espejo de la ruta del módulo en `src/`.

## Manejo de errores

- **Endpoints (`pages/api/`)** envuelven la lógica en `try/catch` y
  devuelven `Response` con status code apropiado:
  - `400` — input inválido (validación local).
  - `502` — Gemini caído / respuesta corrupta.
  - `500` — todo lo demás.
- **Dominio (`lib/`)** lanza `Error` con mensaje descriptivo. No conoce HTTP.
- **Nunca** se devuelve un `500` con el `error.message` crudo si contiene
  detalles internos. Se loguea internamente, se devuelve mensaje neutro al
  cliente.

## Tests

- **Framework:** Vitest.
- **Estructura:** `frontend-astro/tests/` espeja `frontend-astro/src/`.
  Ej: `src/lib/tarot.ts` → `tests/lib/tarot.test.ts`.
- **Estilo:** `describe` + `it`. Aserciones con `expect`.
- **Mocks de Gemini:** se mockea `lib/gemini.ts` con `vi.mock()` en tests
  unitarios. Tests de integración con Gemini real solo bajo demanda
  (no en CI por defecto).
- **Coverage:** no se exige número, pero todo módulo en `lib/` debe tener
  al menos un test de su API pública.

## Documentación en código

- **Comentarios:** mínimos. Solo cuando el *porqué* no es obvio del nombre.
  Nada de `// suma a y b` arriba de `a + b`.
- **JSDoc:** solo en funciones exportadas de `lib/` que cruzan capas.
- **TODO / FIXME:** solo con nombre + fecha + razón
  (`// TODO(carlos, 2026-06): parametrizar idioma cuando entre inglés`).

## Git

- **Mensajes de commit:** Conventional Commits.
  - `feat:` nueva feature.
  - `fix:` bug.
  - `chore:` mantenimiento (deps, config, docs).
  - `refactor:` cambio interno sin cambio de comportamiento.
  - `test:` solo tests.
- **Granularidad:** un commit por feature cerrada (post-review). Durante el
  trabajo, commits intermedios al WIP están bien pero se squashean al cerrar
  la feature.
- **Branch por feature:** `feat/<feature-name>` derivado de la rama de la
  migración (`feat/migrate-to-vercel`) durante este tránsito; de `main` una
  vez mergeada.
