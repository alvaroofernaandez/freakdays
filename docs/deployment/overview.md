# Guía de Despliegue - FreakDays

Guía completa para desplegar FreakDays en producción.

## Índice

- [Servicios requeridos](#servicios-requeridos)
- [Variables de Entorno](#variables-de-entorno)
- [Build](#build)
- [Despliegue](#despliegue)
- [Post-Despliegue](#post-despliegue)

---

## Servicios Requeridos

FreakDays en producción requiere los siguientes servicios:

| Servicio          | Rol                                                    | Obligatorio |
| ----------------- | ------------------------------------------------------ | ----------- |
| **PostgreSQL**    | Base de datos principal                                | Sí          |
| **Redis**         | BullMQ (relay/worker de eventos) + adaptador Socket.IO | **Sí**      |
| **Clerk**         | Autenticación (JWT, JWKS, webhooks)                    | Sí          |
| **Cloudflare R2** | Storage de avatares y banners (S3-compatible)          | Sí          |
| **Resend**        | Emails transaccionales                                 | Recomendado |

> **Redis es obligatorio en producción.** Sin Redis, el pipeline de gamificación (BullMQ) se detiene y los eventos de dominio no se procesan. EXP, niveles, streaks, logros, feed y leaderboards dejan de actualizarse. El adaptador Redis de Socket.IO también requiere Redis para escalar a más de una instancia de la API. La alternativa in-memory solo existe para desarrollo local con una única instancia.

---

## Variables de Entorno

### API (`packages/api`)

```env
# Base de datos (producción — el proveedor normalmente usa el puerto estándar 5432;
# en desarrollo local el Docker corre en 5433)
DATABASE_URL=postgresql://user:password@host:5432/freakdays

# Redis (REQUERIDO)
REDIS_URL=redis://user:password@host:6379

# Clerk
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://pub-...r2.dev

# Resend
RESEND_API_KEY=re_...

# Entorno
NODE_ENV=production
PORT=3001
```

### Web (`packages/web`)

```env
NUXT_PUBLIC_API_BASE_URL=https://api.tu-dominio.com/api
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## Build

```bash
# Build de todos los paquetes
make build

# Verificar que no hay errores antes del build
make ci-local
```

`make ci-local` ejecuta: lint + typecheck + tests + build.

---

## Despliegue

### Arquitectura de referencia

El monorepo tiene dos servicios desplegables independientes:

- `packages/api` — API NestJS (puede desplegarse en cualquier runtime Node.js)
- `packages/web` — Frontend Nuxt 4 (SSR; puede desplegarse en Vercel, Cloudflare Workers, o Node.js clásico)

### API NestJS — Docker / servidor propio

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json packages/api/
COPY packages/domain/package.json packages/domain/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY packages/api packages/api
COPY packages/domain packages/domain

RUN pnpm --filter freak-days-api build

WORKDIR /app/packages/api

# Aplica migraciones al arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

EXPOSE 3001
```

```bash
docker build -t freak-days-api .
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e CLERK_JWKS_URL=... \
  freak-days-api
```

### API NestJS — PM2

```bash
cd packages/api
pnpm build
npx prisma migrate deploy
pm2 start dist/main.js --name freak-days-api
pm2 save
pm2 startup
```

### Frontend Nuxt — Vercel (recomendado)

1. Conecta el repositorio en [Vercel](https://vercel.com).
2. Configura el proyecto:
   - **Framework Preset**: Nuxt.js
   - **Root Directory**: `packages/web`
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
3. Añade las variables de entorno (`NUXT_PUBLIC_API_BASE_URL`, `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY`).
4. Vercel despliega automáticamente en cada push a `main`.

### Frontend Nuxt — Node.js clásico / Docker

```bash
cd packages/web
pnpm build
node .output/server/index.mjs
```

---

## Migraciones en Producción

Antes de arrancar la API, aplica las migraciones pendientes:

```bash
cd packages/api
npx prisma migrate deploy
```

O en el Dockerfile/entrypoint, como se muestra arriba.

---

## Post-Despliegue

### Verificaciones

1. **Health check de la API**

```bash
curl https://api.tu-dominio.com/health
```

2. **Verificar autenticación**

- Probar login con Clerk
- Verificar que el JWT se valide correctamente

3. **Verificar Redis**

Comprueba que el relay BullMQ procesa eventos:

- Completa una quest en la app
- Verifica que EXP/nivel se actualicen
- Verifica que el feed del party reciba la entrada

4. **Verificar Socket.IO**

- Abre la app en dos navegadores con el mismo party
- Verifica que los eventos en tiempo real se propaguen

### Monitoreo

- **Errores**: [Sentry](https://sentry.io), [Rollbar](https://rollbar.com)
- **Logs de BullMQ**: usa Bull Board o logs estructurados de NestJS
- **Performance**: [Vercel Analytics](https://vercel.com/analytics), [Web Vitals](https://web.dev/vitals/)

---

## Rollback

### Vercel (frontend)

```bash
vercel ls
vercel rollback [deployment-url]
```

### API (Docker)

```bash
docker tag freak-days-api:previous freak-days-api:latest
docker-compose up -d
```

---

## Seguridad

- **Nunca** commitear archivos `.env`.
- Usar variables de entorno del proveedor (Vercel, Railway, Fly.io, etc.).
- Rotar las claves de Clerk y R2 periódicamente.
- Verificar que `CLERK_WEBHOOK_SECRET` esté configurado para proteger los webhooks.

---

## Troubleshooting

### Error: "Redis connection refused"

Redis no está disponible. El pipeline de eventos se detiene. Verifica `REDIS_URL` y que el servicio Redis esté accesible desde la API.

### Error: "Cannot connect to database"

Verifica `DATABASE_URL`. Asegúrate de que la IP de la API esté en la allowlist de tu proveedor de PostgreSQL.

### Error: "Build failed"

```bash
make ci-local
```

Esto muestra exactamente qué falla (lint, types, tests, build).

---

## Recursos

- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Clerk Production Setup](https://clerk.com/docs/deployments/overview)
- [BullMQ Documentation](https://docs.bullmq.io/)

---

**Última actualización**: Mayo 2026
