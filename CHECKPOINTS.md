# CHECKPOINTS — Evaluación del estado final

> En sistemas multi-agente no se evalúa el camino, se evalúa el destino.
> Estos son los checkpoints objetivos que un juez (humano o IA) puede usar
> para decidir si bit_guru está sano.

## C1 — El arnés está completo

- [ ] Existen los 4 archivos base: `AGENTS.md`, `init.ps1`,
      `feature_list.json`, `progress/current.md`.
- [ ] Existen los 3 docs: `docs/architecture.md`, `docs/conventions.md`,
      `docs/verification.md`.
- [ ] `.\init.ps1` termina con exit code 0.

## C2 — El estado es coherente

- [ ] Como mucho una feature en `in_progress` en `feature_list.json`.
- [ ] Toda feature `done` tiene tests asociados que pasan.
- [ ] `progress/current.md` está vacío o describe la sesión activa
      (no contiene basura de sesiones anteriores).

## C3 — El código respeta la arquitectura

- [ ] `frontend-astro/src/` solo contiene los módulos previstos en
      `docs/architecture.md`.
- [ ] No hay dependencias externas no justificadas
      (ver `docs/architecture.md`).
- [ ] No hay logs/prints sueltos de debug, ni TODOs sin contexto.

## C4 — La verificación es real

- [ ] `frontend-astro/tests/` tiene al menos un test por módulo de `frontend-astro/src/`.
- [ ] Los tests no dependen de servicios externos sin estar mockeados
      en su frontera (ver `docs/conventions.md`).
- [ ] `npm test --prefix frontend-astro` muestra > 0 tests y todos verdes.

## C5 — La sesión se cerró bien

- [ ] No hay archivos sin trackear sospechosos (caches, builds, temporales
      fuera del `.gitignore`).
- [ ] `progress/history.md` tiene una entrada por la última sesión.
- [ ] La última feature trabajada está reflejada en su estado correcto.

---

**Cómo usar este archivo:** un agente revisor (`.claude/agents/reviewer.md`)
recorre cada checkbox, marca `[x]` o `[ ]`, y rechaza el cierre de sesión
si quedan boxes vacíos en C1-C5.
