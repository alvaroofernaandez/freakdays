# Workflow: Bugfix

1. Reproducir el bug con pasos claros.
2. Aislar causa raíz (no quedarse en el síntoma).
3. Clasificar riesgo (L0-L3).
4. Definir fix mínimo seguro para restaurar comportamiento esperado.
5. Agregar test de regresión cuando sea viable.
6. Verificar que no se rompa aislamiento tenant ni seguridad.
7. Ejecutar checks bloqueantes.
8. Abrir PR con impacto del incidente y plan de rollback.

## Nota

Si el bug involucra auth/multitenancy/storage/PII, tratar como L2 o L3.
