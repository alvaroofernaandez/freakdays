# Workflow: Hotfix

Aplicar solo para restaurar servicio o corregir incidente crítico en producción.

1. Crear rama `hotfix/<issue-id>-<slug>` desde `main` (o rama de release vigente).
2. Limitar el cambio al mínimo indispensable para recuperar estabilidad.
3. Validar riesgo (normalmente `risk/high` o `risk/critical`).
4. Ejecutar checks bloqueantes y validación dirigida al incidente.
5. Mergear a rama productiva según estrategia del repo.
6. Sincronizar el hotfix hacia ramas de desarrollo activas.
7. Documentar timeline del incidente, causa raíz y acción preventiva.

## Reglas especiales

- Nada de refactors oportunistas.
- Si toca auth/tenant, incluir revisión de seguridad aunque sea urgente.
