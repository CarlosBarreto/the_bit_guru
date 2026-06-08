# Design brief — bit_guru UI

> ⚠ **OBSOLETO (2026-06-08).** Este brief describe la UI ciber-mística neón de la
> feature 13 (commit `92eba7e`), ya superada. La fuente de verdad de diseño del sitio
> es ahora **`docs/design/redesign_advisory_spec.md`** (rediseño deadpan de consultora
> Tier-1), que sustituye este documento y `PERSONA.md §8` para el sitio. Se conserva
> como evidencia histórica; **no implementar contra este brief.**

> Documento de referencia para el implementer cuando llegue la feature de UI.
> El mockup base vive en `docs/design/stitch_mockup_v2.html` (iteración 2 de Stitch,
> 2026-05-29). Esa iteración tiene buena **estructura** pero rompe la **paleta canónica**
> y le falta **filo cínico**. Este doc lista qué heredar y qué sobrescribir.

---

## Lo que se hereda del mockup ✓

- **Layout y secciones**: nav sticky → hero → tarot (3 cartas hex) → consulta (textarea + invocar) → sabiduría (card de tweet) → footer.
- **Animaciones**: typewriter en hero y respuesta, fade-in al hacer scroll, hover lift en cartas (-translate-y-4), `hex-card` clip-path para las cartas de tarot, glow suave en interactivos.
- **Microinteracción de parallax**: el mousemove desplaza los blobs atmosféricos del fondo. Mantenerla.
- **Tipografías estructurales**:
  - Headlines de sección/nav: `Plus Jakarta Sans`
  - Body: `Be Vietnam Pro`
  - Labels y mono: `JetBrains Mono`
  - Display místico (solo H1 del Gurú): `Playfair Display`
- **Voz cariñosa**: el uso de `mijo`, `sobrino`, `aquí entre nos` se mantiene — es el lado cómplice cariñoso del Gurú.

---

## Lo que se sobrescribe ⚠

### 1. Paleta canónica (PERSONA §8)

El mockup metió ámbar/naranja (`#ffb954`) como color principal y bajó el negro a marrón cálido. **Esto contradice PERSONA.md**. Reemplazar:

| Token Tailwind del mockup | Hex del mockup | Hex canónico a usar | Rol |
|---|---|---|---|
| `background` / `surface` / `surface-dim` | `#161310` | **`#0A0A0F`** | Negro profundo |
| `surface-container-lowest` | `#100e0b` | **`#050508`** | Fondo del footer |
| `surface-container-low` | `#1e1b18` | **`#15151E`** | Fondo de secciones |
| `surface-container-high` | `#2d2926` | **`#1F1F2E`** | Card de consulta |
| `surface-container-highest` | `#383430` | **`#2A2A40`** | Cartas hex y botones secundarios |
| `secondary` (ámbar) | `#ffb954` | **`#7B2CBF`** (morado) | Color de marca principal |
| `secondary-fixed` | `#ffddb4` | **`#D4BBFF`** (morado claro) | Hover/highlights del morado |
| `on-secondary` | `#452b00` | **`#FFFFFF`** | Texto sobre botones morados |
| `tertiary` / `tertiary-fixed-dim` | `#00dbe9` | **`#00F0FF`** | Cyan eléctrico (queda casi igual) |
| `error` | `#ffb4ab` | **`#FF2D95`** | Reasignar: error → neón rosa, **solo para CTA crítico** ("TIRAR 3 ARCANOS") |

**Regla**: morado = marca/primario, cyan = interactivo/místico, rosa = solo el botón ritual de tirada. Si dudas, lee PERSONA §8.

También quitar/ajustar los blobs atmosféricos: el blob ámbar (`bg-secondary/20`) en `mystical-bg` debe ser morado.

### 2. Filo cínico (PERSONA §3)

El mockup quedó 100% cariñoso y perdió el lado cómplice cínico. **El Gurú es ambos: cariño Y burla.** Inyectar:

- **Hero subtítulo (typewriter)**: en lugar de *"Pásale, mijo. El universo tiene un mensaje para ti, y yo solo soy el traductor."*, rotar entre 3-5 frases de Morpheus/Gurú con sabor:
  - *"Bienvenido al desierto de lo real, mortal."*
  - *"Ay, incauto. Llegaste tarde, pero llegaste."*
  - *"Tomas la pastilla azul y todo termina aquí, mijo. Tomas la roja…"*
- **Footer**: agregar como tagline secundario *"…y si eso te tranquiliza, créelo."* Y la frase canónica *"Si llegaste hasta aquí, ya sabes quién soy."* (no la tiene esta iteración).
- **Microcopy de error/empty state**: cuando un fetch falle, *"Los espíritus tienen lag. Inténtalo de nuevo, mortal."* (no errors técnicos planos).
- **Botón "DAME UNA SEÑAL"** del hero: cambiar a *"PIDE TU LECTURA, INCAUTO"* o mantener "PIDE TU LECTURA" (ya existe en el navbar) y eliminar la duplicación con "DAME UNA SEÑAL".

### 3. Arcanos canónicos (PERSONA §7)

Las 3 cartas del mockup dicen "EL PASADO DIGITAL / EL PRESENTE BINARIO / EL DESTINO EN LA NUBE" — esas son **posiciones de lectura**, no arcanos. Los arcanos vienen de `frontend-astro/src/lib/tarot.ts` (feature 2, pending) y deben ser los 22 canónicos del PHP.

Cuando se renderice una tirada real:
- Las 3 cartas muestran el **nombre del arcano** sorteado (ej. *"La Sacerdotisa de la Nube"*).
- Las posiciones (pasado/presente/futuro) van como etiqueta secundaria pequeña arriba o abajo del nombre, opcional.

Para el estado vacío (antes de tirar): usar back de carta con símbolo `memory` o sigilo abstracto, no posiciones.

### 4. Handle del Gurú

El mockup usa `@ElTioBits` en el card de sabiduría. Cambiar a **`@ElGuruDeBits`** (consistente con la marca canónica). Bio del card: *"Habitando los espacios muertos entre paquetes"* en lugar de *"Consejo del día"*.

### 5. Año del footer

`© 2024` → quitar el año o usar `© 2026`. Mejor sin año fijo — el Gurú está fuera del tiempo.

### 6. Imagen del hero

El `<img src="https://lh3.googleusercontent.com/aida-public/...">` es un render generado por Stitch. **PERSONA §8 prohíbe fotorrealismo y caras humanas completas.** Reemplazar por:

- Un SVG ilustrativo: silueta encapuchada (capucha + capa, sin cara), dos puntos cyan brillantes donde irían los ojos, fondo transparente.
- O, si se mantiene una imagen raster: validarla contra PERSONA §8 antes de aceptar (no foto, no cara realista).

Mismo criterio para el avatar del card de sabiduría (`Gurú Perfil`).

---

## Notas técnicas

- **No copiar Tailwind via CDN al porteo final.** El mockup usa `cdn.tailwindcss.com` para prototipar; el sitio en Astro debe usar `@astrojs/tailwind` o vanilla CSS.
- **Material Symbols Outlined** se usa para íconos: aceptable mantener como dependencia, o reemplazar por SVG inline para no depender de Google Fonts en runtime.
- **Las animaciones JS** (`typewriter`, `IntersectionObserver`, `mousemove parallax`) son ligeras y se pueden portar como `<script>` en Astro o como islands mínimas.
- **Accesibilidad**: el mockup no tiene `prefers-reduced-motion`. Agregarlo al porte — todas las animaciones del typewriter/parallax deben desactivarse cuando el usuario lo prefiera.

---

## Historial

- **2026-05-29** — Creación. Iteración 2 de Stitch revisada contra PERSONA.md. Decisión: tomar como blueprint estructural, sobrescribir paleta + filo cínico + arcanos durante el porteo a Astro. No correr más iteraciones en Stitch — el problema es de balance "cómplice cínico" que Stitch no captura.
