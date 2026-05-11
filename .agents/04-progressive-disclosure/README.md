# Progressive Disclosure — FreakDays (L0-L3)

Esta guía define cuánto proceso aplicar según riesgo.

Documentos por nivel:

- `level-0-fast-path.md`
- `level-1-standard.md`
- `level-2-deep-dive.md`
- `level-3-governance.md`
- `auto-skill-matrix.md`

## L0 — Fast Path (`risk/low`)

- Cambios visuales menores o refactor sin impacto funcional.
- Evidencia: diff claro + validación puntual.

## L1 — Standard (`risk/medium`)

- Cambios moderados de componentes/composables/stores.
- Requiere checklist pre-PR + regresión básica.

## L2 — Deep Dive (`risk/high`)

- Cambios en arquitectura de estado, contratos críticos FE↔BE o flows complejos.
- Requiere diseño explícito, riesgos documentados y rollback parcial.

## L3 — Governance (`risk/critical`)

- Cambios en auth, multitenancy, permisos, storage sensible, PII.
- Requiere validación de seguridad, evidencia de aislamiento por `orgId` y aprobación humana.

Mapeo oficial:

- L0 -> `risk/low`
- L1 -> `risk/medium`
- L2 -> `risk/high`
- L3 -> `risk/critical`

Referencias:

- `AGENTS.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
