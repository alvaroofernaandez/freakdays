# Security & Multitenancy Checklist

Usar en cambios L2/L3 o cuando se toque auth, tenant, storage o PII.

## Auth (Clerk)

- [ ] No se persisten tokens sensibles en almacenamiento inseguro del cliente.
- [ ] No se exponen tokens/claims sensibles en logs.
- [ ] Endpoints protegidos delegan autorización final al backend (`freak-days-api`).

## Tenant isolation (`orgId`)

- [ ] `orgId` se propaga en requests multi-tenant cuando corresponde.
- [ ] Cambio de organización invalida/actualiza estado para evitar mezcla de datos.
- [ ] No hay fallback implícito riesgoso entre organizaciones.

## Storage (R2)

- [ ] Flujo respetado: signed URL solicitada al backend.
- [ ] El frontend no firma URLs ni define permisos de acceso.
- [ ] Existe paso de confirmación backend posterior al upload.

## Email (Resend)

- [ ] El frontend no invoca Resend directo.
- [ ] Los eventos de notificación salen por acciones de negocio en backend.

## Datos sensibles

- [ ] No se expone PII en consola/telemetry.
- [ ] Mensajes de error al usuario están sanitizados.
- [ ] No se agregaron secretos en código/config cliente.

## Gobernanza

- [ ] Riesgo etiquetado (`risk/high` o `risk/critical`).
- [ ] PR incluye revisión de seguridad y mitigaciones.
- [ ] Para `risk/critical`, hay aprobación humana explícita.
