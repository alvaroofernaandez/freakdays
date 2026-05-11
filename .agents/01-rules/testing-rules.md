# Reglas de Testing

## Gates bloqueantes en PR

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

## Estándares

1. Testear comportamiento observable, no detalles internos de implementación.
2. Todo bugfix debería incluir test de regresión cuando sea viable.
3. Evitar tests frágiles dependientes de timing no determinístico.
4. Mantener fixtures/mocks realistas pero mínimos.

## Cobertura por riesgo

- **L0**: validación puntual.
- **L1**: pruebas del flujo afectado.
- **L2**: pruebas de integración/flujo más validación manual documentada.
- **L3**: incluir casos de aislamiento tenant y seguridad.

## Política ante fallos de CI

1. Intentar fix acotado y justificado.
2. Re-ejecutar check afectado.
3. Documentar causa raíz si persiste.
4. Escalar si depende de contrato/infra externa.

## Referencias

- `AGENTS.md` (Quality Gates)
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (riesgos de regresión por fase)
