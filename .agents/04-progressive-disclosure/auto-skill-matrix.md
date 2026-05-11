# Matriz de Auto-Skills por Riesgo (FreakDays)

Esta matriz define skills sugeridas por nivel de riesgo y dominio.

> Prioridad: skills del proyecto (`.agents/skills`) > skills globales (`~/.agents/skills`).

## L0 (`risk/low`)

- Primaria: skill base del agente en ejecución.
- Opcionales: ninguna por defecto.
- Escalar a L1 si aparece lógica de estado/contrato.

## L1 (`risk/medium`)

- Primaria: skill de dominio + buenas prácticas frontend.
- Recomendadas:
  - `frontend-design` (UI/UX)
  - `typescript` (tipado)
  - `web-design-guidelines` (consistencia UI)

## L2 (`risk/high`)

- Primaria: skill de dominio + validación arquitectónica.
- Recomendadas:
  - `performance` / `core-web-vitals` (si impacto de rendimiento)
  - `playwright` (si flujo crítico requiere cobertura E2E)
  - `senior-frontend` (si reestructuración transversal)

## L3 (`risk/critical`)

- Primaria: `senior-security` + skill de dominio.
- Recomendadas:
  - `security-multitenancy-checklist` (checklist local)
  - `find-skills` (si falta capacidad especializada)

## Routing por dominio

- **Auth/Clerk**: `senior-security`, `typescript`
- **Multitenancy/orgId**: `senior-security`
- **Nuxt/Vue UI compleja**: `frontend-design`, `web-design-guidelines`
- **Rendimiento**: `performance`, `core-web-vitals`
- **Testing/E2E**: `playwright`

## Regla de control

Si una tarea toca auth, tenant isolation, storage sensible o PII:

1. Riesgo mínimo L2.
2. Evaluar si corresponde L3.
3. No continuar sin checklist de seguridad aplicable.

## Referencias

- `AGENTS.md` (skill routing y security policy)
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
