# UI Design Context — FreakDays

## Dirección de diseño

- Interfaz clara, consistente y orientada a productividad.
- Jerarquía visual fuerte para decisiones rápidas.
- Estados de interfaz explícitos (loading/error/empty/success).

## Estándares mínimos de calidad UI

1. Accesibilidad funcional: labels, foco visible, navegación por teclado.
2. Diseño responsive para escenarios de uso reales del producto.
3. Consistencia de componentes y patrones de feedback.
4. Mensajes de error útiles para usuario, sin detalle técnico sensible.

## Reglas de implementación

1. Componentes presentacionales sin acoplarse a proveedores (Clerk/R2/Resend).
2. Lógica de datos y side-effects en composables/stores.
3. Evitar deuda visual: no introducir variantes ad-hoc sin justificar.

## UX durante la migración

- Evitar fricción en cambios de sesión/tenant.
- Mantener paridad visual y funcional durante reemplazos de backend.
- Priorizar claridad cuando haya estados transicionales por migración.

## Referencias

- `AGENTS.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
