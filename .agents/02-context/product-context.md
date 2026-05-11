# Product Context — FreakDays

FreakDays es un producto frontend que está migrando de un modelo acoplado a Supabase hacia una arquitectura desacoplada con backend dedicado (`freak-days-api`).

## Objetivo de producto en esta etapa

- Mantener continuidad funcional mientras avanza el cutover `Supabase → Clerk + Nest`.
- Mejorar seguridad y gobierno de datos sensibles.
- Consolidar contratos FE↔BE para evolución independiente.

## Capacidades foco del frontend

1. Experiencia de usuario y reglas de presentación.
2. Gestión de sesión cliente con Clerk.
3. Consumo de APIs de dominio del backend Nest.
4. Flujos tenant-aware por organización (`orgId`).
5. Interacciones de archivos vía signed URLs emitidas por backend.

## No-negociables

- Aislamiento estricto por tenant.
- Nada de secretos en cliente.
- Sin llamadas directas privilegiadas a R2/Resend.
- Contratos consistentes con `freak-days-api`.

## Referencias clave

- `AGENTS.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
- `README.md`
