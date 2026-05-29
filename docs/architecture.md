# docs/architecture.md — Arquitectura de bit_guru

## Objetivo del proyecto

Agente influencer digital para LATAM cuya voz canónica es **El Gurú de Bits**
(ver `PERSONA.md`). Publica lecturas de tarot cibernético, tweets de sabiduría
y responde a fans. El motor de generación es **Google Gemini** mediado por
endpoints serverless.

**Fuera de objetivo:** ser un sitio interactivo 1-a-1 (el pivote del 2026-05-28
lo movió a "agente para publicación en redes"). El frontend Astro existe pero
es vehículo de testing/demo, no producto.

## Stack

- **Lenguaje principal:** TypeScript
- **Framework:** Astro (mode `output: 'server'`) — frontend + endpoints
  serverless en un mismo proyecto ("Astro unified").
- **Deploy:** Vercel (`@astrojs/vercel` adapter).
- **Modelo IA:** Google Gemini vía SDK `@google/genai`.
- **Estructura de código:** `frontend-astro/src/`
- **Estructura de tests:** `frontend-astro/tests/` (Vitest)
- **Comando de tests:** `npm test --prefix frontend-astro`

## Módulos y capas

```
frontend-astro/
├── src/
│   ├── pages/               # Páginas Astro (UI, demo/testing)
│   │   ├── index.astro
│   │   ├── zoltar.astro
│   │   └── api/             # Endpoints serverless — capa de aplicación
│   │       ├── morpheus-quotes.ts    # estática, sin Gemini
│   │       ├── tirada.ts
│   │       ├── pregunta.ts
│   │       ├── reading.ts
│   │       ├── wisdom-tweet.ts
│   │       ├── fan-response.ts
│   │       └── create-image.ts
│   ├── lib/                 # Capa de dominio (puro, sin I/O)
│   │   ├── tarot.ts         # 22 arcanos cibernéticos (canónicos)
│   │   ├── persona.ts       # prompt-base derivado de PERSONA.md
│   │   └── gemini.ts        # wrapper del SDK (single point of contact)
│   └── utils/               # Helpers transversales
└── tests/                   # Vitest — espejo de rutas de src/
```

**Capas (de afuera hacia adentro):**

1. `pages/api/` — capa de entrada. Valida input, llama a `lib/`, formatea respuesta.
2. `lib/` — dominio puro. No conoce HTTP. Lo único que llama al exterior es
   `lib/gemini.ts`, que aísla el SDK.
3. `utils/` — helpers neutros (logging, errors, etc.).

**Regla de dependencias:** `pages/` → `lib/` → `utils/`. Nunca al revés.

## Fuera de scope (no editar)

- **`legacy/backend-php/`** — versión PHP previa, congelada en tag
  `v0.1-php-final`. Referencia documental, no se edita.
- **`PERSONA.md`** (raíz) — fuente de verdad de la voz. Cambios requieren
  conversación explícita con el dueño (ver §9 del PERSONA.md).

## Dependencias externas permitidas

| Paquete            | Para qué                                | Notas |
|--------------------|------------------------------------------|-------|
| `astro`            | Framework                                | core |
| `@astrojs/vercel`  | Adapter de despliegue                    | core |
| `@google/genai`    | SDK Gemini                               | único cliente de modelo |
| `vitest`           | Tests                                    | dev |
| `@types/node`      | Tipos                                    | dev |

Cualquier dependencia fuera de esta lista requiere actualización de este doc
+ aprobación del dueño. El reviewer rechaza imports no listados.

## Restricciones no negociables

- **No hardcodear `GEMINI_API_KEY`.** Solo `import.meta.env.GEMINI_API_KEY` o
  equivalente Vercel. Incidente previo: clave expuesta en repo público,
  bloqueada por Google Cloud (2026-05-28).
- **La voz se cita, no se redefine.** Los endpoints construyen prompts
  consumiendo `lib/persona.ts`, no re-escribiendo el tono inline. Una sola
  fuente de verdad: `PERSONA.md` → `lib/persona.ts`.
- **No I/O fuera de `lib/gemini.ts` y `pages/api/`.** El dominio (`lib/`)
  permanece testable sin red.
- **Errores controlados a HTTP**: cada endpoint devuelve status code claro
  (400 input inválido, 502 Gemini caído, 500 otros). Nunca `throw` sin
  manejo.
- **Sin secretos en logs.** Si se loguea el prompt o la respuesta, el
  payload va sin la API key.

## Decisiones abiertas

- **Canal de publicación MVP.** X/Twitter es la apuesta (memoria
  `project_bit_guru_pivot`), pero el endpoint scheduler aún no está
  diseñado. Decisión pendiente: ¿API de X directa, Buffer, o cron + webhook?
- **Storage de lecturas históricas.** Hoy stateless. Si se quiere
  recurrencia ("hace 3 días te leí esto"), necesita storage. Pendiente.
- **Idioma de los endpoints.** Hoy todos español. Inglés está declarado en
  PERSONA pero no implementado. Pendiente parametrización.
