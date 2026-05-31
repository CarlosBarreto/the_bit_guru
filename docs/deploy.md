# docs/deploy.md — Runbook de deploy a Vercel (preview)

> Cómo se despliega bit_guru a Vercel. La app Astro vive en el subdirectorio
> `frontend-astro/` y usa el adapter `@astrojs/vercel` en modo SSR
> (`output: "server"`). El build genera `.vercel/output/` (Build Output API);
> **no se necesita `vercel.json`**.

---

## 1. Proyecto en Vercel (una sola vez)

- Importar el repo `CarlosBarreto/bitsGuru` desde el Dashboard de Vercel.
- **Root Directory = `frontend-astro`** (crítico: la app no está en la raíz del repo).
- Framework Preset: **Astro** (autodetectado). Build/Output/Install: defaults.

## 2. Variables de entorno

| Variable | Dónde | Scope |
|----------|-------|-------|
| `GEMINI_API_KEY` | Settings → Environment Variables | Preview (y Production) |

- La clave **nunca** va en el código ni en el repo. `lib/gemini.ts` la lee de
  `import.meta.env.GEMINI_API_KEY`.
- **Local:** la key debe estar en `frontend-astro/.env` (lo que Vite/Astro carga).
  El `.env` de la raíz (cargado por `Load-Env.ps1`) **no** lo ve Astro.
- Rotación: si la key se bloquea en Google Cloud, rotar y actualizar tanto en
  Vercel como en `frontend-astro/.env`.

## 3. Deploys

- `main` → Production. Cualquier otra rama → **Preview automático**.
- Cada push a `feat/migrate-to-vercel` (con Vercel ya conectado) genera un
  Preview Deployment nuevo.
- Si una rama no tiene preview tras conectar el repo, pushear un commit nuevo
  a esa rama lo dispara.

## 4. Smoke de los 7 endpoints (en la URL de preview)

```powershell
$URL = "https://<tu-preview>.vercel.app"
curl "$URL/api/morpheus-quotes"
curl "$URL/api/tirada"
curl "$URL/api/wisdom-tweet?tema=cripto"
curl -X POST "$URL/api/pregunta"     -H "Content-Type: application/json" -d '{"pregunta":"¿qué me depara?"}'
curl -X POST "$URL/api/reading"      -H "Content-Type: application/json" -d '{}'
curl -X POST "$URL/api/fan-response" -H "Content-Type: application/json" -d '{"mensaje":"te amo gurú"}'
curl -X POST "$URL/api/create-image" -H "Content-Type: application/json" -d '{}'
```

- `morpheus-quotes` y `tirada` no usan Gemini → responden sin `GEMINI_API_KEY`.
- `pregunta`, `reading`, `wisdom-tweet`, `fan-response` requieren la env var
  configurada en Vercel; si dan 502, revisar `GEMINI_API_KEY`.

## 5. Cierre

- Documentar la URL del primer preview verde en `progress/history.md`.
- Marcar feature 11 `done` en `feature_list.json` tras confirmar los 7 endpoints en 200.
