# Pre-PR Checklist

## Contexto y alcance

- [ ] El PR está alineado al issue/tarea original (sin scope creep).
- [ ] Objetivo y alcance están explícitos en la descripción.
- [ ] Nivel de riesgo (`risk/*`) está asignado correctamente.

## Contratos y arquitectura

- [ ] Impacto FE↔BE está evaluado y documentado (si aplica).
- [ ] Si hubo cambio contractual, se coordinó con `freak-days-api`.
- [ ] Si aplica, se actualizó documentación en `.agents/` y/o `docs/`.

## Seguridad y multitenancy

- [ ] Cambios en auth/tenant/storage/PII incluyen notas de seguridad.
- [ ] Se validó propagación de `orgId` en flujos multi-tenant impactados.
- [ ] No se exponen secretos ni datos sensibles en cliente/logs.

## Validación técnica

- [ ] `pnpm lint` pasó.
- [ ] `pnpm typecheck` pasó.
- [ ] `pnpm test` pasó.
- [ ] Se adjuntó evidencia de validación manual para flujos relevantes.

## Cierre del PR

- [ ] El PR incluye riesgos, mitigaciones y rollback (obligatorio en L2/L3).
- [ ] Se listan archivos o módulos críticos tocados.
- [ ] La narrativa del PR está en español profesional y con contexto suficiente.
