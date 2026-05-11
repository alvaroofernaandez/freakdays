# Reglas de Git y Pull Request

## Ramas

1. Crear ramas de trabajo desde la rama base vigente del repo (habitualmente `main`).
2. Naming sugerido:
   - `feat/<issue-id>-<slug>`
   - `fix/<issue-id>-<slug>`
   - `docs/<issue-id>-<slug>`
   - `hotfix/<issue-id>-<slug>`

## Commits

1. Usar Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).
2. Commits chicos y enfocados en una intención.
3. No incluir archivos sensibles (`.env`, credenciales, secretos).

## Requisitos de PR

1. Link al issue/tarea origen.
2. Etiqueta de riesgo obligatoria (`risk/*`).
3. Resumen de cambios con foco en el **por qué**.
4. Evidencia de validación (`lint`, `typecheck`, `test`).
5. Rollback plan para L2/L3.
6. Si hay impacto FE↔BE, detallar coordinación con `freak-days-api`.

## Revisión

1. `risk/critical` requiere revisión explícita de seguridad.
2. No mergear sin resolver comentarios bloqueantes.
3. Preferir squash merge salvo excepción justificada por el equipo.

## Referencias

- `AGENTS.md` (workflow obligatorio y DoD)
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
