# L0 — Fast Path (`risk/low`)

Aplicar cuando el cambio es acotado, reversible y **sin impacto de contrato FE↔BE**.

## Casos típicos

- Correcciones de copy, typo o texto de UI.
- Ajustes visuales menores (espaciado, estilos, microinteracciones).
- Refactor trivial local sin cambio de comportamiento observable.
- Mejora de documentación interna en `.agents/` o `docs/` sin cambios funcionales.

## Profundidad esperada

1. Validación de alcance (que realmente sea L0).
2. Implementación rápida y precisa.
3. Verificación puntual del cambio.

## Evidencia mínima

- Diff claro y pequeño.
- Nota corta de validación manual o técnica.

## Checks requeridos

- Verificación local razonable del área tocada.
- Si hay duda de alcance, escalar a L1.

## Señales para escalar a L1

- Se toca lógica de composables/store.
- Se altera mapping de errores.
- Hay dudas sobre impacto en `freak-days-api`.

## Referencias

- `AGENTS.md` (secciones 2, 3 y 4)
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
