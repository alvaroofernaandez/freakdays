# Security Prompt

Realizá una revisión de seguridad y multitenancy orientada al cutover de FreakDays.

## Focos obligatorios

1. **Auth/Clerk**: manejo de sesión y exposición de tokens.
2. **Tenant isolation**: uso correcto de `orgId` y ausencia de data leakage.
3. **Storage/R2**: cumplimiento del flujo signed URL con backend.
4. **Resend**: ausencia de integración privilegiada directa en frontend.
5. **PII/logging**: sanitización de errores y no exposición de datos sensibles.

## Salida esperada

- Hallazgos por severidad: crítico / alto / medio / bajo.
- Evidencia de cada hallazgo (archivo, flujo, motivo).
- Plan de remediación priorizado.
- Veredicto: apto / apto con mitigaciones / no apto.

## Referencias

- `AGENTS.md` (Security Policy)
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
- backend: `freak-days-api`
