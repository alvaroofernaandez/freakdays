# Configuración de Prisma

FreakDays usa **Prisma ORM** como única capa de acceso a la base de datos en el backend NestJS (`packages/api`). Este documento describe la instalación, configuración y uso de Prisma en el proyecto.

> **Migración histórica**: Las versiones anteriores del proyecto conectaban directamente a Supabase desde el frontend y/o usaban Supabase Auth y Storage directamente en los composables Vue. Esa arquitectura ya no aplica. Hoy toda la lógica de base de datos corre en NestJS, y la autenticación usa Clerk.

---

## Estructura

```
packages/api/
├── prisma/
│   ├── schema.prisma          # Modelos y configuración
│   └── migrations/            # Historial de migraciones
└── src/
    └── prisma/
        └── prisma.service.ts  # PrismaClient como servicio NestJS
```

El cliente Prisma se inyecta como dependencia de NestJS en todos los módulos que lo necesitan.

---

## Instalación y generación del cliente

Las dependencias ya están declaradas en `packages/api/package.json`. Tras clonar el repositorio:

```bash
make install
make prisma-generate
```

O con `make dev`, que lo hace automáticamente.

---

## Variable de entorno

```env
# packages/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/freakdays
```

El puerto es **5433** (Postgres en Docker). No uses 5432 en desarrollo local.

---

## Targets de Makefile

| Target                 | Equivalente                  | Descripción                             |
| ---------------------- | ---------------------------- | --------------------------------------- |
| `make prisma-generate` | `pnpm prisma generate`       | Regenera el cliente TypeScript          |
| `make prisma-migrate`  | `pnpm prisma migrate dev`    | Crea y aplica una nueva migración       |
| `make prisma-deploy`   | `pnpm prisma migrate deploy` | Aplica migraciones pendientes (CI/prod) |
| `make prisma-studio`   | `pnpm prisma studio`         | Abre la GUI de Prisma en :5555          |

---

## Uso en módulos NestJS

El cliente Prisma se usa a través del `PrismaService`:

```typescript
// src/modules/anime/anime.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnimeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.animeEntry.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
```

---

## Patrón Outbox (F0)

La arquitectura de gamificación escribe eventos de dominio en la misma transacción que el estado de negocio usando el patrón Outbox. Prisma es la capa que garantiza la atomicidad:

```typescript
await this.prisma.$transaction([
  this.prisma.questCompletion.create({ data: completionData }),
  this.prisma.domainEvent.create({ data: eventData }),
]);
```

Esto garantiza que si el procesamiento del evento falla, el estado no queda corrupto.

---

## Migraciones

### Crear una nueva migración

1. Modifica `packages/api/prisma/schema.prisma`.
2. Ejecuta:
   ```bash
   make prisma-migrate
   ```
   Se te pedirá un nombre para la migración.

### Aplicar migraciones existentes (CI / producción)

```bash
make prisma-deploy
```

---

## Ventajas de esta arquitectura

1. **Type Safety**: TypeScript completo con autocompletado generado desde el schema.
2. **Migraciones versionadas**: Historial completo en `prisma/migrations/`.
3. **Separación cliente/servidor**: Prisma corre exclusivamente en NestJS, nunca en el navegador.
4. **Independencia de proveedor**: Cambiar a otro Postgres o incluso otro motor es posible sin tocar el código de negocio.
5. **Prisma Studio**: GUI integrada para inspección y depuración.

---

## Troubleshooting

### Error: "Can't reach database server"

Los servicios Docker no están corriendo. Ejecuta:

```bash
make services-up
```

Y verifica que `DATABASE_URL` apunte a **localhost:5433**.

### Error: "Schema validation failed"

```bash
make prisma-generate
```

### Error: "Migration not applied" / "drift detected"

```bash
make prisma-deploy
```

Si hay drift severo, revisa el historial de migraciones en `packages/api/prisma/migrations/`.

---

**Última actualización**: Mayo 2026
