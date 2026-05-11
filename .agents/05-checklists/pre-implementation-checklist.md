# Pre-Implementation Checklist

- [ ] Objetivo y alcance están claros y acotados.
- [ ] Criterios de aceptación son verificables.
- [ ] Riesgo L0-L3 y etiqueta `risk/*` definidos.
- [ ] Se revisó `AGENTS.md` para reglas obligatorias.
- [ ] Se revisó `docs/architecture/supabase-to-clerk-nest-cutover.md` si el cambio impacta el cutover.
- [ ] Impacto FE↔BE con `freak-days-api` evaluado.
- [ ] Se eligió workflow correcto (`feature`, `bugfix`, `hotfix`, `docs`, `refactor`).
- [ ] Se definió plan de validación (automática + manual si aplica).
- [ ] Se evaluó impacto en seguridad/multitenancy.
- [ ] Se definió estrategia de rollback para L2/L3.
