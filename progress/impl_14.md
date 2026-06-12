# impl_14 — redesign_tokens_typography (Phase 1)

> Implementer log. Feature 14. Estado al cierre de la sesión: VERDE (tests + build).
> NO se marcó `done` (lo decide el orquestador tras revisión).

## Alcance ejecutado

SOLO se tocaron:

- `frontend-astro/src/layouts/Layout.astro` — reescrito al CSS token system de la spec.
- `frontend-astro/tests/layouts/layout-tokens.test.ts` — NUEVO test de contrato (C4).
- `frontend-astro/tests/components/foundation.test.ts` — AJUSTADO (eran assertions
  del propio `Layout.astro` de la feature 13 que contradicen el nuevo sistema; se
  migraron a los tokens nuevos sin alterar las pruebas de slot/lang/no-CDN).

No se tocó ningún componente, página, `lib/` ni `pages/api/`. Los tests de
componentes (Nav/Footer/TarotSection/Consulta) siguen verdes porque leen el
SOURCE de sus propios `.astro` (que aún declaran `var(--morado)` etc.), no el de
`Layout.astro`. Eso es scope de las features 16–26.

## Cambios en Layout.astro

1. **Tokens neón eliminados.** Se retiró el bloque `:root` previo
   (`--bg #0a0a0f`, `--morado #7b2cbf`, `--cyan #00f0ff`, `--rosa #ff2d95`,
   surfaces, y las fuentes Plus Jakarta / Be Vietnam / Playfair / JetBrains).
2. **CSS token system completo** de `docs/design/redesign_advisory_spec.md`
   § DESIGN TOKENS:
   - NEUTRALS: `--paper #f6f4ee`, `--paper-pure`, `--paper-shade`, `--paper-deep`.
   - NAVY: `--ink-deep`, `--ink`, `--ink-muted`, `--ink-rule`, `--ink-wash`.
   - BURGUNDY / OLIVE / FOREST: cada familia con `-deep` / base / `-bright` / `-wash`.
   - Alias `--accent*` con default neutro navy (Inicio).
   - Selectores `[data-accent="burgundy"|"olive"|"forest"]` que remapean `--accent*`.
3. **Tipografía:** `--font-serif` (Source Serif 4 → Georgia/Times → serif),
   `--font-sans` (IBM Plex Sans → system-ui), `--font-mono` (IBM Plex Mono → ui-monospace).
   Escala `--step--1 … --step-5` (ratio 1.25, base 16px). Espaciado `--space-1 … --space-10`
   (8px). `--radius: 2px`. `--measure: 68ch`.
4. **`<link>` de Google Fonts** ahora carga SOLO Source Serif 4 + IBM Plex Sans +
   IBM Plex Mono. Tailwind por CDN sigue ausente (prohibido).
5. **`body`** usa `background: var(--paper)` y `color: var(--ink)`,
   `font-family: var(--font-sans)`. Light-only: sin dark mode, sin
   `prefers-color-scheme`.
6. **`@media (prefers-reduced-motion: reduce)`** conservado intacto.
7. Cero hex de marca fuera de la tabla de tokens de la spec. Sin gradientes,
   sin glow / box-shadow luminosa, sin neón.

## Test de contrato (C4)

`frontend-astro/tests/layouts/layout-tokens.test.ts` (Vitest, describe/it,
2 espacios, comillas dobles, espejo de ruta de `src/layouts/`). Lee el SOURCE de
`Layout.astro` como texto (el contenido de `<style is:global>` no aparece en
`renderToString`, así que se valida sobre el source — patrón del foundation.test).

Afirma:
- (a) **Presencia** de TODOS los nombres de token requeridos (`--paper*`, `--ink*`,
  `--burgundy*`, `--olive*`, `--forest*`, `--accent*`, `--font-*`, `--step--1…5`,
  `--space-1…10`, `--radius`, `--measure`) + hex canónicos clave + fuentes.
- (b) **Presencia** de los 3 selectores `[data-accent="burgundy"|"olive"|"forest"]`.
- (c) **Ausencia** de patrones prohibidos: hex neón viejos (`#7b2cbf`, `#00f0ff`,
  `#ff2d95`, `#0a0a0f`), gradientes CSS (`linear/radial/conic-gradient`),
  `cdn.tailwindcss.com`, y las 4 fuentes obsoletas.

## Incidencia resuelta durante la sesión

- Primera corrida de `init.ps1`: 1 test rojo
  (`layout-tokens.test.ts` → "no usa gradientes"). Causa: el aserto
  `not.toContain("gradient")` hacía match con la palabra "gradientes" en un
  COMENTARIO del propio `Layout.astro`, no con CSS real. La prohibición de la
  spec es contra las funciones CSS de gradiente. Se ajustó el aserto a
  `linear-gradient` / `radial-gradient` / `conic-gradient` (la prohibición
  precisa). No fue un workaround: es la verificación correcta del contrato.

## Comandos corridos

| Comando | Resultado |
|---|---|
| `npm test --prefix frontend-astro` (baseline) | 111 tests verdes (18 files) |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1` (1ª) | ROJO: 1/176 (gradient) |
| ajuste del aserto de gradiente | — |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1` (2ª) | VERDE: 176/176 (19 files) |
| `npm run build --prefix frontend-astro` | VERDE: build completa (server + client + Vercel) |

## Resultado final

- **Tests:** 176/176 verdes (19 files). `init.ps1` reporta "Entorno listo".
- **Build:** completa sin errores. Retirar los tokens neón NO rompe la build
  (los componentes que aún referencian `var(--morado)` etc. son CSS válido con
  custom properties inexistentes; se reescriben en features 16–26).
- **verify_command:** `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./init.ps1`
  (más `npm run build --prefix frontend-astro`).
