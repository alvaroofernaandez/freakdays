# L3 — Governance (`risk/critical`)

Aplicar para cambios críticos de seguridad y gobierno técnico.

## Casos típicos

- Integración o ajuste de auth con Clerk (tokens, sesión, claims).
- Flujos multitenant con posible riesgo de mezcla de `orgId`.
- Operaciones de archivos con permisos sensibles (R2 signed URLs).
- Exposición potencial de datos personales o metadata sensible.
- Cambios de políticas de acceso, auditoría o observabilidad.

## Profundidad esperada

1. Revisión de seguridad explícita (amenazas, impacto, mitigación).
2. Evidencia de aislamiento tenant por organización.
3. Validación cruzada FE (`freak-days`) y BE (`freak-days-api`).
4. Aprobación humana obligatoria antes de merge.

## Checks requeridos

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Checklist de seguridad/multitenancy completo
- Revisión de seguridad documentada en PR

## Evidencia esperada en PR

- Riesgo `risk/critical`.
- Matriz de riesgos y plan de rollback.
- Evidencia explícita de que no hay secretos en cliente.
- Aprobación de reviewer con foco en seguridad.

## Criterios de rechazo automático

- Persistir tokens sensibles en `localStorage` sin justificación sólida.
- Llamadas directas desde frontend a R2/Resend para acciones privilegiadas.
- Requests multitenant sin contexto de organización cuando corresponde.
- Logs con PII o payloads de auth.

## Referencias

- `AGENTS.md` (sección 5 Security Policy)
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (R1-R4 y matriz de responsabilidades)
