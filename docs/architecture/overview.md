# Arquitectura de FreakDays

Este documento describe la arquitectura general del proyecto FreakDays, sus principios de diseño y la organización del código.

---

## Principios Arquitectónicos

### 1. Domain-Driven Design (DDD)

La lógica de negocio está separada de la capa de presentación y es independiente del framework:

- **`packages/domain`** (`@freakdays/domain`): tipos, constantes y lógica de negocio pura (curvas de EXP, niveles, streaks). No depende de ningún framework.
- **`packages/api`**: backend NestJS. Expone la API REST, orquesta handlers, persiste con Prisma.
- **`packages/web`**: frontend Nuxt 4. Consume la API, gestiona el estado con Pinia, renderiza la UI.

### 2. Arquitectura en Capas (F0–F4)

El proyecto está construido en cinco capas funcionales, todas activas en producción:

| Capa   | Nombre              | Descripción                                                                                        |
| ------ | ------------------- | -------------------------------------------------------------------------------------------------- |
| **F0** | Outbox + Event Bus  | Backbone event-driven. Requests → estado + evento en una transacción. BullMQ relay crash-safe.     |
| **F1** | Gamification Engine | Handlers idempotentes: EXP/nivel, streaks, logros, stats. Lógica de curvas en `@freakdays/domain`. |
| **F2** | Realtime Gateway    | Socket.IO autenticado con Clerk JWKS. Rooms `user:{id}` y `party:{id}`. Adaptador Redis.           |
| **F3** | Immersive UI        | Capa arcade/pixel en el frontend. GSAP celebrations, WebAudio, transiciones de menú, sonidos.      |
| **F4** | Social Layer        | Leaderboards de party y activity feed por grupo.                                                   |

### 3. Separación de Responsabilidades

```
┌──────────────────────────────────────────────────────────┐
│             Presentation Layer (packages/web)             │
│   app/components  app/pages  app/stores  app/composables  │
└──────────────────────────────┬───────────────────────────┘
                               │ HTTP REST + WebSocket
┌──────────────────────────────▼───────────────────────────┐
│              Application Layer (packages/api)             │
│   NestJS modules  Controllers  Services  Guards           │
└──────────────────────────────┬───────────────────────────┘
                               │ PrismaService
┌──────────────────────────────▼───────────────────────────┐
│               Domain Layer (packages/domain)              │
│   Gamification logic  EXP curves  Streak rules  Types     │
└──────────────────────────────┬───────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────┐
│                   Data Layer                              │
│   PostgreSQL :5433 (Prisma)   Redis :6379 (BullMQ + WS)  │
└──────────────────────────────────────────────────────────┘
```

### 4. Type Safety

TypeScript strict mode en todos los paquetes. 0 errores de typecheck en CI.

---

## Estructura del Monorepo

```
freakdays/
├── packages/
│   ├── api/                          # Backend NestJS (freak-days-api, :3001)
│   │   ├── src/
│   │   │   ├── modules/              # Módulos de negocio (anime, manga, quests…)
│   │   │   ├── gamification/         # Handlers de eventos (F1)
│   │   │   │   ├── progression.handler.ts
│   │   │   │   ├── streak.handler.ts
│   │   │   │   ├── achievement.handler.ts
│   │   │   │   ├── stats.projector.ts
│   │   │   │   ├── feed.projector.ts
│   │   │   │   └── realtime-push.handler.ts
│   │   │   ├── events/               # Outbox relay y worker BullMQ (F0)
│   │   │   ├── realtime/             # Socket.IO gateway (F2)
│   │   │   └── prisma/               # PrismaService
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── docker-compose.yml        # Postgres :5433 + Redis :6379
│   │
│   ├── web/                          # Frontend Nuxt 4 (freak-days, :3000)
│   │   └── app/
│   │       ├── components/           # Componentes Vue (arcade UI, F3)
│   │       ├── pages/                # Páginas/rutas
│   │       ├── composables/          # Lógica reutilizable
│   │       │   ├── useRealtime.ts    # Cliente Socket.IO (F2)
│   │       │   ├── useCelebrations.ts # GSAP overlays (F3)
│   │       │   └── useSound.ts       # WebAudio (F3)
│   │       └── stores/               # Pinia stores
│   │           ├── stats.ts          # Stats en tiempo real
│   │           ├── feed.ts           # Activity feed (F4)
│   │           └── leaderboard.ts    # Leaderboards de party (F4)
│   │
│   └── domain/                       # @freakdays/domain (puro TS)
│       └── src/
│           ├── gamification/         # Curvas EXP, niveles, streaks
│           └── types/
│
├── Makefile
└── pnpm-workspace.yaml
```

---

## Backbone Event-Driven (F0)

El patrón Outbox garantiza consistencia entre el estado de negocio y los eventos de dominio:

```
Request HTTP
    │
    ▼
NestJS Service
    │
    ▼ prisma.$transaction([...])
┌───────────────────────────────┐
│  Estado de negocio (INSERT)   │
│  DomainEvent (INSERT)         │  ← mismo commit
└───────────────────────────────┘
    │
    ▼ (poller BullMQ, crash-safe)
OutboxRelay
    │
    ▼ (fan-out idempotente, dedup por eventId+handler via EventHandlerLog)
┌─────────────────────────────────────────────────────────────────┐
│ ProgressionHandler  │ StreakHandler  │ AchievementEvaluationHandler │
│ StatsProjector      │ FeedProjector  │ RealtimePushHandler          │
└─────────────────────────────────────────────────────────────────┘
    │                                       │
    ▼                                       ▼
  DB (EXP, nivel,                    Socket.IO → web
   streaks, logros,                  (emitToUser /
   stats, feed)                       emitToParty)
```

### Propiedades del bus

- **Crash-safety**: el relay hace polling de eventos no procesados; si el proceso muere, los eventos se reprocesarán.
- **Idempotencia**: cada (eventId, handlerName) se registra en `EventHandlerLog`; un evento duplicado no aplica el handler dos veces.
- **Single-writer para EXP/nivel**: `ProgressionHandler` es el único escritor de `totalExp` y `level` en el perfil. La curva viene de `@freakdays/domain`.
- **Deferred push**: `RealtimePushHandler` emite al socket después del commit, nunca dentro de la transacción.

---

## Realtime Gateway (F2)

El `RealtimeGateway` (Socket.IO) autentica cada conexión validando el JWT de Clerk contra el JWKS endpoint. Una vez autenticado:

- El usuario entra a la room `user:{userId}`.
- Por cada party del usuario (verificado contra la BD), entra a `party:{partyId}`.

El adaptador Redis permite escalar a múltiples instancias de la API sin perder mensajes. Si Redis no está disponible, se usa el adaptador in-memory (solo válido en desarrollo con una única instancia; en producción Redis es obligatorio).

### Eventos en tiempo real

| Evento Socket          | Descripción                        |
| ---------------------- | ---------------------------------- |
| `exp.updated`          | Nuevo EXP y nivel del usuario      |
| `streak.updated`       | Streak actualizado                 |
| `achievement.unlocked` | Logro desbloqueado                 |
| `stats.updated`        | Estadísticas del usuario           |
| `feed.entry.created`   | Nueva entrada en el feed del party |
| `leaderboard.updated`  | Leaderboard del party actualizado  |

---

## Flujo de Datos

### Lectura

```
Componente Vue → Composable ($fetch) → NestJS Controller → Service → PrismaService → PostgreSQL
```

### Escritura con gamificación

```
Componente Vue → Composable ($fetch POST) → NestJS Service
    → prisma.$transaction([estado, domainEvent])
    → OutboxRelay (BullMQ) → Handlers
    → DB update + Socket.IO push
    → Pinia stores (stats, feed, leaderboard) → UI reactiva
```

---

## Servicios Externos

| Servicio          | Rol                                                 |
| ----------------- | --------------------------------------------------- |
| **Clerk**         | Autenticación (JWKS handshake, webhooks de usuario) |
| **Cloudflare R2** | Storage S3-compatible (avatares, banners)           |
| **Resend**        | Envío de emails transaccionales                     |

---

## Módulos de la Aplicación

FreakDays está organizado en estos módulos de negocio:

- **Gamification** — niveles, EXP, streaks, logros, estadísticas
- **Anime** — lista de seguimiento vía Jikan (MyAnimeList) API
- **Manga** — colección física, wishlist, tracking de volúmenes
- **Workouts** — sesiones, ejercicios, series
- **Quests** — misiones diarias con dificultad
- **Party** — sistema de grupos, leaderboards, activity feed
- **Calendar** — grid mensual con drag-and-drop

---

## Testing

| Paquete           | Runner | Tests |
| ----------------- | ------ | ----- |
| `packages/api`    | Jest   | 160   |
| `packages/domain` | Vitest | 38    |
| `packages/web`    | Vitest | 656   |

```bash
make test       # todos
make test-api   # solo API
make test-web   # solo web
make coverage   # con cobertura
```

---

## Convenciones de Código

Ver [`../AGENTS.md`](../../AGENTS.md) para convenciones detalladas.

Resumen:

- **Archivos**: kebab-case
- **Componentes**: PascalCase
- **Composables**: camelCase con prefijo `use`
- **Stores**: camelCase con sufijo `Store`
- **Tipos**: PascalCase
- **Constantes**: SCREAMING_SNAKE_CASE

---

## Evolución y Migraciones

- Las migraciones de Prisma están en `packages/api/prisma/migrations/`.
- Son idempotentes y se aplican automáticamente en `make dev`.
- Ver `docs/migrations/` para registros históricos de migraciones mayores (Supabase → NestJS, Clerk cutover, etc.).

---

**Última actualización**: Mayo 2026
