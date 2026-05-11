# Architecture Context — FreakDays

## Stack frontend

- Nuxt 4
- Vue 3
- TypeScript
- Estado con composables y stores (Pinia)

## Modelo backend

- Repositorio separado: `freak-days-api` (NestJS).
- Backend como único punto de verdad para reglas de negocio y autorización.

## Cutover en curso

Desde `docs/architecture/supabase-to-clerk-nest-cutover.md`:

1. Auth: Supabase Auth → Clerk.
2. Datos de dominio: frontend consume endpoints de `freak-days-api`.
3. Storage: flujo signed URL con R2 vía backend.
4. Emails: Resend orquestado por backend.

## Boundaries obligatorios

1. Frontend no autoriza; backend autoriza.
2. Frontend no implementa lógica de negocio crítica.
3. Componentes UI no deben conocer detalles de proveedor.
4. Requests multi-tenant deben incluir contexto de organización cuando aplique.

## Riesgos arquitectónicos recurrentes

- Drift de contrato FE↔BE.
- Mezcla de datos entre tenants por manejo inconsistente de `orgId`.
- Reintroducción accidental de dependencias directas a Supabase/R2/Resend.

## Referencias

- `AGENTS.md` (reglas arquitectura FE/BE)
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
