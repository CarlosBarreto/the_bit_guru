# docs/verification.md — Cómo verificar el trabajo

## Comando canónico de verificación

```
.\init.ps1
```

`init.ps1` valida:

1. Existencia de los archivos base del arnés.
2. Sintaxis de `feature_list.json` y consistencia de estados.
3. `npm test --prefix frontend-astro` (Vitest) — verde si toda feature tiene
   sus tests pasando.

Si termina con exit code 0, el entorno está verde y se puede declarar `done`.

## Qué cuenta como "feature verificada"

Una feature solo puede pasar a `done` si:

1. `.\init.ps1` termina verde (incluye tests).
2. Existe al menos un test que cubre cada criterio de `acceptance` de la
   feature en `feature_list.json`.
3. **Si la feature toca un endpoint que llama a Gemini:** existe además un
   smoke manual contra `npm run dev --prefix frontend-astro` ejecutado por
   el dueño con `GEMINI_API_KEY` real. El implementer no puede declarar
   done sin recibir confirmación del smoke.
4. El reviewer ha emitido `APPROVED -> ver progress/review.md`.

## Cómo correr tests aisladamente

```bash
# Un archivo:
npm test --prefix frontend-astro -- tests/lib/tarot.test.ts

# Un test específico (filtro por nombre):
npm test --prefix frontend-astro -- -t "construye prompt con persona"

# Watch mode durante desarrollo:
npm run test:watch --prefix frontend-astro
```

## Linter / formatter

```bash
npm run lint --prefix frontend-astro
npm run format --prefix frontend-astro
```

Se corre antes de cada commit. CI (cuando exista) lo correrá también.

## Smoke tests / verificación manual

Para endpoints en `pages/api/`:

1. Levanta el dev server: `npm run dev --prefix frontend-astro`.
2. Hit con `curl` o cliente equivalente:
   ```bash
   # Estático (sin Gemini):
   curl http://localhost:4321/api/morpheus-quotes

   # Con Gemini (requiere GEMINI_API_KEY en .env):
   curl -X POST http://localhost:4321/api/pregunta \
     -H "Content-Type: application/json" \
     -d '{"pregunta": "¿voy a triunfar en redes?"}'
   ```
3. Verifica que la respuesta tenga el tono de PERSONA.md (no genérico, no
   wellness, no motivacional). Si suena a Coach Genérico AI, **el endpoint
   no está listo aunque pase tests**.

## Verificación de despliegue (Vercel)

Pre-publicación a producción:

1. `npm run build --prefix frontend-astro` debe terminar sin errores.
2. Preview de Vercel desde el branch verde antes de mergear a `main`.
3. Smoke en URL de preview de los endpoints clave (`morpheus-quotes`,
   `wisdom-tweet`).
