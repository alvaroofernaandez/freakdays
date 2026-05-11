# Reglas Frontend (Nuxt 4 + Vue 3)

## Arquitectura y boundaries

1. UI desacoplada: componentes no conocen directamente Clerk, R2 ni Resend.
2. Consumir backend exclusivamente vía contratos HTTP de `freak-days-api`.
3. Centralizar llamadas remotas en composables/clients tipados.
4. No mezclar lógica de negocio en componentes de presentación.

## Estado y datos

1. Pinia para estado de UI/aplicación, con side-effects explícitos.
2. No duplicar estado remoto sin necesidad.
3. Mantener claves de cache/consultas estables y predecibles.
4. Errores de API/auth deben mapearse a mensajes de dominio consistentes.

## UX mínima obligatoria

1. Toda pantalla nueva debe contemplar estados: loading/error/empty.
2. Accesibilidad básica: foco visible, labels y navegación por teclado.
3. Evitar hardcodear textos críticos de error técnico en UI final.

## Restricciones del cutover

1. No crear nuevas dependencias directas a Supabase para flujos críticos.
2. No hacer llamadas directas desde browser a `freak-days-api` si el patrón del repo define un boundary intermedio.
3. Mantener compatibilidad con estrategia de migración definida en `docs/architecture/supabase-to-clerk-nest-cutover.md`.

## Referencias

- `AGENTS.md` (reglas de arquitectura frontend)
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (principios de diseño)
