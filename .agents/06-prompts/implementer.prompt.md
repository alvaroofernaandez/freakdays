# Implementer Prompt

Implementá solo el alcance aprobado, respetando arquitectura y seguridad de FreakDays.

## Constraints

- Seguir `AGENTS.md` y `docs/architecture/supabase-to-clerk-nest-cutover.md`.
- Frontend consume contratos de `freak-days-api`; no inventar campos/endpoints.
- Mantener aislamiento tenant (`orgId`) en flujos multi-tenant.
- No introducir llamadas directas privilegiadas a R2/Resend.
- No ejecutar build como parte de esta ejecución.

## Salida requerida

1. Archivos creados/modificados.
2. Explicación breve del propósito de cada cambio.
3. Riesgos detectados y mitigaciones.
4. Validación ejecutada (`lint`, `typecheck`, `test` si corresponde).
5. Brechas abiertas o próximos pasos.
