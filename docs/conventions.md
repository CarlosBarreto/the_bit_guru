# docs/conventions.md — Convenciones de bit_guru

> **Stub generado por soft-harness.** Rellena antes de empezar — el reviewer
> rechaza código que no respete lo que aquí declares.

## Estilo de código

(Linter / formatter / reglas. Ej: "ruff + black para Python", "prettier para
TS", "PHP-CS-Fixer con PSR-12".)

## Nombres

- **Funciones / métodos:** (convención — snake_case, camelCase, etc.)
- **Clases / tipos:** (PascalCase, etc.)
- **Constantes:** (UPPER_SNAKE, etc.)
- **Archivos:** (kebab-case, snake_case, etc.)

## Manejo de errores

(¿Excepciones? ¿Result types? ¿Códigos de retorno? Sé específico.)

## Tests

- **Estructura:** (un archivo de test por módulo en `frontend-astro/src/`, espejo de
  rutas en `frontend-astro/tests/`)
- **Estilo de aserción:** (qué framework, qué patrones)
- **Mocks:** (cuándo sí, cuándo no — preferir fixtures reales si es posible)

## Documentación en código

(Comentarios — cuándo sí, cuándo no. Docstrings — formato. JSDoc, etc.)

## Git

- **Mensajes de commit:** (formato — Conventional Commits, libre, etc.)
- **Granularidad:** (un commit por feature, por checkpoint, etc.)
