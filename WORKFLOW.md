# Workflow Interno — FreakDays

Flujo operativo oficial durante la migración **Supabase → Clerk + Nest**:

`Issue/Task -> Riesgo (L0-L3) -> Diseño mínimo -> Implementación incremental -> Validación -> PR`

---

## 1) Preparación de Issue/Task

- Definir contexto, objetivo, alcance y criterios de aceptación verificables.
- Marcar nivel de riesgo con label obligatorio:
  - `risk/low`
  - `risk/medium`
  - `risk/high`
  - `risk/critical`
- Si afecta contrato FE↔BE, enlazar documentación en `docs/architecture/`.

---

## 2) Clasificación Progressive Disclosure

- **L0 (`risk/low`)**: cambio puntual, sin impacto de contrato.
- **L1 (`risk/medium`)**: cambio moderado en UI/composables/stores.
- **L2 (`risk/high`)**: auth, estado global, flujos críticos, arquitectura FE↔BE.
- **L3 (`risk/critical`)**: multitenancy, permisos, storage sensible, PII.

Regla: auth/multitenancy no puede bajar de L2.

---

## 3) Implementación incremental

1. Diseñar el cambio mínimo viable de la fase.
2. Implementar en lotes chicos por dominio (auth, profile, quests, party, etc.).
3. Mantener cambios acotados al alcance de la issue/tarea.
4. Actualizar docs en el mismo ciclo cuando cambian contratos/comportamiento.

---

## 4) Validación obligatoria

Antes de PR, ejecutar quality gates bloqueantes:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Recomendado adicional según riesgo:

- smoke manual de flujos críticos
- validación de contrato contra `freak-days-api`
- checklist de seguridad multitenancy (L2/L3)

---

## 5) Pull Request

Toda PR debe incluir:

1. Resumen del cambio y motivación.
2. Evidencia de validación (lint/typecheck/test, capturas o logs).
3. Riesgos + mitigaciones + rollback.
4. Impacto de contrato FE↔BE cuando aplique.

---

## 6) Definition of Done operacional

Una tarea se considera terminada solo si:

1. Cumple alcance y criterios de aceptación.
2. Tiene riesgo asignado y nivel L0-L3 correcto.
3. Quality gates en verde.
4. Docs y checklists actualizados si cambió comportamiento.
5. En cambios L3: evidencia de validación de seguridad.

---

## 7) Referencias

- `AGENTS.md`
- `.agents/manifest.yml`
- `.agents/04-progressive-disclosure/README.md`
- `docs/architecture/supabase-to-clerk-nest-cutover.md`
