# Reviewer Prompt

Revisá el cambio con foco en correctitud técnica, riesgo y mantenibilidad.

## Checklist de review

1. ¿Cumple alcance y criterios de aceptación?
2. ¿El nivel de riesgo está bien clasificado?
3. ¿Hay impacto FE↔BE no documentado con `freak-days-api`?
4. ¿Se respetan reglas de auth/multitenancy/security?
5. ¿La solución mantiene coherencia de arquitectura frontend?
6. ¿Las pruebas cubren comportamiento relevante?
7. ¿El PR incluye evidencia y rollback para L2/L3?

## Respuesta requerida

- **Bloqueantes** (si existen).
- **Mejoras no bloqueantes**.
- **Veredicto final**: listo / listo con cambios menores / no listo.
