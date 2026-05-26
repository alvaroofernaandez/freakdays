<div align="center">
  <img src="packages/web/public/logo.png" alt="FreakDays Logo" width="200" height="200" style="border-radius: 20px;">

  <h1 style="font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 2px; margin-top: 20px;">
    FREAKDAYS
  </h1>

  <p style="font-size: 1.2em; color: #888; margin-top: 10px;">
    Tu compañero definitivo para gestionar tu vida friki
  </p>

  <p>
    <strong>⚡ Entrada única al stack: <code>make dev</code></strong><br>
    Desarrolladores y agentes de IA deben arrancar el entorno exclusivamente con <code>make dev</code>.<br>
    No usar <code>pnpm dev</code>, <code>nuxt dev</code> ni <code>nest start</code> de forma directa.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
    <img src="https://img.shields.io/badge/License-Custom-blue" alt="License">
    <img src="https://img.shields.io/badge/Open%20Source-Collaboration%20Only-orange" alt="Open Source">
    <img src="https://img.shields.io/badge/monorepo-pnpm%20workspaces-f69220" alt="Monorepo">
  </p>
</div>

---

## 📖 Descripción

**FreakDays** es una aplicación web moderna diseñada para personas frikis que buscan gestionar su vida cotidiana de manera gamificada y organizada. Combina tracking de anime/manga, entrenamientos, misiones diarias, sistema de party y calendario en una sola plataforma.

El proyecto está organizado como **monorepo pnpm workspaces** con tres paquetes:

| Paquete             | Ruta               | Descripción                                           |
| ------------------- | ------------------ | ----------------------------------------------------- |
| `freak-days`        | `packages/web/`    | Frontend — Nuxt 4, Vue 3, TypeScript                  |
| `freak-days-api`    | `packages/api/`    | Backend — NestJS, Prisma, PostgreSQL, Redis, BullMQ   |
| `@freakdays/domain` | `packages/domain/` | Lógica de dominio pura, sin dependencias de framework |

### ✨ Características Principales

- 🎮 **Gamificación arcade (F0–F2)**: Motor event-driven — Outbox pattern + BullMQ relay + worker idempotente que proyecta EXP/niveles, streaks, achievements, stats, feed y leaderboards. Requiere Redis.
- 🔴 **Tiempo real (F2)**: Gateway Socket.IO con autenticación Clerk (JWKS), rooms `user:{id}` + `party:{id}`, adaptador Redis con fallback in-memory.
- 🕹️ **UI inmersiva (F3)**: Capa arcade/pixel — menú, transiciones, sonido (WebAudio), celebraciones GSAP.
- 🏆 **Social (F4)**: Leaderboards de party + activity feed en tiempo real.
- 📺 **Gestión de Anime**: Lista personalizada, seguimiento de episodios, marketplace integrado con Jikan API
- 📚 **Colección de Manga**: Tracking físico, wishlist, gestión de volúmenes y costos
- 💪 **Entrenamientos**: Registro de workouts, ejercicios y estadísticas
- ✅ **Quests (Misiones)**: Sistema de tareas diarias con dificultades y recompensas EXP
- 👥 **Party System**: Creación y gestión de grupos con códigos de invitación
- 📅 **Calendario**: Calendario mensual con drag & drop (desktop) y gestión táctil (mobile/tablet)
- 📊 **Estadísticas**: Dashboard completo con métricas y progreso
- 🖼️ **Perfil Personalizado**: Avatar y banner personalizables con editor de imágenes
- 🎨 **UI Responsive**: Headers y navegación completamente responsive con skeletons de carga

### 🛠️ Stack Tecnológico

**Frontend (`packages/web/`)**

| Categoría | Tecnología                            |
| --------- | ------------------------------------- |
| Framework | Nuxt 4, Vue 3                         |
| Lenguaje  | TypeScript                            |
| UI        | Tailwind CSS 4, Shadcn-vue, Radix Vue |
| Estado    | Pinia + TanStack Query                |
| Auth      | Clerk (client SDK)                    |
| ORM       | Prisma (conexión a Supabase legacy)   |
| Testing   | Vitest, Testing Library               |
| Iconos    | Lucide Icons                          |

**Backend (`packages/api/`)**

| Categoría | Tecnología                               |
| --------- | ---------------------------------------- |
| Framework | NestJS 10                                |
| Lenguaje  | TypeScript                               |
| ORM       | Prisma + PostgreSQL                      |
| Queue     | BullMQ + Redis (async event pipeline)    |
| Realtime  | Socket.IO + Redis adapter                |
| Auth      | Clerk (JWT/JWKS verification + webhooks) |
| Storage   | Cloudflare R2 (AWS S3 SDK)               |
| Email     | Resend                                   |
| Testing   | Jest (160 tests)                         |

**Domain (`packages/domain/`)**

| Categoría | Tecnología        |
| --------- | ----------------- |
| Lenguaje  | TypeScript puro   |
| Testing   | Vitest (38 tests) |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js ≥ 22
- pnpm ≥ 9 (`npm i -g pnpm`)
- Docker (para PostgreSQL :5433 y Redis :6379 del backend)
- Proyecto [Clerk](https://clerk.com/) configurado (auth + webhooks)
- Cuenta [Cloudflare R2](https://developers.cloudflare.com/r2/) (storage de assets)
- Cuenta [Resend](https://resend.com/) (emails transaccionales)

### Servicios locales

| Servicio   | Puerto | Notas                                      |
| ---------- | ------ | ------------------------------------------ |
| PostgreSQL | 5433   | Docker — `packages/api/docker-compose.yml` |
| Redis      | 6379   | Docker — requerido para BullMQ + Socket.IO |
| API        | 3001   | NestJS                                     |
| Web        | 3000   | Nuxt 4                                     |

> **Importante:** sin Redis, el pipeline BullMQ (gamificación, feed, leaderboards) no procesa eventos. El adaptador de Socket.IO cae a modo in-memory (solo un proceso). Redis es requerido en producción.

### 1. Clonar e instalar

```bash
git clone https://github.com/alvaroofernaandez/freak-days.git
cd freak-days
make install
make approve-builds   # solo la primera vez (aprueba build scripts de Prisma y NestJS)
```

### 2. Configurar variables de entorno

```bash
cp packages/web/.env.example packages/web/.env
cp packages/api/.env.example packages/api/.env
# Edita ambos archivos con tus claves reales
```

Consulta los archivos `.env.example` de cada paquete para ver todas las variables disponibles:

- `packages/web/.env.example`
- `packages/api/.env.example`

Variables clave de `packages/api/.env`:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/freakdays

# Redis (requerido — BullMQ + Socket.IO adapter)
REDIS_HOST=localhost
REDIS_PORT=6379

# Clerk
CLERK_ISSUER_URL=https://xxx.clerk.accounts.dev
CLERK_JWKS_URL=https://xxx.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_xxx

# Cloudflare R2
ACCOUNT_ID=xxx
ACCESS_KEY_ID=xxx
SECRET_ACCESS_KEY=xxx
BUCKET=freakdays-assets
ENDPOINT=https://xxx.r2.cloudflarestorage.com

# Resend
RESEND_API_KEY=re_xxx
```

### 3. Configurar Clerk

1. Copia la **Publishable Key** desde el dashboard de Clerk → pégala en `packages/web/.env`
2. Copia **Secret Key** + **JWKS URL** + **Webhook Secret** → `packages/api/.env`
3. Habilita los providers OAuth: **Google**, **GitHub**, **Discord**
4. Añade URLs de desarrollo permitidas: `http://localhost:3000/`

### 4. Arrancar el stack completo

```bash
make dev
```

`make dev` es la **única** forma documentada de arrancar el entorno. Internamente ejecuta:

1. `docker compose up -d` → levanta Postgres (:5433) y Redis (:6379)
2. Espera a que Postgres esté sano
3. `prisma:generate` + `prisma:migrate:deploy` + `prisma:migrations:check`
4. `nest start:dev` → API en `:3001`
5. `nuxt dev` → web en `:3000`

La aplicación estará disponible en **`http://localhost:3000`**

> Para preparar solo la base de datos sin arrancar servidores (útil en CI o primera configuración):
>
> ```bash
> make dev-setup
> ```

---

## 📁 Estructura del Proyecto

```
freak-days/                   # Monorepo root
├── Makefile                  # Comandos unificados
├── package.json              # Scripts raíz del workspace
├── pnpm-workspace.yaml       # Definición de workspaces
├── pnpm-lock.yaml            # Lock file único del monorepo
│
├── packages/
│   ├── web/                  # Frontend — freak-days
│   │   ├── app/
│   │   │   ├── components/   # Componentes Vue (atomic design)
│   │   │   ├── composables/  # Composables (lógica reutilizable)
│   │   │   ├── pages/        # Páginas/rutas
│   │   │   ├── layouts/      # Layouts Nuxt
│   │   │   ├── middleware/   # Middleware de navegación
│   │   │   └── assets/       # Assets estáticos
│   │   ├── domain/           # Tipos y constantes del dominio
│   │   ├── server/           # Rutas server-side (Nuxt Nitro)
│   │   ├── stores/           # Stores de Pinia
│   │   ├── prisma/           # Schema Prisma (Supabase legacy)
│   │   ├── tests/            # Tests unitarios (Vitest)
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   │
│   └── api/                  # Backend — freak-days-api
│       ├── src/
│       │   ├── anime/        # Módulo anime
│       │   ├── auth/         # Guard JWT Clerk
│       │   ├── calendar/     # Módulo calendario
│       │   ├── manga/        # Módulo manga
│       │   ├── party/        # Módulo party y party-lists
│       │   ├── profile/      # Módulo perfil + storage
│       │   ├── quests/       # Módulo misiones + notificaciones
│       │   ├── storage/      # Servicio Cloudflare R2
│       │   ├── users/        # Módulo usuarios
│       │   ├── webhooks/     # Webhooks Clerk
│       │   ├── workouts/     # Módulo entrenamientos
│       │   └── app.module.ts
│       ├── prisma/           # Schema Prisma (PostgreSQL)
│       ├── docker-compose.yml
│       └── package.json
│
├── database/                 # Migraciones SQL (Supabase)
└── docs/                     # Documentación técnica
```

---

## 🧪 Testing

```bash
make test          # Todos los tests (API 160 jest + domain 38 vitest + web 656 vitest)
make test-web      # Solo frontend (Vitest)
make test-api      # Solo backend (Jest)
make test-watch    # Frontend en modo watch
make coverage      # Cobertura completa
make ci-local      # Suite CI completa (recomendado antes de un PR)
```

---

## 🔧 Comandos Disponibles

```bash
make help   # Muestra todos los comandos disponibles con descripción
```

| Comando                | Descripción                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `make install`         | Instalar dependencias del monorepo                                          |
| `make approve-builds`  | Aprobar build scripts (solo la primera vez)                                 |
| `make dev`             | **Entrypoint principal** — Postgres + Redis + API + web coordinados         |
| `make dev-setup`       | Preparar DB + Prisma sin arrancar servidores (útil en CI)                   |
| `make dev-down`        | Parar servicios Docker (PostgreSQL + Redis)                                 |
| `make services-up`     | Arrancar solo los servicios Docker (sin app)                                |
| `make services-down`   | Parar servicios Docker                                                      |
| `make services-logs`   | Seguir logs de los servicios Docker                                         |
| `make services-ps`     | Ver estado de los servicios Docker                                          |
| `make build`           | Build todos los paquetes                                                    |
| `make test`            | Ejecutar todos los tests (web + api + domain)                               |
| `make lint`            | Lint todos los paquetes                                                     |
| `make typecheck`       | Type-check todos los paquetes                                               |
| `make ci-local`        | Suite CI completa local (install→format→lint→typecheck→test→coverage→build) |
| `make prisma-generate` | Regenerar cliente Prisma de la API                                          |
| `make prisma-migrate`  | Crear y aplicar migración Prisma en desarrollo                              |
| `make prisma-deploy`   | Aplicar migraciones pendientes (producción)                                 |
| `make prisma-studio`   | Abrir Prisma Studio                                                         |

---

## 🏗️ Build para Producción

```bash
# Build completo
make build

# Build individual
make build-web
make build-api
```

---

## 📝 Convenciones de Código

- **Naming**: kebab-case para archivos, PascalCase para componentes, camelCase para funciones
- **TypeScript**: Strict mode activado, sin tipos `any`
- **Vue**: Composition API con `<script setup>`
- **NestJS**: Arquitectura modular, un módulo por dominio, guard JWT global
- **Testing**: TDD, cobertura mínima 80% en lógica de negocio
- **Sin comentarios**: El código debe ser auto-documentado

Ver [AGENTS.md](./AGENTS.md) para convenciones detalladas del proyecto.

---

## 🤝 Contribuir

Este proyecto es **Open Source** bajo una licencia personalizada. Estamos abiertos a colaboraciones y contribuciones de la comunidad.

### ¿Cómo contribuir?

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guías de Contribución

- Sigue las convenciones de código del proyecto
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Asegúrate de que todos los tests pasen: `make test`

---

## 📄 Licencia

Este proyecto está bajo una **licencia personalizada** que permite:

### ✅ Permitido

- ✅ **Colaborar**: Contribuir código, reportar bugs, sugerir mejoras
- ✅ **Usar**: Usar el código para aprendizaje y desarrollo personal
- ✅ **Fork**: Hacer fork del repositorio para contribuir

### ❌ No Permitido

- ❌ **Distribuir**: No puedes distribuir versiones modificadas o no modificadas del software
- ❌ **Monetizar**: No puedes usar este código para crear productos comerciales o servicios monetizados
- ❌ **Vender**: No puedes vender, sublicenciar o comercializar este software

**Solo el autor original tiene los derechos exclusivos de distribución y monetización.**

---

## 👤 Autor

**FreakDays**

- Proyecto: [FreakDays](https://github.com/alvaroofernaandez/freak-days)
- GitHub: [@alvaroofernaandez](https://github.com/alvaroofernaandez)
- Email: alvaroofernaandez@gmail.com

---

## 🙏 Agradecimientos

- [Nuxt.js](https://nuxt.com/) — Framework Vue.js
- [NestJS](https://nestjs.com/) — Backend framework
- [Clerk](https://clerk.com/) — Autenticación y gestión de organizaciones
- [Prisma](https://www.prisma.io/) — ORM TypeScript
- [Cloudflare R2](https://developers.cloudflare.com/r2/) — Storage de objetos
- [Resend](https://resend.com/) — Emails transaccionales
- [Shadcn-vue](https://www.shadcn-vue.com/) — Componentes UI
- [Jikan API](https://jikan.moe/) — API de MyAnimeList
- [Lucide Icons](https://lucide.dev/) — Iconos

---

<div align="center">
  <p>Hecho con ❤️ para la comunidad friki</p>
  <p>
    <a href="#-freakdays">⬆️ Volver arriba</a>
  </p>
</div>
