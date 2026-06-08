# Bit Gurú — Redesign Spec: Deadpan Tier-1 Strategic Advisory Firm

> **Versión:** 1.0 · **Fecha:** 2026-06-08 · **Estado:** AUTORITATIVA
> **Autor de la directiva:** dueño (Carlos Barreto). **Redacción:** Agente Mictlán (leader).
> **Sustituye a:** `PERSONA.md §8 (Estética Visual)` y `docs/design/design_brief.md`.
> **Preserva:** `PERSONA.md §1–§7` (identidad, lore, arquetipo cómplice-cínico, voz, temas).
>
> Este documento es la **fuente de verdad de diseño** para el rediseño del sitio.
> Cualquier implementador (humano o agente) construye contra esta spec. Si el
> código contradice esta spec, se ajusta el código.

---

## PROJECT DIRECTIVE

Eres un **Staff Product Designer + Frontend Architect senior**.

Misión: rediseñar el sitio de **Bit Gurú** como una **firma de asesoría estratégica
Tier-1, deadpan** (registro McKinsey/BCG). El Gurú de Bits no abandona su identidad:
se presenta ahora como **Socio Fundador** de una consultora. El tarot cibernético se
reencuadra como un **marco diagnóstico propietario**; las lecturas, como
**compromisos** (*engagements*); los tweets de sabiduría, como **memos trimestrales**.

**El parody se transmite EXCLUSIVAMENTE por el contenido.** La forma visual es
sobria, editorial y corporativa hasta el aburrimiento. El chiste vive en la
distancia entre la **forma** (informe institucional impecable) y la **sustancia**
(misticismo binario absurdo dicho con cara de palo).

### Prioridades de implementación

1. Consistencia sobre creatividad.
2. Credibilidad editorial sobre novedad visual.
3. Arquitectura de información sobre marketing.
4. Accesibilidad sobre estética.
5. Mantenibilidad a largo plazo sobre velocidad de entrega.

### Orden de prioridad ante conflictos

Si una instrucción contradice a otra, gana la de mayor rango:

1. **HARD PROHIBITIONS**
2. **VISUAL IDENTITY** (incl. DESIGN TOKENS)
3. **LAYOUT**
4. **TYPOGRAPHY**
5. **VOICE & COPY**
6. **MOTION**
7. **Optional enhancements**

Ante la duda, elige siempre la opción **más conservadora y corporativa**.

---

## OUTPUT CONTRACT

Esta spec produce y exige producir:

1. Design system specification.
2. Site architecture.
3. Component inventory.
4. Page-by-page content structure.
5. CSS token system.
6. Accessibility checklist.
7. Implementation roadmap.

**NO produce (fuera de alcance):**

- Backend code.
- Deployment instructions.
- API implementation.
- Marketing strategy.
- SEO strategy.

> Nota de alcance: los endpoints serverless ya existen (features 1–11, todas `done`).
> Este rediseño es **solo de presentación**. No se tocan `frontend-astro/src/lib/`
> ni `frontend-astro/src/pages/api/`. Ver § *Anclaje al backend existente*.

---

## HARD PROHIBITIONS

Violar cualquiera de estas reglas es un **fallo de diseño**, no una preferencia.

- ❌ **No dark mode.** El sitio existe solo en modo claro (papel editorial).
- ❌ **No gradientes.** Ningún `linear-gradient`, `radial-gradient` ni `conic-gradient`.
- ❌ **No glow / neón.** Ninguna `box-shadow` luminosa, `text-shadow`, `filter: blur/drop-shadow` decorativo, ni acentos de neón.
- ❌ **No fotografía de stock.**
- ❌ **No rostros humanos visibles ni fotorrealismo** (alineado con el antiguo PERSONA §8).
- ❌ **No más de una familia de acento por página.**
- ❌ **No inventar colores de marca** fuera de los DESIGN TOKENS. Cero hex sueltos.
- ❌ **No emoji** en UI ni en copy.
- ❌ **No lenguaje de hype marketinero** ("revolucionario", "disruptivo", "game-changer", "potencia tu…").
- ❌ **No animación** fuera de la § MOTION (sin parallax, sin typewriter, sin carruseles autoplay, sin scroll-jacking).
- ❌ **No Tailwind por CDN** (`cdn.tailwindcss.com`). CSS propio o `@astrojs/tailwind` local.
- ❌ **No estética startup**: nada de blobs, glassmorphism, pills fosforescentes, bordes redondeados exagerados, ilustraciones isométricas.
- ❌ **No texto largo centrado.** El cuerpo editorial se alinea a la izquierda.
- ❌ **Navegación con exactamente 6 enlaces.** Ni 5 ni 7.

---

## VISUAL IDENTITY

Registro: **informe institucional impreso**. Papel cálido, tinta navy casi negra,
reglas finas (hairlines), un único acento sobrio por página, mucho espacio en
blanco, tablas de datos secas. La referencia mental es un *white paper* de McKinsey
o un memo del Financial Times — **nunca** una landing de SaaS.

### Sistema de color (resumen de intención)

- **Navy** = tinta y estructura. Es global: textos, encabezados, reglas, bordes de tabla. Aparece en **todas** las páginas.
- **Neutrals** = papel y superficies. Global. El lienzo es marfil cálido, no blanco puro.
- **Burgundy / Olive / Forest** = las tres familias de **acento**. Cada página elige **una y solo una**. Se usan para enlaces, eyebrows, filetes de sección, rellenos de diagrama y estados.

Asignación de acento por página (autoritativa, ver § SITE MAP):

| Página | Familia de acento |
|---|---|
| Inicio (`/`) | **Navy** (neutra; el home no usa familia de acento, solo tinta) |
| Áreas de Práctica (`/practica`) | **Burgundy** |
| Metodología (`/metodologia`) | **Forest** |
| Memos Trimestrales (`/memos`) | **Olive** |
| Archivo de Compromisos (`/archivo`) | **Burgundy** |
| Sobre la Firma (`/la-firma`) | **Forest** |
| Admisión de Clientes (`/admision`) | **Olive** |

> Regla dura: cada página importa **solo** su familia de acento + Navy + Neutrals.
> Si una página necesita "otro color", la respuesta es no.

---

## DESIGN TOKENS (SOURCE OF TRUTH)

Los siguientes tokens son **autoritativos**. Nunca inventes colores de marca
adicionales. Usa únicamente estos. Violar esta regla es un fallo de diseño.

Todos los pares texto/fondo listados como cuerpo cumplen **WCAG AA** sobre `--paper`
(contrastes verificados, ver § ACCESSIBILITY).

### NAVY FAMILY — tinta y estructura (global)

| Token | Hex | Rol |
|---|---|---|
| `--ink-deep` | `#0B1B2D` | Display / headlines |
| `--ink` | `#16293B` | Cuerpo de texto |
| `--ink-muted` | `#4B5965` | Metadatos, captions, *bylines* (AA 6.4:1) |
| `--ink-rule` | `#C7CFD6` | Hairlines, bordes de tabla, divisores |
| `--ink-wash` | `#E7EBEF` | Banda de encabezado de tabla, relleno tenue |

### BURGUNDY FAMILY — acento A

| Token | Hex | Rol |
|---|---|---|
| `--burgundy-deep` | `#5E1325` | Encabezados de acento |
| `--burgundy` | `#7C1D33` | Enlaces / acento (AA 9.2:1) |
| `--burgundy-bright` | `#9A2A43` | Hover / elementos grandes |
| `--burgundy-wash` | `#F0E2E4` | Relleno tintado sobre papel |

### OLIVE FAMILY — acento B

| Token | Hex | Rol |
|---|---|---|
| `--olive-deep` | `#3A380F` | Encabezados de acento |
| `--olive` | `#54501A` | Enlaces / acento (AA 7.5:1) |
| `--olive-bright` | `#6E6826` | Hover / elementos grandes |
| `--olive-wash` | `#ECEADA` | Relleno tintado sobre papel |

### FOREST FAMILY — acento C

| Token | Hex | Rol |
|---|---|---|
| `--forest-deep` | `#0E3026` | Encabezados de acento |
| `--forest` | `#1A4636` | Enlaces / acento (AA 9.8:1) |
| `--forest-bright` | `#285E48` | Hover / elementos grandes |
| `--forest-wash` | `#DFEAE4` | Relleno tintado sobre papel |

### NEUTRALS — papel y superficies (global, light-only)

| Token | Hex | Rol |
|---|---|---|
| `--paper` | `#F6F4EE` | Lienzo principal (marfil cálido) |
| `--paper-pure` | `#FFFFFF` | Insets / tarjetas blancas |
| `--paper-shade` | `#EDEAE1` | Banda de sección alterna |
| `--paper-deep` | `#E4E0D4` | Fondo del footer / banda más profunda |

### Tokens semánticos de acento (alias por página)

Para que los componentes no dependan del nombre de la familia, cada página define
**una** vez estos alias en su scope raíz, apuntando a la familia elegida:

```
--accent-deep   → --burgundy-deep | --olive-deep   | --forest-deep
--accent        → --burgundy      | --olive        | --forest
--accent-bright → --burgundy-bright| --olive-bright | --forest-bright
--accent-wash   → --burgundy-wash | --olive-wash   | --forest-wash
```

Los componentes consumen **solo** `--accent*`, `--ink*`, `--paper*`. Nunca el hex
crudo ni el nombre de familia directamente.

---

## TYPOGRAPHY

Jerarquía editorial estricta. Tres familias, sin excepción.

| Rol | Token | Familia | Uso |
|---|---|---|---|
| Serif editorial | `--font-serif` | `"Source Serif 4", Georgia, "Times New Roman", serif` | Headlines, decks, pull quotes, cuerpo de lectura largo (carta del socio, memos, casos, white paper) |
| Grotesque neutra | `--font-sans` | `"IBM Plex Sans", system-ui, sans-serif` | Navegación, UI, labels, formularios, cuerpo de componentes densos, captions |
| Mono | `--font-mono` | `"IBM Plex Mono", ui-monospace, monospace` | Eyebrows, códigos de arcano (ARCANO 0–XXI), tablas de datos, metadatos, fechas |

> Reemplaza el set anterior (Plus Jakarta / Be Vietnam / Playfair / JetBrains Mono).
> `Source Serif 4` + `IBM Plex Sans` + `IBM Plex Mono` están en Google Fonts (carga
> permitida; Tailwind CDN no). Sin pesos display extravagantes.

### Reglas de cuerpo

- **Prosa larga → serif.** Interfaz / contenido estructurado → sans. (Patrón editorial clásico.)
- **Medida de lectura:** 60–75 caracteres (`max-width: 68ch`) para todo bloque de prosa.
- **Sin centrar prosa.** Headlines pueden ir a la izquierda; cuerpo siempre a la izquierda.
- **Eyebrows** en mono, mayúsculas, `letter-spacing: 0.08em`, tamaño `--step--1`, color `--accent`.

### Escala tipográfica (ratio 1.25, base 16px)

| Token | rem | px aprox | Uso |
|---|---|---|---|
| `--step--1` | 0.8rem | 12.8 | Captions, eyebrows, mono labels |
| `--step-0` | 1rem | 16 | Cuerpo base |
| `--step-1` | 1.25rem | 20 | Lead / subtítulos |
| `--step-2` | 1.563rem | 25 | H3 |
| `--step-3` | 1.953rem | 31 | H2 |
| `--step-4` | 2.441rem | 39 | H1 de página |
| `--step-5` | 3.052rem | 49 | Display de hero (`clamp(2.4rem, 5vw, 3.05rem)`) |

`line-height`: 1.6 cuerpo serif/sans largo; 1.2 headlines; 1.4 UI.

---

## LAYOUT

- **Grid:** 12 columnas, `max-width: 1200px`, gutter `--space-5` (24px), márgenes generosos.
- **Medida de prosa:** columna de texto a `68ch` dentro del grid (no ocupa las 12 columnas).
- **Alineación:** todo a la izquierda. Header y footer pueden distribuir con `space-between`.
- **Reglas (hairlines):** `1px solid var(--ink-rule)` para divisores de sección, bordes de tabla y separadores de tarjeta. La regla fina es el principal recurso de estructura.
- **Section Divider:** filete de 1px + eyebrow mono en `--accent` arriba a la izquierda.
- **Espaciado:** escala de 8px.

```
--space-1: 4px;   --space-6: 32px;
--space-2: 8px;   --space-7: 48px;
--space-3: 12px;  --space-8: 64px;
--space-4: 16px;  --space-9: 96px;
--space-5: 24px;  --space-10: 128px;
```

- **Radii:** `--radius: 2px` máximo (esquinas casi rectas). Sin pills, sin círculos decorativos.
- **Sombra:** prohibida como glow; permitida **una** sombra editorial sutil y plana para tarjetas elevadas: `0 1px 0 var(--ink-rule)` (línea, no nube). Preferir bordes a sombras.
- **Densidad:** alta en tablas/datos, aireada en prosa. Ritmo vertical consistente con la escala de espaciado.
- **Breakpoints:** `≥1024px` (desktop, 12 col), `640–1023px` (tablet, 8→6 col, nav colapsa a menú), `<640px` (móvil, 1 col, prosa full-width con márgenes `--space-5`).

---

## VOICE & COPY

La voz **canónica** del Gurú (PERSONA §3–§4: cómplice cínico, humor ácido,
contradicción deliberada, brevedad) se **preserva**. Cambia el **registro**, no la
persona.

### Registro consultora (el único cambio de voz)

- **Trato de usted**, no "tú/mijo". El Gurú mantiene distancia corporativa con el "cliente". (El cariño cómplice sigue, ahora seco.)
- **Idioma: español** neutro con sello mexicano (PERSONA §1). Sin spanglish gratuito.
- **Jerga de consultoría weaponizada:** "diagnóstico preliminar", "líneas de servicio", "diligencia kármica", "deuda técnica del alma", "optimización del karma operativo", "alineación de stakeholders cósmicos".
- **Understatement deadpan:** afirmaciones absurdas dichas con sequedad institucional. El chiste nunca se señala.
- **Catchphrases canónicas, adaptadas a usted:**
  - "Hoy las cartas indican que…" (antes "Hoy las cartas me dicen…")
  - "…y si eso le tranquiliza, créalo." (cierre cínico, en usted)
  - "Si llegó hasta aquí, ya sabe con quién trata." (antes "ya sabes quién soy")
- **Microcopy de error:** institucional pero con filo. P. ej.: *"El sistema oracular presenta latencia. Reintente su consulta."* (Nunca un stack trace plano.)
- **Firma del Socio:** *"El Gurú de Bits — Socio Fundador. Operando desde los espacios muertos entre paquetes."*

### Cómo NO suena (igual que PERSONA §4)

- No motivacional, no wellness, no tech-bro, no hype. No insulta de frente: pica, seco.
- Sin emoji. Sin signos de exclamación múltiples. Sin mayúsculas de grito.

### Muestras de copy por sección (referencia de registro)

- **Hero (Inicio):** *"Asesoría estratégica para organizaciones que ya agotaron las soluciones racionales."*
- **Área de práctica:** *"Diligencia Kármica — Evaluamos el pasivo espiritual oculto en su arquitectura de decisiones."*
- **Métrica de caso:** *"Reducción del 34% en deuda kármica técnica tras un compromiso de tres ciclos lunares."*
- **Disclaimer de footer:** *"Resultados obtenidos en líneas temporales anteriores no garantizan rendimientos futuros."*
- **CTA de admisión:** *"Solicitar evaluación preliminar"* (no "¡Empieza ya!").

> Todo el copy de ejemplo de la spec es **placeholder de registro**. La DEFINITION
> OF DONE exige que el copy final salga de la voz canónica, no de estos ejemplos.

---

## MOTION

Mínima, funcional, desactivable.

- Solo `opacity` y `transform` (≤ 8px de desplazamiento), duración `≤ 200ms`, `ease-out`.
- **Fade-in editorial** opcional al entrar secciones (sutil, una vez, sin rebote).
- Transiciones de hover en enlaces/botones: cambio de color `≤ 150ms`. Sin escalados llamativos.
- **Prohibido:** parallax, typewriter, scroll-jacking, carruseles autoplay, contadores animados, blobs en movimiento.
- **`prefers-reduced-motion: reduce`** desactiva **toda** animación y transición (regla global ya presente en `Layout.astro`; mantener).

---

## SITE MAP (AUTHORITATIVE)

7 rutas. La navegación expone **exactamente 6 enlaces** (todas menos Inicio; el
wordmark del header enlaza a Inicio).

```
/                 Inicio                     (acento: Navy / neutro)
/practica         Áreas de Práctica          (acento: Burgundy)
/metodologia      El Marco de los 22 Arcanos™ (acento: Forest)
/memos            Memos Trimestrales         (acento: Olive)
/archivo          Archivo de Compromisos     (acento: Burgundy)
/la-firma         Sobre la Firma             (acento: Forest)
/admision         Admisión de Clientes       (acento: Olive)
```

**Navegación (6 enlaces, en este orden):**
Áreas de Práctica · Metodología · Memos · Archivo · La Firma · Admisión.

> Slugs en español (URLs públicas de un sitio en español). Identificadores de
> código (componentes, tokens) en inglés, por convención del repo.

---

## REQUIRED COMPONENTS

Nombres de componente en inglés (código). Etiquetas visibles en español.

### Globales

- `TopNavigation` — wordmark "Bit Gurú · Asesoría Estratégica" + 6 enlaces + estado activo. Sticky discreto, sin sombra glow.
- `Footer` — directorio de secciones, disclaimer cínico, firma del socio, sin año o "© sin fecha".
- `EditorialHero` — eyebrow mono + H1 serif + deck + 1 CTA. Alineado a la izquierda, sin imagen de fondo.
- `PullQuote` — cita serif grande con filete de acento a la izquierda.
- `InsightCard` — tarjeta de memo (eyebrow + título + extracto + fecha mono).
- `CaseStudyCard` — tarjeta de compromiso (sector ficticio + título + métrica destacada).
- `MetricTable` — tabla de datos seca (hairlines, banda `--ink-wash`, números en mono).
- `SectionDivider` — filete 1px + eyebrow mono en `--accent`.
- `PartnerBiographyBlock` — bloque de bio del socio + retrato no-facial (ver § Imágenes).

### Áreas de Práctica (`/practica`)

- `ServiceCard` — tarjeta de línea de servicio (título + descripción deadpan + lista de entregables).
- `FrameworkDiagram` — diagrama a dos colores (`--ink` + `--accent`), geométrico, sin gradiente.

### Metodología (`/metodologia`)

- `WhitePaperLayout` — layout de documento largo: portada, secciones numeradas, notas al margen, índice.
- `TwoColorDiagram` — diagrama del marco de 22 dimensiones, dos colores estrictos.

### Memos (`/memos`)

- `MemoCard` — variante de `InsightCard` con número de memo (mono) y trimestre.
- `QuarterlyArchive` — índice cronológico agrupado por trimestre, tabla/lista hairline.

### Archivo de Compromisos (`/archivo`)

- `EngagementCard` — tarjeta de caso (variante de `CaseStudyCard`).
- `OutcomeMetricsTable` — variante de `MetricTable` con resultados del compromiso.

### Admisión (`/admision`)

- `IntakeForm` — formulario de admisión (campos de "evaluación preliminar"). Labels visibles, ayudas, estados de foco.
- `ConfirmationState` — estado de éxito ("Su solicitud ha sido recibida…").
- `ErrorState` — estado de error con microcopy cínico-institucional.

---

## PAGE-BY-PAGE CONTENT STRUCTURE

### `/` — Inicio (acento: Navy / neutro)

Contenido **exacto** (acceptance criteria), en este orden:

1. **Partner Letter** — `EditorialHero` + carta del Socio Fundador (prosa serif, firma).
2. **About the Firm** — `SectionDivider` + párrafo institucional breve sobre la firma.
3. **3 Featured Insights** — exactamente **3** `InsightCard` (ni 2 ni 4).
4. **Principal Portrait** — `PartnerBiographyBlock` con retrato no-facial del socio.

Sin más secciones. El home no usa familia de acento: solo Navy + Neutrals.

### `/practica` — Áreas de Práctica (acento: Burgundy)

- `EditorialHero` (deck sobre las líneas de servicio).
- Rejilla de `ServiceCard` (líneas de servicio ficticias derivadas de los temas de PERSONA §5).
- `FrameworkDiagram` que conecta las áreas con el marco de los 22 arcanos.

### `/metodologia` — El Marco de los 22 Arcanos™ (acento: Forest)

- `WhitePaperLayout` presentando los **22 arcanos** (de `lib/tarot.ts`) como las
  **22 dimensiones diagnósticas** del marco propietario.
- `TwoColorDiagram` del marco completo.
- Cada arcano se reencuadra como una dimensión de evaluación (deadpan), citando su
  código romano (0–XXI) en mono. **No se renombran los arcanos** (canon PERSONA §7).

### `/memos` — Memos Trimestrales (acento: Olive)

- `EditorialHero` breve.
- `QuarterlyArchive` con `MemoCard`s. Cada memo = una "sabiduría" del Gurú
  reencuadrada como nota trimestral de la firma (fuente: `GET /api/wisdom-tweet`).
- Epígrafes opcionales de `GET /api/morpheus-quotes` como aperturas de memo.

### `/archivo` — Archivo de Compromisos (acento: Burgundy)

- `EditorialHero`.
- Rejilla de `EngagementCard` (casos ficticios, sectores absurdos: "una DAO en duelo", "un fondo de inversión poseído").
- Cada caso abre a `OutcomeMetricsTable` con métricas deadpan.

### `/la-firma` — Sobre la Firma (acento: Forest)

- `EditorialHero`.
- Historia institucional = el lore de PERSONA §2 reencuadrado en corporativo
  ("Fundada en los espacios muertos entre paquetes…"), sin romper el misterio (§2 reglas).
- `PartnerBiographyBlock` del Socio Fundador.
- Principios de la firma (PullQuotes).

### `/admision` — Admisión de Clientes (acento: Olive)

- `EditorialHero` ("Solicitar evaluación preliminar").
- `IntakeForm`: el cliente describe su "problema estratégico"; al enviar se invoca
  el oráculo y se devuelve un **diagnóstico preliminar** (3 arcanos + interpretación).
- `ConfirmationState` y `ErrorState` con copy de registro.

---

## ANCLAJE AL BACKEND EXISTENTE

El rediseño es **solo de presentación**. Reusa los endpoints ya `done`:

| Página / componente | Endpoint existente | Reencuadre |
|---|---|---|
| `/admision` `IntakeForm` (envío) | `POST /api/reading` | "Diagnóstico preliminar" (3 arcanos + interpretación) |
| `/admision` (consulta libre) | `POST /api/pregunta` | "Consulta al Socio" |
| `/memos` `MemoCard` | `GET /api/wisdom-tweet` | "Memo trimestral" |
| `/memos` epígrafes | `GET /api/morpheus-quotes` | Aperturas de memo |
| `/metodologia` dimensiones | `lib/tarot.ts` (22 arcanos) | "22 dimensiones del marco" |
| `/practica` `FrameworkDiagram` | `lib/tarot.ts` | Mapa de áreas ↔ arcanos |

**Prohibido** tocar `frontend-astro/src/lib/` y `frontend-astro/src/pages/api/`.
Si la UI necesita datos nuevos, se documenta como decisión abierta — no se improvisa
un endpoint en esta spec (OUTPUT CONTRACT: no backend, no API).

---

## CSS TOKEN SYSTEM

Bloque base para `Layout.astro` (`<style is:global>`). Las páginas añaden **solo**
el mapeo `--accent*` de su familia en su scope. Reemplaza el bloque de tokens neón
actual.

```css
:root {
  /* NEUTRALS — papel y superficies (light-only) */
  --paper:        #F6F4EE;
  --paper-pure:   #FFFFFF;
  --paper-shade:  #EDEAE1;
  --paper-deep:   #E4E0D4;

  /* NAVY — tinta y estructura (global) */
  --ink-deep:  #0B1B2D;
  --ink:       #16293B;
  --ink-muted: #4B5965;
  --ink-rule:  #C7CFD6;
  --ink-wash:  #E7EBEF;

  /* BURGUNDY */
  --burgundy-deep:   #5E1325;
  --burgundy:        #7C1D33;
  --burgundy-bright: #9A2A43;
  --burgundy-wash:   #F0E2E4;

  /* OLIVE */
  --olive-deep:   #3A380F;
  --olive:        #54501A;
  --olive-bright: #6E6826;
  --olive-wash:   #ECEADA;

  /* FOREST */
  --forest-deep:   #0E3026;
  --forest:        #1A4636;
  --forest-bright: #285E48;
  --forest-wash:   #DFEAE4;

  /* Acento por defecto (Inicio = neutro Navy) */
  --accent-deep:   var(--ink-deep);
  --accent:        var(--ink);
  --accent-bright: var(--ink-deep);
  --accent-wash:   var(--ink-wash);

  /* Tipografía */
  --font-serif: "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-sans:  "IBM Plex Sans", system-ui, sans-serif;
  --font-mono:  "IBM Plex Mono", ui-monospace, monospace;

  /* Escala tipográfica (ratio 1.25) */
  --step--1: 0.8rem;
  --step-0:  1rem;
  --step-1:  1.25rem;
  --step-2:  1.563rem;
  --step-3:  1.953rem;
  --step-4:  2.441rem;
  --step-5:  3.052rem;

  /* Espaciado (8px) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 96px; --space-10: 128px;

  /* Forma */
  --radius: 2px;
  --measure: 68ch;
}

/* Mapeo de acento por página — se aplica en <body data-accent="..."> */
[data-accent="burgundy"] {
  --accent-deep: var(--burgundy-deep);   --accent: var(--burgundy);
  --accent-bright: var(--burgundy-bright); --accent-wash: var(--burgundy-wash);
}
[data-accent="olive"] {
  --accent-deep: var(--olive-deep);   --accent: var(--olive);
  --accent-bright: var(--olive-bright); --accent-wash: var(--olive-wash);
}
[data-accent="forest"] {
  --accent-deep: var(--forest-deep);   --accent: var(--forest);
  --accent-bright: var(--forest-bright); --accent-wash: var(--forest-wash);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

> Patrón de uso: cada página fija su acento con `<body data-accent="forest">` (o el
> que corresponda). Los componentes consumen solo `--accent*`, `--ink*`, `--paper*`.

---

## ACCESSIBILITY CHECKLIST (WCAG AA)

- [ ] Todo texto de cuerpo cumple **contraste ≥ 4.5:1** sobre su fondo. Verificado: `--ink` 13.3:1, `--ink-muted` 6.4:1, `--burgundy` 9.2:1, `--olive` 7.5:1, `--forest` 9.8:1 (todos sobre `--paper`).
- [ ] Texto grande (≥ 24px o ≥ 19px bold) cumple **≥ 3:1**.
- [ ] **Foco visible** en todo elemento interactivo: `outline: 2px solid var(--accent); outline-offset: 2px`. Nunca `outline: none` sin reemplazo.
- [ ] Orden de tabulación lógico; navegación operable por teclado.
- [ ] Jerarquía de encabezados correcta (un solo `<h1>` por página, sin saltos de nivel).
- [ ] Landmarks semánticos: `<header>`, `<nav>`, `<main>`, `<footer>`. Skip-link al `<main>`.
- [ ] `IntakeForm`: `<label>` asociado a cada campo, mensajes de error vinculados con `aria-describedby`, `aria-invalid` en error, `:focus-visible` claro.
- [ ] `ConfirmationState` / `ErrorState` con `role="status"` / `role="alert"` y `aria-live`.
- [ ] `MetricTable` / `OutcomeMetricsTable`: `<th scope>`, `<caption>`, semántica de tabla real (no divs).
- [ ] El color **no** es el único portador de información (los enlaces se distinguen por subrayado o peso, no solo por `--accent`).
- [ ] `prefers-reduced-motion: reduce` desactiva toda animación/transición.
- [ ] Imágenes/diagramas con `alt` significativo; el retrato no-facial describe lo que representa.
- [ ] Zoom a 200% sin pérdida de contenido ni scroll horizontal; `font-size` en `rem`.
- [ ] `lang="es"` en `<html>`. `<title>` único y descriptivo por página.

---

## IMAGES & ILUSTRACIÓN

- **Sin fotos, sin caras, sin fotorrealismo** (HARD PROHIBITIONS).
- Retrato del Socio = **marca tipográfica / sello editorial** o ilustración a una tinta:
  silueta encapuchada en line-art a `--ink` sobre `--paper`, **sin rostro**, o un
  monograma "BG" tipo sello de informe. Una sola tinta + acento opcional.
- Diagramas: geométricos, **dos colores estrictos** (`--ink` + `--accent`), sin gradiente, sin sombra.
- Iconografía: line-icons mono a 1.5px stroke, color `--ink` o `--accent`. Nada de íconos rellenos coloridos.

---

## IMPLEMENTATION STRATEGY

Implementar en este orden (cada fase es una o más features de `feature_list.json`):

**Phase 1 — Cimientos**
- Design tokens (CSS token system en `Layout.astro`).
- Tipografía (carga de fuentes + escala + reglas de cuerpo).
- Layout primitives (grid, medida, espaciado, `SectionDivider`, hairlines).

**Phase 2 — Chrome compartido**
- `TopNavigation` (6 enlaces, estado activo, wordmark).
- `Footer`.
- Componentes compartidos: `EditorialHero`, `PullQuote`, `InsightCard`, `MetricTable`, `PartnerBiographyBlock`.

**Phase 3 — Páginas núcleo**
- `/` Inicio (Partner Letter · About · 3 Insights · Principal Portrait).
- `/practica` (`ServiceCard`, `FrameworkDiagram`).
- `/metodologia` (`WhitePaperLayout`, `TwoColorDiagram`).

**Phase 4 — Páginas de contenido**
- `/memos` (`MemoCard`, `QuarterlyArchive`).
- `/archivo` (`EngagementCard`, `OutcomeMetricsTable`).
- `/la-firma`.
- `/admision` (`IntakeForm`, `ConfirmationState`, `ErrorState` — cableado a endpoints existentes).

**Phase 5 — Auditorías**
- Accessibility audit (checklist completo).
- Motion audit (sin movimiento prohibido; `prefers-reduced-motion` OK).
- Palette audit (cero hex fuera de tokens; una familia de acento por página; sin gradiente/glow/dark mode).

---

## ACCEPTANCE CRITERIA

El rediseño se considera exitoso **solo si**:

- [ ] La navegación contiene **exactamente 6** enlaces.
- [ ] Ninguna página usa más de **una** familia de acento.
- [ ] **No** existen gradientes.
- [ ] **No** existen efectos de glow/neón.
- [ ] **No** existe dark mode.
- [ ] **No** existe fotografía de stock.
- [ ] **No** hay ningún rostro humano visible.
- [ ] Cada página pasa **WCAG AA**.
- [ ] Cada página usa **jerarquía editorial**.
- [ ] El Inicio contiene **exactamente**:
  - Partner Letter
  - About the Firm
  - 3 Featured Insights
  - Principal Portrait
- [ ] Todo color usado existe como **DESIGN TOKEN** (cero hex sueltos).
- [ ] No se carga Tailwind por CDN.
- [ ] No se modificó `frontend-astro/src/lib/` ni `frontend-astro/src/pages/api/`.
- [ ] `init.ps1` sigue verde y `npm test --prefix frontend-astro` pasa al 100%.

---

## DEFINITION OF DONE

El proyecto está completo **solo cuando**:

- Cada página sigue el **registro consultora** (usted, deadpan, español canónico).
- Cada página sigue la **disciplina de paleta** (Navy + Neutrals + una familia de acento).
- Todo el **copy placeholder** fue reemplazado por copy de la voz canónica.
- Todos los componentes usan **design tokens** (sin hex sueltos).
- Se satisfacen los **requisitos de accesibilidad** (checklist WCAG AA completo).
- **No queda** ningún elemento visual prohibido.
- El sitio se siente **más cerca de McKinsey que de una startup**.
- El parody se transmite **exclusivamente** por el contenido.
- `init.ps1` verde, tests al 100%, repo limpio.

---

## RELACIÓN CON EL CANON (registro de decisión)

- **2026-06-08** — Decisión del dueño: este rediseño **sustituye a PERSONA §8
  (Estética Visual)** y a `docs/design/design_brief.md`. La estética deadpan
  corporativa pasa a ser la canónica para el sitio.
- **Voz preservada:** PERSONA §1–§7 siguen siendo fuente de verdad. El único cambio
  de voz es el **registro** (tú/mijo → usted), no la persona.
- **Pendiente (requiere OK explícito, PERSONA §9):** actualizar `PERSONA.md §8` y la
  cabecera de `design_brief.md` para reflejar que esta spec los reemplaza. No se hizo
  en este paso para no tocar el canon sin confirmación del cambio puntual.
- **Conflicto conocido:** la UI de la feature 13 (commit `92eba7e`, paleta neón
  morado/cyan/negro) queda **obsoleta**. Su reemplazo es el alcance de la Phase 1–4
  de arriba.
```
