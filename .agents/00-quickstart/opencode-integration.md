# OpenCode Integration y Skill Routing

Este repo usa OpenCode con preferencia por skills del proyecto y fallback a skills globales.

Fuentes:

- Local: `/.agents/skills`
- Global: `~/.agents/skills`

Política:

1. Priorizar skills del proyecto cuando existan.
2. Usar skills globales como fallback.
3. Ajustar profundidad de ejecución por nivel L0-L3.

Matriz sugerida por nivel:

- **L0 (`risk/low`)**: ruta rápida + validaciones mínimas.
- **L1 (`risk/medium`)**: sumar checklist completo y smoke funcional.
- **L2 (`risk/high`)**: incluir análisis de riesgos + rollback.
- **L3 (`risk/critical`)**: forzar revisión de seguridad (tenant/auth/storage/PII).

Routing por dominio:

- UX/UI compleja: `frontend-design`, `web-design-guidelines`
- Performance: `performance`, `core-web-vitals`
- Seguridad: `senior-security`
- Testing frontend: `playwright` / skills de testing aplicables
