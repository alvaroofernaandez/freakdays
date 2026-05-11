# Reglas de Seguridad y Multitenancy

## Principios

1. **Tenant isolation first**: jamás mezclar datos entre organizaciones.
2. **Zero trust en cliente**: frontend no autoriza, solo transporta contexto.
3. **Least privilege**: usar claims/tokens mínimos necesarios.
4. **No secretos en cliente**: credenciales sensibles solo backend.

## Auth y sesión (Clerk)

1. No persistir tokens sensibles en `localStorage` si Clerk ofrece mecanismo seguro.
2. No loggear JWTs, claims completos ni payloads de auth en consola.
3. Todo endpoint protegido debe validarse server-side en `freak-days-api`.

## Multitenancy (`orgId`)

1. Propagar `orgId`/tenant activo en cada request multi-tenant.
2. Evitar defaults implícitos de organización cuando hay múltiples memberships.
3. Validar cambios de tenant en estado cliente para no reusar datos cruzados.

## Storage y email

1. Uploads: flujo obligatorio `request signed URL -> upload -> confirm backend`.
2. Frontend no debe firmar ni generar permisos de storage.
3. Frontend no debe invocar Resend directamente.

## Logging y observabilidad

1. Evitar PII en logs y telemetry.
2. Sanitizar errores técnicos antes de mostrarlos en UI.
3. Registrar contexto mínimo útil para debugging sin exponer datos sensibles.

## Gobernanza

- Cambios en estos temas son mínimo `risk/high` y pueden ser `risk/critical`.
- `risk/critical` requiere revisión de seguridad explícita y aprobación humana.

## Referencias

- `AGENTS.md` (sección Security Policy)
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (R1, R2, R3, R4)
- backend: `freak-days-api`
