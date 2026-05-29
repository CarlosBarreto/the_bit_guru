# docs/verification.md — Cómo verificar el trabajo

> **Stub generado por soft-harness.** Rellena antes de empezar — sin esto, no
> hay forma objetiva de cerrar una feature.

## Comando canónico de verificación

```
.\init.ps1
```

`init.ps1` corre `npm test --prefix frontend-astro` automáticamente. Si termina con exit code 0,
el entorno está verde.

## Qué cuenta como "feature verificada"

Una feature solo puede pasar a `done` si:

1. `.\init.ps1` termina verde (incluye tests).
2. Existe al menos un test que cubre cada criterio de `acceptance` de la
   feature en `feature_list.json`.
3. El reviewer ha emitido `APPROVED -> ver progress/review.md`.

## Cómo correr tests aisladamente

(Comandos para correr un subset — útil mientras desarrollas. Ej:
`pytest tests/test_storage.py::test_save_atomic`,
`npm test -- --watch storage`, etc.)

## Linter / formatter

(Si aplica: comando + cuándo se ejecuta.)

## Smoke tests / verificación manual

(Si la app tiene UI o efectos externos: cómo se verifica a mano antes de
declarar done.)
