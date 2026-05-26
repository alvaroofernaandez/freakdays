# Configuración de la Base de Datos en Desarrollo

FreakDays utiliza **PostgreSQL** en un contenedor Docker local (puerto **5433**) gestionado por el Makefile. Este documento describe cómo preparar y mantener la base de datos en entornos de desarrollo.

> **Nota histórica**: Las versiones anteriores del proyecto usaban Supabase como backend de base de datos. Eso ya no aplica — el backend actual es NestJS + Prisma conectado a Postgres local en desarrollo y Postgres gestionado en producción. Ver también [`docs/migrations/`](../migrations/) para registros históricos.

---

## Servicios Docker

El archivo `packages/api/docker-compose.yml` define dos servicios:

| Servicio   | Imagen           | Puerto local |
| ---------- | ---------------- | ------------ |
| `postgres` | `postgres:16`    | **5433**     |
| `redis`    | `redis:7-alpine` | **6379**     |

Redis es **obligatorio** para el pipeline de eventos asíncronos (BullMQ relay + worker) y para el adaptador Redis de Socket.IO. Sin Redis, EXP/niveles/streaks/logros/feed/leaderboard dejan de actualizarse.

---

## Levantar los servicios

```bash
# Solo servicios (sin servidores de aplicación)
make services-up

# Stack completo (servicios + Prisma + API + web)
make dev
```

Para detenerlos:

```bash
make dev-down
# o solo los contenedores:
make services-down
```

Ver estado y logs:

```bash
make services-ps
make services-logs
```

---

## Variable de entorno DATABASE_URL

La conexión a Postgres en desarrollo apunta al puerto **5433** (no 5432):

```env
# packages/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/freakdays
```

El `.env.example` ya incluye este valor. No modifiques el puerto salvo que tengas un conflicto local.

---

## Migraciones con Prisma

FreakDays usa Prisma Migrate para gestionar el esquema. El flujo estándar es:

### Aplicar migraciones existentes

```bash
make prisma-deploy
# equivale a: cd packages/api && pnpm prisma migrate deploy
```

`make dev` lo hace automáticamente en cada arranque.

### Generar el cliente Prisma

```bash
make prisma-generate
```

### Crear una nueva migración

Modifica `packages/api/prisma/schema.prisma` y luego:

```bash
make prisma-migrate
# equivale a: cd packages/api && pnpm prisma migrate dev --name <nombre>
```

### Inspeccionar la base de datos

```bash
make prisma-studio
# abre http://localhost:5555
```

---

## Preparar la base de datos desde cero

Si necesitas recrear la base de datos (ej. datos corruptos, reset completo):

```bash
# Detén todo
make dev-down

# Elimina los volúmenes Docker (borra todos los datos)
cd packages/api && docker compose down -v

# Vuelve a levantar y aplicar migraciones
make dev-setup
# o directamente:
make dev
```

---

## Troubleshooting

### Error: "Can't reach database server at localhost:5433"

Los contenedores Docker no están corriendo:

```bash
make services-up
```

### Error: "Connection refused" en Redis (:6379)

```bash
make services-ps
make services-up
```

### Error: "Migration failed" / "schema drift"

```bash
make prisma-generate
make prisma-deploy
```

Si el drift es severo, considera un reset completo con `docker compose down -v`.

### Error: "Port 5433 already in use"

Tienes otro proceso en ese puerto. Detén el proceso conflictivo o cambia el puerto en `docker-compose.yml` y en `DATABASE_URL`.

---

**Última actualización**: Mayo 2026
