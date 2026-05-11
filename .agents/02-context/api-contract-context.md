# API Contract Context — FreakDays ↔ freak-days-api

## Política

**Contract-first**: el frontend consume contratos explícitos del backend y no inventa campos ni endpoints.

## Reglas de integración

1. Todo cambio de contrato debe documentarse y coordinarse con `freak-days-api`.
2. El frontend debe mapear errores técnicos a mensajes de dominio.
3. Los códigos/mensajes internos sensibles deben quedarse en backend/logs seguros.

## Contexto mínimo por request (cuando aplique)

- identidad de sesión (Clerk token gestionado según patrón del proyecto)
- contexto tenant (`orgId`)
- headers técnicos necesarios sin exponer secretos

## Flujos críticos a respetar

1. Auth protegida: FE envía contexto, BE valida JWT server-side.
2. Multi-tenant: queries/mutations alineadas a organización activa.
3. Storage: request signed URL → upload → confirm backend.
4. Email transaccional: UI dispara acción de negocio; backend decide envío por Resend.

## Checklist de cambio contractual

- [ ] ¿Qué endpoint/campo cambia?
- [ ] ¿Cuál es la compatibilidad hacia atrás?
- [ ] ¿Qué módulos FE se impactan?
- [ ] ¿Qué validación manual/técnica confirma que no hay regresión?

## Referencias

- `AGENTS.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (R1-R4)
