# Informe de implementación — Feature 22: `redesign_page_memos`

- **Fecha:** 2026-06-09
- **Agente:** implementer
- **Feature:** 22 — Phase 4, Memos Trimestrales (`/memos`): MemoCard + QuarterlyArchive (acento Olive)
- **Estado:** implementado y verificado; pendiente de reviewer (NO marcado done, sin commits)

---

## Archivos creados (8, cero modificaciones a código existente)

| Archivo | Qué es |
|---|---|
| `frontend-astro/src/utils/memos-client.ts` | Módulo cliente del fetch: constantes de endpoint (`/api/wisdom-tweet`, `/api/morpheus-quotes`), microcopy de carga/error en registro consultora (una sola fuente de verdad), `memoRequestUrl` (?tema= codificado), `parseMemoPayload` (contrato `{ tweet: string }`), `fetchMemoBody` (lanza en HTTP no-ok / payload inválido), `fetchEpigraphs` (opcional: cualquier fallo devuelve `[]`), `pickEpigraph` (determinista por índice), `hydrateMemoCards(document)` (orquesta la hidratación) y el tipo `MemoEntry` del índice editorial. Fetch inyectable (`MemoFetch`) para tests sin red. |
| `frontend-astro/src/components/MemoCard.astro` | Variante de InsightCard (spec § REQUIRED COMPONENTS /memos): número de memo + trimestre en `--font-mono` (número en `--accent`), asunto `<h3>` serif, epígrafe opcional (`<blockquote data-memo-epigraph hidden>` con atribución deadpan, se llena desde morpheus-quotes), cuerpo `[data-memo-body]` con `role="status"` + `aria-live="polite"` y microcopy de carga server-rendered, alerta `[data-memo-error]` con `role="alert"` oculta con microcopy de error, fecha mono opcional. Sin caja con borde: la separación la pone la lista hairline del archivo. Estado en `data-memo-state` (loading → ready/error). |
| `frontend-astro/src/components/QuarterlyArchive.astro` | Índice cronológico agrupado por trimestre: una `<section aria-labelledby>` por trimestre con `<h2>` mono (id `trimestre-<slug>`) y `<ol role="list">` de MemoCard separadas por hairlines `1px var(--ink-rule)`. Agrupa preservando el orden de aparición (no reordena: el orden cronológico lo declara la página). |
| `frontend-astro/src/pages/memos.astro` | Página `/memos`: `Layout title="Memos Trimestrales — Bit Gurú"` → `PageShell accent="olive"` → `Container` → EditorialHero breve + `SectionDivider "Índice Cronológico"` + nota de registro (Prose) + `QuarterlyArchive` con 6 memorandos en 3 trimestres (T2 2026 → T1 2026 → T4 2025), cada uno con `tema` para `?tema=` y `withEpigraph` en el primero de cada trimestre. `<script>` de página que llama `hydrateMemoCards(document)`. |
| `frontend-astro/tests/utils/memos-client.test.ts` | 24 tests: contrato de endpoints, microcopy, fetch mockeado (incl. `vi.stubGlobal("fetch", ...)`), epígrafes tolerantes a fallo, hidratación con DOM falso. |
| `frontend-astro/tests/components/memo-card.test.ts` | 14 tests (Container API + source). |
| `frontend-astro/tests/components/quarterly-archive.test.ts` | 12 tests (Container API + source). |
| `frontend-astro/tests/pages/memos.test.ts` | 19 tests (Container API + source). |

Además: `progress/current.md` (bitácora) y este informe. `feature_list.json` ya estaba `in_progress` (lo puso el leader); no se tocó.

## Decisiones de implementación

1. **Arquitectura del fetch (la decisión central).** Los estados de carga/error del acceptance implican fetch **client-side**. Diseño en dos capas:
   - **Estructura editorial estática (server-rendered):** QuarterlyArchive + MemoCard renderizan el índice completo (trimestres, números mono, asuntos, fechas) y el estado de carga inicial. La página funciona sin JS: muestra el índice con los cuerpos "en deliberación".
   - **Hidratación (browser):** un `<script>` de página llama `hydrateMemoCards(document)`, que por cada `[data-memo-card]` consulta `GET /api/wisdom-tweet` (con su `data-memo-tema` como `?tema=`) y escribe el cuerpo; en fallo oculta el cuerpo y muestra la alerta. Los epígrafes se piden UNA vez a `GET /api/morpheus-quotes` y se reparten determinísticamente solo en tarjetas `ready` con hueco de epígrafe; **cualquier fallo de epígrafes devuelve `[]` y no rompe los memos** (son opcionales por spec).
2. **El módulo cliente vive en `src/utils/`, NO en `src/lib/`.** `docs/architecture.md` define `lib/` como dominio puro sin I/O ("No I/O fuera de `lib/gemini.ts` y `pages/api/`" protege la testabilidad del dominio server-side); un cliente fetch de navegador es presentación. `utils/` es la capa de "helpers transversales" y ya tiene el precedente exacto (`utils/api.js`, fetch cliente de la UI legacy). El task sugería `src/lib/memos-client.ts` "solo si encaja con architecture.md" — no encaja; utils sí.
3. **Testabilidad sin jsdom (no está en las dependencias permitidas).** El fetch es inyectable (`MemoFetch`, subconjunto estructural de Response) con default `globalThis.fetch` resuelto al momento de llamar — por eso `vi.stubGlobal("fetch", ...)` funciona para el camino default, cumpliendo la letra del acceptance. La hidratación se prueba con un DOM falso mínimo (objetos planos con `getAttribute`/`setAttribute`/`querySelector` casteados `as unknown as Document`), el mismo recurso de cast que ya usa `tests/pages/api/wisdom-tweet.test.ts` con el APIRoute. Cero red, cero DOM real.
4. **Microcopy con una sola fuente de verdad.** `MEMO_LOADING_TEXT` / `MEMO_ERROR_TEXT` / `EPIGRAPH_SOURCE_TEXT` se exportan de `memos-client.ts`; MemoCard las importa en frontmatter y las server-renderiza (carga visible, error oculto). La hidratación solo alterna `hidden` — no duplica textos. Los tests de componente/página importan las mismas constantes (sin strings copiados). Registro consultora: carga *"Memorando en deliberación. El Oráculo está redactando su conclusión; le pedimos la paciencia habitual."*; error *"El sistema oracular presenta latencia. Reintente la consulta de este memorando en unos minutos; la conclusión no caduca."* (patrón del ejemplo canónico de la spec § VOICE & COPY). Sin "!", sin emoji, usted siempre.
5. **Accesibilidad de estados.** Cuerpo con `role="status"` + `aria-live="polite"` (el reemplazo carga→memo se anuncia sin interrumpir); error con `role="alert"` pre-poblado y `hidden` (al des-ocultarse se anuncia). Estado machine-readable en `data-memo-state` (también engancha el estilo de carga en cursiva/muted vía CSS scoped).
6. **MemoCard sin caja.** Es "variante de InsightCard": conserva eyebrow-mono/título-serif/fecha-mono pero descarta el borde-caja porque vive dentro de la "lista hairline" del archivo (spec § LAYOUT: la regla fina es el principal recurso de estructura); doble marco sería ruido. El test lo fija (`not.toContain("border: 1px solid var(--ink-rule)")` en su CSS).
7. **Agrupación sin reordenar.** QuarterlyArchive agrupa por `quarter` preservando orden de aparición; el orden cronológico descendente (T2 2026 → T4 2025) lo declara la página en `MEMOS`. El test del componente verifica que cada memo cae dentro de la sección de su trimestre por posiciones en el HTML, y que el source no usa `.sort(`.
8. **Checks de prohibiciones escopados (regla del repo).** Hex/gradiente/glow se auditan sobre los bloques `<style>` extraídos del source y sobre el HTML renderizado (los comentarios de frontmatter no se renderizan); nunca sobre el source completo. Me lo apliqué a mí mismo: un primer check de "lorem" sobre el source completo cayó en falso positivo con mi propio comentario "sin lorem" — se reescopó al HTML visible.
9. **En-character, sin placeholder muerto.** Los 6 memorandos (números `BG/M-009`–`BG/M-014`, asuntos deadpan derivados de PERSONA §5, temas reales para `?tema=`) son contenido editorial de la firma; la nota del índice justifica diegéticamente la generación en vivo ("Cada memorando se redacta en el momento exacto de su consulta…") con catchphrases canónicas adaptadas a usted.

## Verificación de acceptance criteria

| AC | Cómo se verificó |
|---|---|
| `data-accent='olive'`; una sola familia | Patrón canónico de features 19–21: el atributo vive en el `<main>` vía `<PageShell accent="olive">`. Tests: `<main data-accent="olive">` presente y conteo total de `data-accent` en el documento == 1; source con `accent="olive"` y sin `accent="burgundy"`/`accent="forest"`; MemoCard/QuarterlyArchive no nombran familias (`--olive`/`--burgundy`/`--forest` ausentes; solo `--accent*`). |
| MemoCard consume /api/wisdom-tweet; epígrafes opcionales de /api/morpheus-quotes; endpoints intactos | `memos-client.test.ts`: constantes == rutas literales de los endpoints; `fetchMemoBody` con fetch mockeado (global e inyectado) valida contrato `{ tweet }`, `?tema=` codificado y fallos HTTP/payload; `fetchEpigraphs` valida array de strings y tolerancia total a fallo; `hydrateMemoCards` valida el cableado (URL con tema, epígrafes solo en tarjetas ready). Página: 6 `data-memo-tema` en markup; source sin imports de `pages/api`. **Endpoints sin tocar:** `git status` — solo archivos nuevos (los `.ts` de `src/pages/api/` no aparecen modificados). |
| QuarterlyArchive agrupa por trimestre con números de memo en mono | `quarterly-archive.test.ts`: 3 secciones para 3 trimestres, `<h2>` con id/aria-labelledby, cada memo posicionado dentro de su sección, orden preservado, hairlines `var(--ink-rule)` en grupos y entre items; `.quarter-label` y (vía `memo-card.test.ts`) `.memo-number`/`.memo-quarter`/`.memo-date` con `font-family: var(--font-mono)`. Página: 6 `.memo-number` renderizados. |
| Estados de carga/error con microcopy de registro consultora | `memo-card.test.ts` + `memos.test.ts`: `role="status"`+`aria-live` con `MEMO_LOADING_TEXT` visible (x6 en la página), `role="alert"` oculto con `MEMO_ERROR_TEXT`; `memos-client.test.ts` audita el registro (contiene "deliberación"/"latencia"/"Reintente", sin "!", sin emoji) y las transiciones (ready/error) sobre DOM falso. |
| tests/ mockea el fetch y valida render del archivo y MemoCard | 69 tests nuevos en 4 archivos: fetch mockeado con `vi.stubGlobal("fetch", ...)` y stubs `MemoFetch`; render del archivo (Container API sobre QuarterlyArchive y sobre la página completa) y de MemoCard (todas sus variantes de props). |
| init.ps1 verde y npm test pasa | `.\init.ps1` final: **38 archivos, 409/409 tests** (baseline 340 + 69). `npm run build --prefix frontend-astro`: build Vercel completo sin errores. |

## Comandos de verificación ejecutados

1. `npx vitest run tests/utils/memos-client.test.ts` (desde `frontend-astro/`) → 24/24.
2. `npx vitest run tests/components/memo-card.test.ts` → 14/14.
3. `npx vitest run tests/components/quarterly-archive.test.ts` → 12/12.
4. `npx vitest run tests/pages/memos.test.ts` → 19/19 (tras corregir un falso positivo propio, ver decisión 8).
5. `npx vitest run` (suite completa) → 38 archivos / 409 tests verdes.
6. `.\init.ps1` desde la raíz → verde (armazón + feature_list + 409 tests).
7. `npm run build --prefix frontend-astro` → verde. Confirmado en el output del adapter que el script de hidratación quedó **inlined** (clave `memos.astro?astro&type=script&index=0&lang.ts` en el mapa `inlinedScripts` del manifest, con la referencia a `wisdom-tweet` dentro): Astro inline-a los scripts de página por debajo del umbral de tamaño, por eso no aparece como chunk separado en `dist/client/_astro/`.
8. Greps de prohibiciones sobre los archivos nuevos: cero hex de marca, cero gradiente/box-shadow/text-shadow/Tailwind en CSS, cero emojis (las "→" de comentarios son el glifo tipográfico que ya usa todo el repo).

Nota operativa para el reviewer: vitest debe correrse desde `frontend-astro/`; desde la raíz del repo el plugin de Astro no se aplica y los `.astro` no parsean.

## Pendiente (fuera de mi alcance)

- Review (reviewer → `progress/review_22.md`).
- Marcar `done` en `feature_list.json` + mover resumen a `history.md` (post-aprobación).
- Commit (no se hizo ninguno, por instrucción).
- Smoke manual con `GEMINI_API_KEY` real (docs/verification.md §3: la página consume un endpoint que llama a Gemini; el smoke del dueño aplica al flujo completo en dev/preview).
