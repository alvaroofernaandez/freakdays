# L2 — Deep Dive (`risk/high`)

Aplicar cuando el cambio cruza módulos o modifica decisiones de arquitectura del frontend.

## Casos típicos

- Reestructuración de stores/composables con impacto transversal.
- Cambios de contrato FE↔BE coordinados con `freak-days-api`.
- Ajustes de estrategia tenant-aware (`orgId`) en múltiples flujos.
- Migraciones de rutas/flujo de datos relacionadas al cutover Supabase → Clerk + Nest.

## Profundidad esperada

1. Diseño explícito de la solución y trade-offs.
2. Matriz de riesgos y mitigaciones.
3. Plan de rollback parcial por lotes.
4. Validación funcional guiada de escenarios críticos.

## Checks requeridos (bloqueantes + funcional)

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Validación manual de escenarios afectados (documentada)

## Evidencia esperada en PR

- Riesgo `risk/high`.
- Impacto contractual FE↔BE documentado.
- Plan de rollback concreto.
- Evidencia de regresión de flujo principal.

## Señales para escalar a L3

- Se toca auth/session de Clerk.
- Se modifica enforcement o propagación de tenant.
- Se procesa PII o storage sensible.

## Referencias

- `AGENTS.md` (security policy y reglas arquitectura FE/BE)
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (fases, riesgos y rollback)
