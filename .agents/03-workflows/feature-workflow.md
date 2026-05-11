# Workflow: Feature

1. Confirmar objetivo, alcance y criterios de aceptación del issue.
2. Clasificar riesgo (L0-L3) y asignar `risk/*`.
3. Revisar impacto en contratos FE↔BE con `freak-days-api`.
4. Diseñar el slice mínimo funcional (vertical slice).
5. Implementar incrementalmente respetando boundaries (UI ↔ composables ↔ API).
6. Agregar/ajustar pruebas del comportamiento nuevo.
7. Actualizar docs afectadas (`.agents/` y/o `docs/`) si cambió flujo/contrato.
8. Ejecutar quality gates bloqueantes.
9. Abrir PR con riesgos, mitigación y rollback.

## Evidencia mínima en PR

- Criterios de aceptación cubiertos.
- Resultado de `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Notas de coordinación con `freak-days-api` si aplica.
