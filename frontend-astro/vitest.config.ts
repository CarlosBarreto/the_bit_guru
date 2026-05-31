/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

// Usa la config de Vite de Astro para que vitest pueda compilar componentes
// `.astro` (necesario para el Astro Container API en tests de componentes).
// Los tests de `lib/` y `pages/api/` (TS puro) siguen funcionando igual.
export default getViteConfig({
  test: {
    // Container API renderiza HTML; no necesita DOM de navegador.
    environment: "node",
  },
});
