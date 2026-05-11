# Refactor Checklist

## Pre-implementación

- [ ] Objetivo de refactor definido con límites claros.
- [ ] No-objetivos definidos para evitar scope creep.
- [ ] Paridad de comportamiento explicitada.
- [ ] Riesgo clasificado (`risk/low|medium|high|critical`).
- [ ] Lotes y rollback por lote definidos.
- [ ] Riesgo sobre auth/tenant/storage/PII evaluado.
- [ ] Impacto FE↔BE con `freak-days-api` evaluado.
- [ ] Dependencias al cutover (`supabase-to-clerk-nest-cutover`) identificadas.

## Pre-PR

- [ ] Sin features nuevas mezcladas con el refactor.
- [ ] Contratos FE↔BE preservados o documentados.
- [ ] `pnpm lint` pasó.
- [ ] `pnpm typecheck` pasó.
- [ ] `pnpm test` pasó.
- [ ] Documentación actualizada si hubo impacto arquitectónico.
- [ ] Se adjunta evidencia de paridad funcional (antes/después).
- [ ] PR incluye riesgos, mitigaciones y rollback.

## Validación de seguridad (si aplica)

- [ ] Si tocó auth/tenant/storage, se completó `security-multitenancy-checklist.md`.
- [ ] Si el refactor es `risk/critical`, se obtuvo aprobación humana.
