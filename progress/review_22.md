# Review — feature 22 `redesign_page_memos`

- **Fecha:** 2026-06-09
- **Agente:** reviewer
- **Insumos:** `docs/architecture.md`, `docs/conventions.md`, `CHECKPOINTS.md`, `docs/design/redesign_advisory_spec.md` (§ /memos, § VOICE & COPY, § ANCLAJE AL BACKEND), `feature_list.json` (feature 22), `progress/impl_22.md`, `progress/current.md`, los 8 archivos nuevos completos, `src/pages/api/wisdom-tweet.ts` + `morpheus-quotes.ts` (contraste de contrato), `PageShell.astro`, `git status`/`git diff`, `.\init.ps1`, `npm run build --prefix frontend-astro`, manifest del build.

**Veredicto:** APPROVED

---

## Checkpoints

- C1: [x] — Existen `AGENTS.md`, `init.ps1`, `feature_list.json`, `progress/current.md` y los 3 docs (sección 2 de init.ps1 toda OK). `.\init.ps1` ejecutado por este reviewer desde la raíz: **exit code 0**.
- C2: [x] — Exactamente una feature `in_progress` (la 22; `git diff feature_list.json` = 1 sola línea, `pending`→`in_progress`, puesto por el leader). Todas las features done con tests verdes (409/409). `progress/current.md` describe solo la sesión activa (plan del leader + notas del implementer de la feature 22), sin basura de sesiones previas.
- C3: [x] — Archivos nuevos en rutas previstas por `docs/architecture.md`: `src/utils/` ("Helpers transversales", architecture.md:45), `src/components/`, `src/pages/`, espejo en `tests/`. Cero dependencias nuevas (los tests usan `astro/container`, `vitest`, `node:fs`, `node:url`, ya en uso; `memos-client.ts` no importa nada). Sin `console.*`, sin TODOs, sin `debugger` en los 8 archivos (grep verificado).
- C4: [x] — Cada módulo nuevo tiene su test espejo: `tests/utils/memos-client.test.ts` (24), `tests/components/memo-card.test.ts` (14), `tests/components/quarterly-archive.test.ts` (12), `tests/pages/memos.test.ts` (19). El fetch está mockeado SIEMPRE en su frontera (stubs `MemoFetch` + `vi.stubGlobal("fetch", ...)` con `vi.unstubAllGlobals()` en `afterEach`, memos-client.test.ts:79-81): cero red, cero jsdom. `npm test --prefix frontend-astro`: **38 archivos / 409 tests, todos verdes**. (Déficit heredado pre-arnés: `utils/api.js` legacy y páginas neón sin test — estado idéntico al sancionado en reviews 14–21; su limpieza es la feature 26.)
- C5: [x] — `git status --porcelain`: solo los 8 archivos nuevos declarados + `progress/impl_22.md` + las 2 modificaciones esperadas (`feature_list.json`, `progress/current.md`). Sin basura sin trackear (dist/.vercel del build no aparecen). `progress/history.md` tiene la entrada de la última sesión cerrada (feature 21). Feature 22 reflejada en su estado correcto (`in_progress`, pendiente de `done` post-aprobación — mismo flujo que 19–21).

## Verificación de perímetro (regla "no tocar")

`git status --porcelain` muestra **únicamente**:
- `M feature_list.json` (1 línea: status de la 22, cambio del leader), `M progress/current.md`, `?? progress/impl_22.md`
- `??` los 8 archivos nuevos declarados (`src/utils/memos-client.ts`, `src/components/MemoCard.astro`, `src/components/QuarterlyArchive.astro`, `src/pages/memos.astro` + sus 4 tests espejo).

`git diff HEAD` explícito sobre `src/pages/api/` (los 7 endpoints, incl. `wisdom-tweet.ts` y `morpheus-quotes.ts`), `src/lib/`, `src/layouts/Layout.astro`, `PageShell.astro`, `TopNavigation.astro`, `Footer.astro`, `index.astro`, `practica.astro`, `metodologia.astro`: **diff vacío — intactos**. ✔

## Acceptance criteria de la feature 22

1. **`data-accent='olive'`, una sola familia de acento** — ✔. `memos.astro:80` usa `<PageShell accent="olive">`; PageShell lo aplica en `<main id="main" data-accent="olive">` (`PageShell.astro:33`), patrón canónico aprobado en features 19–21. `memos.test.ts:41-51` asierta `<main data-accent="olive">` y EXACTAMENTE 1 `data-accent` en todo el documento renderizado; `:142-148` excluye burgundy/forest en el source. Los componentes no nombran familias: consumen solo `--accent*`/`--ink*` (fijado por `memo-card.test.ts:156-161`; verificado también en `QuarterlyArchive.astro`, que solo usa `--ink-rule`/`--font-mono`/`--space-*`).
2. **MemoCard consume `/api/wisdom-tweet`; epígrafes opcionales de `/api/morpheus-quotes`; endpoints SIN tocar** — ✔. Contrato cotejado contra los endpoints reales: `memos-client.ts:14,17` (rutas literales) · `:74-80` `memoRequestUrl` agrega `?tema=` con `encodeURIComponent` (el endpoint lo lee en `wisdom-tweet.ts:37`) · `:86-94` `parseMemoPayload` valida `{ tweet: string }` (lo que devuelve `wisdom-tweet.ts:71`) · `:117-136` `fetchEpigraphs` valida array de strings (lo que devuelve `morpheus-quotes.ts:23`). Hidratación client-side: `memos.astro:107-113` (`<script>` que llama `hydrateMemoCards(document)`); verifiqué en el build que el script **realmente embarca**: clave `src/pages/memos.astro?astro&type=script&index=0&lang.ts` en `inlinedScripts` del manifest del adapter, con `/api/wisdom-tweet`, `/api/morpheus-quotes` y `data-memo-card` dentro del payload inline. **Fallo de epígrafes no rompe los memos**: `fetchEpigraphs` devuelve `[]` ante red caída/HTTP no-ok/payload no-array (`memos-client.ts:117-136`) y el reparto solo toca tarjetas `ready` con hueco (`:206-218`); test `memos-client.test.ts:287-301`. Endpoints intactos (perímetro arriba). Solo GET, sin `init`: la firma `MemoFetch` (`memos-client.ts:45`) ni siquiera admite método.
3. **QuarterlyArchive agrupa por trimestre con números de memo en mono** — ✔. `QuarterlyArchive.astro:38-50` agrupa preservando orden de aparición (sin `.sort(`, fijado por `quarterly-archive.test.ts:135-138`); una `<section aria-labelledby>` + `<h2 id>` por trimestre (`:56-59`) con `<ol role="list">` de MemoCard separadas por hairlines `1px solid var(--ink-rule)` (`:79,109-111`). Mono: `.quarter-label` (`QuarterlyArchive.astro:88-96`), `.memo-number`/`.memo-quarter` (`MemoCard.astro:77-93`, número en `--accent`), `.memo-date` (`:157-163`) — todos `var(--font-mono)`, fijado por `quarterly-archive.test.ts:124-128` y `memo-card.test.ts:123-131`. Posicionamiento de cada memo DENTRO de la sección de su trimestre verificado por offsets (`quarterly-archive.test.ts:71-93`); en la página, 3 trimestres (T2 2026 → T1 2026 → T4 2025) y 6 `.memo-number` (`memos.test.ts:60-86`).
4. **Estados de carga/error con microcopy de registro consultora, accesibles** — ✔. Una sola fuente de verdad: `MEMO_LOADING_TEXT`/`MEMO_ERROR_TEXT`/`EPIGRAPH_SOURCE_TEXT` exportadas de `memos-client.ts:23-32` e importadas por MemoCard (`MemoCard.astro:22-27`); la hidratación solo alterna `hidden`, no duplica textos. Carga: `<p data-memo-body role="status" aria-live="polite">` server-rendered con el texto visible (`MemoCard.astro:53-55`) — funciona sin JS. Error: `<p data-memo-error role="alert" hidden>` pre-poblado (`:56-58`), se des-oculta al fallar (`memos-client.ts:189-196`). Registro: *"Memorando en deliberación…"* / *"El sistema oracular presenta latencia. Reintente…"* — usted, deadpan, patrón del ejemplo canónico de la spec § VOICE & COPY; sin "!", sin emoji (auditado por `memos-client.test.ts:101-118` y por grep propio sobre los 8 archivos). Tests: `memo-card.test.ts:68-82`, `memos.test.ts:88-104` (6 status + 6 alerts en la página), transiciones ready/error sobre DOM falso en `memos-client.test.ts:203-307`.
5. **`tests/` mockea el fetch y valida render del archivo y MemoCard** — ✔. 69 tests nuevos, cero red: camino default con `vi.stubGlobal("fetch", ...)` (`memos-client.test.ts:122-131`), resto con stubs `MemoFetch` inyectados (`:26-30`); hidratación sobre DOM falso mínimo (`:32-77`, mismo recurso de cast que `tests/pages/api/wisdom-tweet.test.ts`). Render real vía Container API: QuarterlyArchive con 5 entradas/3 trimestres (`quarterly-archive.test.ts:35-115`), MemoCard en todas sus variantes de props (`memo-card.test.ts:41-119`) y la página completa con 6 tarjetas (`memos.test.ts:35-138`).
6. **`init.ps1` verde y `npm test` pasa** — ✔. Ejecutados por este reviewer: `.\init.ps1` exit 0 con **38 archivos / 409 tests** (baseline 340 + 69 nuevos = 24+14+12+19, cuadra con `impl_22.md`). `npm run build --prefix frontend-astro`: **verde** (server + client + adapter `@astrojs/vercel`, "Complete!").

## Conformidad con `redesign_advisory_spec.md`

- **Tokens:** cero hex en los 4 archivos de `src/` (grep limpio); solo `--accent*`, `--ink*`, `--space-*`, `--step-*`, `--font-*`, `--measure`. ✔
- **Prohibiciones duras:** sin gradiente, sin box/text-shadow, sin dark mode, sin emoji, sin hype ("revolucionari/disruptiv/game-changer" auditados en `memos.test.ts:131-138`), sin Tailwind CDN, sin `<img>`. Las únicas apariciones de "gradiente/dark mode" son comentarios de prohibición en prosa (`memos.astro:16,118`), no usos — checks escopados a `<style>`/HTML renderizado, convención sancionada en 20–21. ✔
- **Layout:** prosa y tarjetas a la izquierda (`text-align: left` en `.memo-card`, `.quarterly-archive`, `.page-content`); hairlines `--ink-rule` como recurso estructural; `--measure` en el cuerpo del memo; sin "!" en toda la página. ✔
- **Tipografía:** serif para asunto/cuerpo/epígrafe, mono con `letter-spacing` para número/trimestre/fecha/etiqueta de trimestre, sans solo en la alerta institucional. ✔
- **Voz:** registro de usted deadpan sin guiños; catchphrases canónicas adaptadas ("Hoy las cartas indican que…" y "…si eso le tranquiliza, créalo." en `memos.astro:96-97`, fijadas por `memos.test.ts:183-186`); deck cínico-seco ("Se distribuyen sin costo. El costo viene después.", `memos.astro:86`); atribución del epígrafe en personaje ("Apertura suministrada por un asesor externo de la firma.", sin romper el misterio). Sin lorem. ✔
- **Accesibilidad:** landmarks y skip-link vía PageShell (sin tocarlo); un solo `<h1>` (`memos.test.ts:53-58`); jerarquía h1 (hero) → h2 (trimestres) → h3 (asuntos) sin saltos; `<section aria-labelledby>`; `<ol role="list">` restituye semántica tras `list-style: none`; live regions `role="status"`/`role="alert"`; el color no es el único portador (error con filete estructural `border-left` además del color; contrastes en tokens AA de la spec: `--olive` 7.5:1, `--ink-muted` 6.4:1). La página no agrega elementos interactivos nuevos (el foco visible vive en el chrome ya aprobado). `/memos` ya es uno de los 6 enlaces de `nav-links.ts` (intacto). ✔

## Arquitectura

- **`src/utils/` es la ubicación correcta** para `memos-client.ts`: `docs/architecture.md:41` define `lib/` como "dominio puro, sin I/O" y `:86-87` reserva el I/O a `lib/gemini.ts` + `pages/api/` para mantener el dominio server-side testable; un cliente fetch de navegador es presentación, y `utils/` ("Helpers transversales", `:45`) tiene el precedente exacto `utils/api.js` (fetch cliente legacy). Regla de dependencias respetada: `memos-client.ts` no importa nada de `lib/` ni `pages/`; componentes/página → utils (dirección correcta, nunca al revés).
- **Convenciones:** dobles comillas, semicolons, 2 espacios, LF puro y cero tabs en los 8 archivos (verificado byte a byte); kebab-case en `.ts`, PascalCase en componentes, `camelCase`/`PascalCase`/`UPPER_SNAKE` correctos; JSDoc en las funciones exportadas; tests espejo de rutas (`tests/utils/` nuevo, espejo legítimo de `src/utils/`).
- **Errores controlados:** el módulo cliente lanza `Error` descriptivo sin tocar HTTP del lado servidor; `hydrateMemoCards` captura por tarjeta y traduce a estado visual; nada de `error.message` crudo en UI (la alerta usa microcopy fija).

## Observaciones no bloqueantes

1. `memos-client.ts:68` — `defaultFetch` resuelve `globalThis.fetch` al momento de la llamada (no en import), lo que habilita `vi.stubGlobal`; intencional y documentado. Correcto también en navegador (invocación sobre `globalThis`, sin "Illegal invocation").
2. `MemoCard` descarta el borde-caja de `InsightCard` (rationale en `MemoCard.astro:9-11`): lectura razonable de "variante" — conserva número mono/título serif/fecha mono y delega la separación a la lista hairline del archivo; doble marco sería ruido. Fijado por test (`memo-card.test.ts:139-144`).
3. `pickEpigraph` reparte por índice global de tarjeta (`memos-client.ts:206-212`), no por índice entre huecos; con 8 citas y huecos en posiciones 0/2/4 las citas salen distintas. Determinista e inocuo.
4. Herencia sancionada (19–21): `data-accent` vive en `<main>` (PageShell), nav/footer permanecen Navy. Patrón canónico del repo.
5. Heredado pre-arnés (no regresión de esta feature): `utils/api.js` legacy sin test y páginas neón obsoletas; su limpieza es el alcance de la feature 26.

## Cambios requeridos

Ninguno.

## Siguiente paso (leader)

Marcar feature 22 `done` en `feature_list.json`, mover el resumen de sesión a `progress/history.md` y commitear (`feat:`), según protocolo.
