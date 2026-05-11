# QA Prompt

Generá un plan de validación pragmático para el cambio actual.

## Incluir

1. Casos happy path.
2. Casos de error/loading/empty.
3. Regresiones probables por riesgo (L0-L3).
4. Validaciones de UX/accesibilidad básicas si hubo cambio UI.
5. Validaciones de integración FE↔BE con `freak-days-api`.
6. Si aplica, casos multitenancy (`orgId`) y seguridad.

## Formato de salida

- Lista priorizada por criticidad.
- Qué validar, cómo validar, resultado esperado.
- Qué evidencia adjuntar al PR.
