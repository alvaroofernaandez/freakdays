# Workflow: Refactor

1. Definir objetivo de refactor, alcance y no-objetivos.
2. Establecer paridad funcional esperada (qué NO debe cambiar para usuario).
3. Clasificar riesgo (`risk/low|medium|high|critical`) y nivel L0-L3.
4. Revisar impacto potencial en:
   - contratos FE↔BE (`freak-days-api`)
   - auth/session (Clerk)
   - multitenancy (`orgId`)
5. Dividir el trabajo en lotes pequeños, cada uno con rollback claro.
6. Implementar lote por lote y validar regresión mínima en cada paso.
7. Si aparece riesgo nuevo, recalificar el nivel (escalar si corresponde).
8. Ejecutar checks bloqueantes: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
9. Actualizar documentación técnica en el mismo PR (reglas/workflows/contexto).
10. Abrir PR con evidencia de paridad, riesgos y plan de reversión.

## Regla de oro

No mezclar feature nueva dentro de un PR de refactor.

## Referencias

- `AGENTS.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
