# Agent Entrypoint

Usar este flujo al iniciar cualquier tarea:

1. Confirmar objetivo, alcance y criterios de aceptación.
2. Clasificar riesgo en L0-L3.
3. Identificar impacto de contrato FE↔BE (`freak-days` ↔ `freak-days-api`).
4. Ejecutar implementación incremental con rollback parcial posible.
5. Validar quality gates y checklist pre-PR.

Stop conditions (escalar antes de seguir):

- Contrato backend ambiguo o inconsistente.
- Dudas de aislamiento por tenant (`orgId`) en un flujo.
- Cambio de auth Clerk sin cobertura mínima de pruebas.
- Operaciones de storage/email pedidas desde frontend sin backend.
