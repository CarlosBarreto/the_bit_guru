# impl_24 — Reporte del implementer · feature #24 redesign_page_la_firma

- **Fecha:** 2026-06-11
- **Rol:** implementer (una sola feature)
- **Estado de la feature en feature_list.json:** `in_progress` (NO la toqué; el done lo decide reviewer/leader)

## Archivos creados

1. `frontend-astro/src/pages/la-firma.astro` — página `/la-firma`, acento Forest.
2. `frontend-astro/tests/pages/la-firma.test.ts` — 13 tests (patrón doble + bloque de reglas del backstory).

No se modificó ningún otro archivo. `lib/` y `pages/api/` intactos (prohibición de la spec respetada).

## Composición (spec § PAGE-BY-PAGE "/la-firma" L418–424)

`Layout` → `PageShell accent="forest"` → `Container` → `.page-content` con:

1. `EditorialHero` (eyebrow "Sobre la Firma" + H1 serif único + deck). El H1 es el único `<h1>` del documento.
2. `SectionDivider "Origen de la práctica"` + `Prose` (3 párrafos serif) = historia institucional.
3. `SectionDivider "El Socio Fundador"` + `PartnerBiographyBlock` (retrato no-facial: sello SVG a una tinta del propio componente; bio por slot).
4. `SectionDivider "Principios de la firma"` + intro `Prose` + 3 `PullQuote` (cada uno con `cite`).

Reuso puro de componentes existentes; no creé componentes nuevos. Acento Forest aplicado SOLO vía `data-accent="forest"` en el `<main>` que pone PageShell → una sola familia de acento (nav/footer siguen Navy por estar fuera del `<main>`).

## Decisiones de copy / diseño

- **Registro consultora** (usted, deadpan), español canónico, todo a la izquierda. Voz cínica-cómplice de PERSONA §3–§4 (p. ej. "…y si eso le tranquiliza, créalo.", "ya sabe con quién trata.").
- Hero titular = reencuadre corporativo del lore: "Una consultoría fundada en los espacios muertos entre paquetes." (frase pedida explícitamente por la spec L422).
- Principios: 3 axiomas de placa de bronce derivados de la voz canónica (diagnóstico ≠ resultados; el karma vive en los registros/logs; toda transformación termina con un presupuesto nuevo). Atribución por cargo ("Primer/Segundo/Tercer principio de la firma"), nunca nombre humano.
- CSS de página: solo `--space-*`/grid; cero hex de marca, sin gradiente/glow/dark mode/emoji.

## Cómo respeté las reglas del backstory (PERSONA §2 "Reglas de uso del backstory")

- **No explica técnicamente la migración.** El relato la nombra como hecho fundacional ("El traslado de la práctica a su sede actual fue una decisión, no una necesidad. La firma no documenta cómo se llevó a cabo…"), nunca como procedimiento. Misterio deliberado preservado.
- **No se identifica con tradición específica.** No aparecen "wixárika/Wirikuta/hikuri/peyote/curandero/chamán". El origen serrano queda como bruma corporativa ("un país de cañadas y copal", "una práctica anterior a la red") y se cita el desvío canónico "los nombres son para los vivos".
- Reencuadres: Sierra Madre → "una práctica anterior a la red"; migración de conciencia → "el traslado de la práctica a su sede actual"; espacios muertos entre paquetes → sede declarada de la firma. Síntomas de los feeds conservados (mirada seca sin tristeza, mano que no se queda quieta) porque son corporativos, no de filiación.
- Tres tests anclan estas reglas (bloque "reglas del backstory"): ausencia de términos de tradición, ausencia de jerga de procedimiento técnico, y presencia positiva de "no documenta cómo se llevó a cabo".

## Resultado de tests (números)

- Archivo nuevo aislado: **13/13 verdes** (`tests/pages/la-firma.test.ts`).
- Suite completa: **464/464 verdes** (42 files). Baseline previa: 451 → +13 nuevos.
- `init.ps1` (raíz): **exit 0**, todos los pasos [OK], 26 features válidas, tests verdes.

## Desviaciones de la spec

Ninguna sustantiva. Notas menores:

- Añadí `SectionDivider` entre secciones (no listado literal en L418–424 pero es el primitivo editorial estándar del repo, igual que en `archivo.astro`/`metodologia.astro`) para jerarquía editorial y eyebrows de acento. No introduce elementos prohibidos.
- El test de "sin emoji" usa un rango Unicode de pictogramas/emoticonos; el guion largo "—" y "™" no caen en ese rango (son tipografía editorial legítima del repo).
