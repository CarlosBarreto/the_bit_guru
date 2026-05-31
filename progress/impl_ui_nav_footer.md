# Implementer paralelo — feature 13 (UI): Nav + Footer

> Implementer 3 del lote paralelo. Solo toqué Nav.astro, Footer.astro y sus tests.

## Qué hice

### Nav.astro (`src/components/Nav.astro`)
- `<nav id="nav">` sticky (`position: sticky; top:0; z-index:1000`), fondo translúcido
  sobre `--bg` con `backdrop-filter: blur`, borde inferior morado.
- Marca "El Gurú de Bits" en `--font-head`, acento "de Bits" en `--morado-claro`.
- Links a `#tarot`, `#consulta`, `#sabiduria` con hover en `--cyan`.
- CTA único "PIDE TU LECTURA" → `#consulta` (sin duplicar "DAME UNA SEÑAL", brief §2),
  estilo `--morado`/`--font-mono`.
- `aria-label="Navegación principal"`; links se ocultan <640px.

### Footer.astro (`src/components/Footer.astro`)
- `<footer id="footer">` con fondo `var(--surface-footer)`, centrado.
- Tagline cínico con literal **"…y si eso te tranquiliza, créelo."** y bio
  "Habitando los espacios muertos entre paquetes…".
- Frase canónica **"Si llegaste hasta aquí, ya sabes quién soy."** en `--font-mono`/`--morado-claro`.
- Meta sin año fijo ("fuera del tiempo"). NADA de "2024".

## Paleta
- Solo tokens canónicos vía `var(--...)`. Sin ámbar (`#ffb954`/`#ffddb4`), sin `--rosa`
  (reservado al CTA de tirada), sin `cdn.tailwindcss.com`.

## Tests
- `tests/components/Nav.test.ts`: 7 tests — landmark/marca, 3 links, CTA, aria-label,
  sticky + tokens, sin ámbar/CDN, sin --rosa.
- `tests/components/Footer.test.ts`: 7 tests — landmark, frase canónica + "créelo",
  sin "2024", surface-footer, sin ámbar/CDN/--rosa.

### Resultado
```
npx vitest run tests/components/Nav.test.ts tests/components/Footer.test.ts
Test Files  2 passed (2)
Tests       14 passed (14)
```

## Notas
- Método 1 (Container API) para markup/copy; método 2 (readFileSync) para tokens en `<style>`
  (no aparece en renderToString), conforme al patrón de fundación.
- No marqué `done`, no commiteé, no toqué archivos fuera de mi alcance.
