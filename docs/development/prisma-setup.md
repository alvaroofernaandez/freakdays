# Configuración de Prisma con Supabase

Este proyecto utiliza Prisma como ORM intermediario entre la aplicación y Supabase PostgreSQL.

## Instalación

1. Instalar las dependencias:

```bash
pnpm install
# o
npm install
```

2. Configurar la variable de entorno `DATABASE_URL` en tu archivo `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/database?schema=public&pgbouncer=true&connection_limit=1
```

Para obtener la URL de conexión de Supabase:

- Ve a tu proyecto en Supabase Dashboard
- Settings → Database
- Copia la "Connection string" bajo "Connection pooling"
- Usa el formato "Transaction" o "Session" mode

**Importante**: Usa el modo "Transaction" para Prisma, que es compatible con PgBouncer.

3. Generar el cliente de Prisma:

```bash
pnpm prisma:generate
# o
npm run prisma:generate
```

## Uso

### API Routes (Recomendado)

Las operaciones de base de datos se ejecutan a través de API routes en el servidor:

```typescript
// app/composables/useAnime.ts
const data = await $fetch(`/api/anime?userId=${userId}`);

// server/api/anime/index.get.ts
import { getPrisma } from '../../utils/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const data = await prisma.animeEntry.findMany({
    where: { userId },
  });
  return data;
});
```

### Helper getPrisma

Para usar Prisma en API routes, usa el helper `getPrisma()`:

```typescript
// server/api/example.ts
import { getPrisma } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  // Usar prisma aquí
});
```

**Nota**: `usePrisma()` composable está deprecado. Usa API routes en su lugar.

### Migraciones

Prisma puede sincronizar el schema con la base de datos:

```bash
# Sincronizar schema sin crear migraciones (desarrollo)
pnpm prisma:push

# Crear y aplicar migraciones (producción)
pnpm prisma:migrate

# Abrir Prisma Studio (GUI para la base de datos)
pnpm prisma:studio
```

**Nota**: Como ya tienes un schema SQL existente en Supabase, usa `prisma db push` para sincronizar el schema de Prisma con la base de datos existente, o crea migraciones si prefieres un control más granular.

## Estructura

- `prisma/schema.prisma`: Schema de Prisma que define los modelos
- `server/utils/prisma.ts`: Helper para obtener el cliente de Prisma en el servidor
- `server/api/`: API routes que usan Prisma para operaciones de base de datos
- Los composables (`useAnime`, `useManga`, `useQuests`, etc.) usan `$fetch` para llamar a API routes

## Funciones RPC

Algunas funciones RPC de Supabase (como `check_overdue_quests`, `check_quests_due_soon`) aún se llaman directamente desde Supabase ya que Prisma no soporta funciones RPC directamente. Estas se mantienen usando `useSupabase()`.

## Ventajas de usar Prisma

1. **Type Safety**: TypeScript completo con autocompletado
2. **Validación**: Validación automática de tipos y relaciones
3. **Migrations**: Sistema de migraciones robusto
4. **Developer Experience**: Mejor DX con Prisma Studio y herramientas
5. **Abstracción**: Independencia del proveedor de base de datos
6. **Security**: Prisma solo se ejecuta en el servidor, nunca en el cliente
7. **Bundle Size**: Prisma no se incluye en el bundle del cliente
8. **Connection Pooling**: Mejor gestión de conexiones con PgBouncer

## Troubleshooting

### Error: "Can't reach database server"

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de usar el connection string con pooling habilitado
- Verifica que tu IP esté en la whitelist de Supabase

### Error: "Schema validation failed"

- Ejecuta `pnpm prisma:generate` para regenerar el cliente
- Verifica que el schema de Prisma coincida con tu base de datos

### Error: "Connection limit exceeded"

- Usa connection pooling en Supabase
- Asegúrate de que `DATABASE_URL` incluya `pgbouncer=true`
