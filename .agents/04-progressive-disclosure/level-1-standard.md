# L1 — Standard (`risk/medium`)

Aplicar para cambios funcionales moderados dentro de un dominio de frontend.

## Casos típicos

- Nuevo componente de UI con lógica de presentación.
- Ajustes de composables existentes sin alterar contrato backend.
- Mejoras de UX con estados de carga/error/empty.
- Bugfix sin tocar auth ni multitenancy crítica.

## Profundidad esperada

1. Confirmar patrones existentes en código y docs.
2. Implementar en slices pequeños.
3. Validar regresión básica del flujo.

## Checks requeridos (bloqueantes)

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Evidencia esperada en PR

- Riesgo `risk/medium` explícito.
- Qué cambió y por qué.
- Resultado de checks.
- Impacto en docs, si aplica.

## Señales para escalar a L2

- Cambios en arquitectura de estado (Pinia) o cacheado significativo.
- Cambio de contrato FE↔BE con `freak-days-api`.
- Flujos de archivos por signed URLs con efectos transversales.

## Referencias

- `AGENTS.md` (workflow, quality gates y definition of done)
- `docs/architecture/supabase-to-clerk-nest-cutover.md` (R1-R4)
