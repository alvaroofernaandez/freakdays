<div align="center">
  <img src="packages/web/public/logo.png" alt="FreakDays Logo" width="200" height="200" style="border-radius: 20px;">

  <h1 style="font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 2px; margin-top: 20px;">
    FREAKDAYS
  </h1>

  <p style="font-size: 1.2em; color: #888; margin-top: 10px;">
    Tu compañero definitivo para gestionar tu vida friki
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

El proyecto está organizado como **monorepo pnpm workspaces** con dos paquetes principales:

| Paquete          | Ruta            | Descripción                          |
| ---------------- | --------------- | ------------------------------------ |
| `freak-days`     | `packages/web/` | Frontend — Nuxt 4, Vue 3, TypeScript |
| `freak-days-api` | `packages/api/` | Backend — NestJS, Prisma, PostgreSQL |

### ✨ Características Principales

- 🎮 **Gamificación**: Sistema de niveles, EXP y recompensas
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

| Categoría | Tecnología                 |
| --------- | -------------------------- |
| Framework | NestJS 10                  |
| Lenguaje  | TypeScript                 |
| ORM       | Prisma + PostgreSQL        |
| Auth      | Clerk (JWT verification)   |
| Storage   | Cloudflare R2 (AWS S3 SDK) |
| Email     | Resend                     |
| Testing   | Jest                       |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- Docker (para PostgreSQL local del backend)
- Proyecto [Clerk](https://clerk.com/) configurado
- Cuenta [Cloudflare R2](https://developers.cloudflare.com/r2/) (para storage de assets)

### 1. Clonar e instalar

```bash
git clone https://github.com/alvaroofernaandez/freak-days.git
cd freak-days

pnpm install
# o
make install
```

Tras la primera instalación, aprobar los build scripts de Prisma y NestJS:

```bash
pnpm approve-builds
# o
make approve-builds
```

### 2. Configurar variables de entorno

Cada paquete tiene su propio `.env`. Copia los ejemplos:

```bash
cp packages/web/.env.example packages/web/.env
cp packages/api/.env.example packages/api/.env
```

**`packages/web/.env`**

```env
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK=false

# Solo para rutas server legacy aún no migradas
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
```

**`packages/api/.env`**

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/freakdays

# Clerk
CLERK_ISSUER_URL=https://xxx.clerk.accounts.dev
CLERK_JWKS_URL=https://xxx.clerk.accounts.dev/.well-known/jwks.json
CLERK_AUDIENCE=
CLERK_WEBHOOK_SECRET=whsec_xxx

# Cloudflare R2
ACCOUNT_ID=xxx
ACCESS_KEY_ID=xxx
SECRET_ACCESS_KEY=xxx
BUCKET=freakdays-assets
ENDPOINT=https://xxx.r2.cloudflarestorage.com
PUBLIC_URL=https://assets.tudominio.com
SIGNED_URL_TTL_SECONDS=3600
```

### 3. Configurar Clerk

1. Copia la **Publishable Key** desde el dashboard de Clerk → pégala en `packages/web/.env`
2. Habilita los providers OAuth: **Google**, **GitHub**, **Discord**
3. Añade URLs de desarrollo permitidas:
   - `http://localhost:3000/` (redirect URL)
   - `http://localhost:3000/login`
   - `http://localhost:3000/register`

### 4. Generar clientes Prisma

```bash
make prisma-generate-web
make prisma-generate-api
# o
pnpm --filter freak-days prisma:generate
pnpm --filter freak-days-api prisma:generate
```

### 5. Levantar el entorno

```bash
make dev
# o
pnpm dev
```

Esto levanta el backend (PostgreSQL + NestJS en puerto `3001`) y el frontend (Nuxt en puerto `3000`) de forma coordinada.

La aplicación estará disponible en **`http://localhost:3000`**

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
# Todos los tests
make test
# o: pnpm test

# Solo frontend (Vitest)
make test-web
# o: pnpm --filter freak-days test

# Solo backend (Jest)
make test-api
# o: pnpm --filter freak-days-api test

# Frontend en modo watch
make test-watch

# Con cobertura
make test-coverage
```

---

## 🔧 Comandos Disponibles

```bash
make help   # Muestra todos los comandos disponibles con descripción
```

| Comando                    | pnpm equivalente                               | Descripción                         |
| -------------------------- | ---------------------------------------------- | ----------------------------------- |
| `make install`             | `pnpm install`                                 | Instalar dependencias del monorepo  |
| `make approve-builds`      | `pnpm approve-builds`                          | Aprobar build scripts (primera vez) |
| `make dev`                 | `pnpm dev`                                     | Full stack coordinado               |
| `make dev-web`             | `pnpm dev:web`                                 | Solo frontend                       |
| `make dev-api`             | `pnpm dev:api`                                 | Solo backend                        |
| `make dev-down`            | `pnpm dev:down`                                | Parar Docker (PostgreSQL)           |
| `make build`               | `pnpm build`                                   | Build todos los paquetes            |
| `make build-web`           | `pnpm --filter freak-days build`               | Build frontend                      |
| `make build-api`           | `pnpm --filter freak-days-api build`           | Build backend                       |
| `make lint`                | `pnpm lint`                                    | Lint todos los paquetes             |
| `make typecheck`           | `pnpm typecheck`                               | Type-check frontend                 |
| `make prisma-generate-web` | `pnpm --filter freak-days prisma:generate`     | Generar cliente Prisma (web)        |
| `make prisma-generate-api` | `pnpm --filter freak-days-api prisma:generate` | Generar cliente Prisma (api)        |
| `make prisma-studio-web`   | `pnpm --filter freak-days prisma:studio`       | Prisma Studio (web)                 |
| `make prisma-studio-api`   | `pnpm --filter freak-days-api prisma:studio`   | Prisma Studio (api)                 |

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
