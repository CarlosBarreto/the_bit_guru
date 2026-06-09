// src/components/nav-links.ts — feature 16 (redesign_nav_footer).
// Fuente de verdad única del directorio de secciones del sitio
// (docs/design/redesign_advisory_spec.md § SITE MAP). La navegación expone
// EXACTAMENTE 6 enlaces (todas las rutas menos Inicio; el wordmark del header
// enlaza a Inicio). TopNavigation y Footer consumen este mismo array para que
// no se dupliquen ni se desincronicen las rutas. Slugs en español (URLs
// públicas de un sitio en español); identificadores en inglés (convención).

export interface NavLink {
  /** Ruta pública (slug en español). */
  href: string;
  /** Etiqueta visible (español). */
  label: string;
}

// Orden autoritativo de la spec § SITE MAP:
// Áreas de Práctica · Metodología · Memos · Archivo · La Firma · Admisión.
export const NAV_LINKS: NavLink[] = [
  { href: "/practica", label: "Áreas de Práctica" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/memos", label: "Memos" },
  { href: "/archivo", label: "Archivo" },
  { href: "/la-firma", label: "La Firma" },
  { href: "/admision", label: "Admisión" },
];

/** Ruta del wordmark del header (Inicio). */
export const HOME_HREF = "/";

/**
 * Normaliza un pathname para comparar contra los hrefs del directorio:
 * recorta la barra final (salvo en la raíz) para que `/memos/` y `/memos`
 * marquen el mismo enlace activo.
 */
export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
