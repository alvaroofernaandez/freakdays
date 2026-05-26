# Guía de Implementación - FreakDays

Guía paso a paso para implementar nuevas funcionalidades en FreakDays siguiendo las mejores prácticas del monorepo actual (NestJS + Nuxt 4 + @freakdays/domain).

---

## Flujo de Implementación

### Paso 1: Definir Tipos en @freakdays/domain

Si la funcionalidad tiene lógica de negocio pura (curvas, cálculos, validaciones), el lugar correcto es el paquete compartido:

**Ubicación**: `packages/domain/src/[module-name]/`

```typescript
// packages/domain/src/gamification/types.ts
export interface LevelResult {
  level: number;
  totalExp: number;
  expForNextLevel: number;
}
```

Los tipos simples de transferencia pueden vivir directamente en `packages/api` o `packages/web` si no son compartidos.

### Paso 2: Crear el módulo en NestJS (backend)

**Ubicación**: `packages/api/src/modules/[module-name]/`

Estructura mínima:

```
modules/new-feature/
├── new-feature.module.ts
├── new-feature.controller.ts
├── new-feature.service.ts
└── dto/
    ├── create-new-feature.dto.ts
    └── update-new-feature.dto.ts
```

**Checklist del módulo:**

- [ ] Controller con guards de autenticación Clerk
- [ ] Service que inyecta `PrismaService`
- [ ] DTOs con validación (class-validator)
- [ ] Módulo registrado en `AppModule`

### Paso 3: Añadir el modelo en Prisma

**Ubicación**: `packages/api/prisma/schema.prisma`

```prisma
model NewFeature {
  id        String   @id @default(cuid())
  userId    String
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

Después, crear la migración:

```bash
make prisma-migrate
```

### Paso 4: Publicar eventos de dominio (si aplica)

Si la acción debe disparar gamificación (EXP, streaks, logros, feed), escribe el evento de dominio en la **misma transacción** que el estado:

```typescript
await this.prisma.$transaction([
  this.prisma.newFeature.create({ data: featureData }),
  this.prisma.domainEvent.create({
    data: {
      type: 'NEW_FEATURE_CREATED',
      payload: JSON.stringify({ userId, featureId }),
      processedAt: null,
    },
  }),
]);
```

El relay de BullMQ recoge automáticamente los eventos no procesados y los distribuye a los handlers registrados (ProgressionHandler, StreakHandler, etc.).

### Paso 5: Crear el composable en Nuxt (frontend)

**Ubicación**: `packages/web/app/composables/use[ModuleName].ts`

Los composables llaman a la API NestJS vía `$fetch`:

```typescript
// packages/web/app/composables/useNewFeature.ts
export function useNewFeature() {
  async function fetchAll() {
    return $fetch('/api/new-feature');
  }

  async function create(dto: CreateNewFeatureDTO) {
    return $fetch('/api/new-feature', { method: 'POST', body: dto });
  }

  return { fetchAll, create };
}
```

**Checklist del composable:**

- [ ] Llama a la API NestJS (no accede a la BD directamente)
- [ ] Mapea la respuesta a tipos TypeScript
- [ ] Maneja errores

### Paso 6: Crear Componentes Vue

**Ubicación**: `packages/web/app/components/[module]/`

**Componentes necesarios:**

- `[Module]Card.vue` — Tarjeta individual
- `[Module]List.vue` — Lista con filtros
- `[Module]Stats.vue` — Estadísticas
- `[Module]CardSkeleton.vue` — Skeleton loader
- `Add[Module]Modal.vue` — Modal de creación

### Paso 7: Crear la Página

**Ubicación**: `packages/web/app/pages/[module-name].vue`

**Checklist de la página:**

- [ ] Usa un composable de página (`use[Module]Page.ts`) para aislar la lógica
- [ ] Carga datos con skeleton loader
- [ ] Maneja estados vacíos con el componente `Empty`
- [ ] Maneja errores

### Paso 8: Actualizar Navegación

Si es un módulo principal:

- `packages/web/app/utils/nav-items.ts` — añadir el ítem de navegación
- O asegurarse de que esté en `ALL_MODULES` en el dominio compartido

### Paso 9: Escribir Tests

**API**: `packages/api/src/modules/[module]/*.spec.ts` (Jest)

**Domain**: `packages/domain/src/[module]/*.spec.ts` (Vitest)

**Web**: `packages/web/app/**/*.spec.ts` (Vitest)

```typescript
// packages/domain/src/new-feature/new-feature.spec.ts
import { describe, it, expect } from 'vitest';
import { calculateSomething } from './new-feature';

describe('calculateSomething', () => {
  it('should return expected value', () => {
    expect(calculateSomething(10)).toBe(20);
  });
});
```

### Paso 10: Documentación

Actualizar:

- [`docs/architecture/components.md`](../architecture/components.md) — nuevos componentes
- [`docs/architecture/composables.md`](../architecture/composables.md) — nuevo composable
- [`docs/architecture/pages.md`](../architecture/pages.md) — nueva página
- [`docs/architecture/database.md`](../architecture/database.md) — nuevas tablas
- [`docs/README.md`](../README.md) — si es un módulo de primer nivel

---

## Checklist Final

Antes de considerar una implementación completa:

- [ ] Tipos definidos (en `@freakdays/domain` si son compartidos)
- [ ] Módulo NestJS con controller, service y DTOs
- [ ] Migración Prisma aplicada (`make prisma-migrate`)
- [ ] Evento de dominio publicado en transacción (si aplica)
- [ ] Composable Vue creado
- [ ] Componentes con skeleton loaders y estados vacíos
- [ ] Página con manejo de carga y errores
- [ ] Tests escritos y pasando (`make test`)
- [ ] Sin errores de TypeScript (`make typecheck`)
- [ ] Sin errores de linter (`make lint`)
- [ ] Responsive design verificado
- [ ] Accesibilidad básica verificada

---

## Errores Comunes

### Error: "Cannot find module '@freakdays/domain'"

```bash
make install
make prisma-generate
```

### Error: "Property does not exist"

Verifica que los tipos estén correctamente importados. Los tipos del dominio compartido se importan desde `@freakdays/domain`.

### Error: "PrismaClientKnownRequestError: Foreign key constraint failed"

Verifica que los registros padre existan antes de insertar registros hijo. Revisa el schema en `packages/api/prisma/schema.prisma`.

### El evento de dominio no dispara gamificación

Verifica que:

1. El evento se inserte en la misma transacción con `this.prisma.$transaction([...])`.
2. El relay de BullMQ esté corriendo (se inicia con `make dev`).
3. El tipo de evento (`type`) esté registrado en el worker correspondiente.

---

**Última actualización**: Mayo 2026
