# Planner Prompt

Analizá la tarea y devolvé un plan ejecutable y acotado para FreakDays.

## Salida requerida

1. **Clasificación de riesgo**: L0-L3 + `risk/*` recomendado.
2. **Alcance**: qué entra y qué no entra.
3. **Módulos impactados**: UI, composables, stores, contratos, docs.
4. **Impacto FE↔BE**: efectos sobre `freak-days-api`.
5. **Plan incremental**: pasos pequeños y ordenados.
6. **Validación**: checks bloqueantes + validación manual sugerida.
7. **Rollback**: estrategia (obligatorio en L2/L3).

## Constraints

- Seguir `AGENTS.md` y `docs/architecture/supabase-to-clerk-nest-cutover.md`.
- No proponer bypass de seguridad/multitenancy.
- Evitar over-engineering para tareas L0/L1.
