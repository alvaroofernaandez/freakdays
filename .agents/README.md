# Agentic Development System — FreakDays

Este directorio define el sistema operativo para agentes que trabajan en el frontend de **FreakDays** durante el cambio **`supabase-to-clerk-nest-cutover`**.

> Referencias autoritativas (deben mantenerse alineadas):
>
> - `AGENTS.md`
> - `docs/architecture/supabase-to-clerk-nest-cutover.md`
> - `README.md`
> - backend: `freak-days-api` (repo separado)

## Objetivo

Estandarizar ejecución y calidad en cambios sobre:

- Nuxt 4 + Vue 3 + TypeScript (frontend)
- integración con Clerk (auth)
- contratos HTTP con Nest (`freak-days-api`)
- multitenancy por `orgId`
- archivos vía Cloudflare R2 con signed URLs
- notificaciones transaccionales orquestadas por backend (Resend)

## Estructura

- `00-quickstart/` → entrada rápida para arrancar tareas
- `01-rules/` → reglas globales, frontend, seguridad, testing y PR
- `02-context/` → contexto de producto, arquitectura, contratos y UI
- `03-workflows/` → flujos estándar (feature, bugfix, hotfix, docs, refactor)
- `04-progressive-disclosure/` → niveles L0-L3 + matriz de skill routing
- `05-checklists/` → listas de verificación operativas
- `06-prompts/` → prompts base para planner/implementer/reviewer/qa/security
- `tools/` → utilidades no destructivas (ej. instalación de skills globales)

## Flujo mínimo obligatorio

1. Leer `00-quickstart/agent-entrypoint.md`.
2. Clasificar riesgo con `04-progressive-disclosure/` (L0-L3).
3. Cargar reglas aplicables (`01-rules/`) y contexto (`02-context/`).
4. Ejecutar workflow correcto (`03-workflows/`).
5. Completar checklists (`05-checklists/`) antes de abrir PR.
6. Validar quality gates bloqueantes (`pnpm lint`, `pnpm typecheck`, `pnpm test`).

## Notas operativas

- Todo PR debe incluir etiqueta de riesgo: `risk/low|medium|high|critical`.
- Cambios de auth/multitenancy/storage/PII son mínimo L2; varios casos suben a L3.
- El frontend no autoriza ni ejecuta lógica de negocio crítica: eso vive en `freak-days-api`.
