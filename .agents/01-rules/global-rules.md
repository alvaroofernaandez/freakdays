# Reglas Globales

1. Respetar alcance acordado del issue/tarea; no mezclar trabajo no relacionado.
2. Implementar en incrementos pequeños y revisables.
3. Clasificar riesgo siempre: `risk/low|medium|high|critical`.
4. No inventar contratos, campos ni endpoints de `freak-days-api`.
5. Si cambia contrato FE↔BE, actualizar documentación en el mismo PR.
6. Documentar riesgos, mitigaciones y rollback en cambios L2/L3.
7. No declarar “done” sin quality gates bloqueantes en verde.
8. Mantener comunicación en español profesional.

## Quality gates bloqueantes

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Criterios de escalamiento

- Ambigüedad de contrato backend.
- Dudas de aislamiento tenant (`orgId`).
- Cambios de auth/claims/session de Clerk sin evidencia de seguridad.

## Referencias obligatorias

- `AGENTS.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
- `README.md`
