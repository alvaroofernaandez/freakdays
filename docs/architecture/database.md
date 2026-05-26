# Base de Datos - FreakDays

Documentación completa del esquema de base de datos, relaciones y migraciones.

> **Migración histórica**: Las versiones anteriores usaban Supabase como backend directo con RLS. Hoy la base de datos es PostgreSQL gestionado por **Prisma ORM** desde **NestJS**. En desarrollo corre en Docker en el puerto **5433**. La seguridad de acceso la garantizan los guards de autenticación de NestJS (Clerk JWT), no RLS de Supabase.

## Esquema General

La base de datos utiliza **PostgreSQL** accedida exclusivamente a través de **Prisma** desde `packages/api`.

## 🗂️ Tablas Principales

### 1. `profiles`

Información adicional del usuario (vinculada al userId de Clerk).

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,  -- corresponde al userId de Clerk
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    total_exp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    bio TEXT,
    favorite_anime_id UUID REFERENCES public.anime_list(id),
    favorite_manga_id UUID REFERENCES public.manga_collection(id),
    location TEXT,
    website TEXT,
    social_links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_profiles_username` en `username`

**Políticas RLS:**

- Usuarios pueden ver su propio perfil
- Usuarios pueden actualizar su propio perfil
- Usuarios pueden insertar su propio perfil

### 2. `user_modules`

Gestiona qué módulos tiene habilitados cada usuario.

```sql
CREATE TABLE public.user_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL CHECK (module_id IN ('workouts', 'manga', 'anime', 'quests', 'party', 'calendar')),
    enabled BOOLEAN DEFAULT true,
    enabled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);
```

**Índices:**

- `idx_user_modules_user` en `user_id`

**Políticas RLS:**

- Usuarios pueden gestionar sus propios módulos

### 3. `workouts`

Registra los entrenamientos del usuario.

```sql
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    workout_date DATE NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'completed',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_workouts_user_date` en `(user_id, workout_date DESC)`
- `idx_workouts_status` en `(user_id, status)` WHERE `status = 'in_progress'`

**Relaciones:**

- `workout_exercises` (uno a muchos)
- `workout_sets` (a través de `workout_exercises`)

### 4. `workout_exercises`

Ejercicios dentro de un entrenamiento.

```sql
CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_workout_exercises_workout` en `workout_id`

### 5. `workout_sets`

Series individuales de cada ejercicio.

```sql
CREATE TABLE public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exercise_id, set_number)
);
```

**Índices:**

- `idx_workout_sets_exercise` en `exercise_id`

### 6. `manga_collection`

Colección de mangas del usuario.

```sql
CREATE TABLE public.manga_collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    total_volumes INTEGER,
    owned_volumes INTEGER[],
    status TEXT CHECK (status IN ('collecting', 'completed', 'dropped', 'wishlist')) DEFAULT 'collecting',
    score INTEGER CHECK (score >= 1 AND score <= 10),
    notes TEXT,
    cover_url TEXT,
    price_per_volume DECIMAL(10,2),
    total_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_manga_user` en `user_id`
- `idx_manga_status` en `(user_id, status)`

**Campos especiales:**

- `owned_volumes`: Array de enteros con los volúmenes poseídos
- `price_per_volume`: Precio por volumen (para cálculo de costos)
- `total_cost`: Costo total calculado automáticamente

### 7. `anime_list`

Lista de animes del usuario.

```sql
CREATE TABLE public.anime_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'rewatching')),
    current_episode INTEGER DEFAULT 0,
    total_episodes INTEGER,
    score INTEGER CHECK (score >= 1 AND score <= 10),
    notes TEXT,
    cover_url TEXT,
    start_date DATE,
    end_date DATE,
    rewatch_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_anime_user` en `user_id`
- `idx_anime_status` en `(user_id, status)`

### 8. `quests`

Misiones diarias del usuario.

```sql
CREATE TABLE public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
    exp_reward INTEGER NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    due_date DATE,
    due_time TIME,
    reminder_minutes_before INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_quests_user` en `user_id`
- `idx_quests_active` en `(user_id, active)`

### 9. `quest_completions`

Registro de completaciones de quests.

```sql
CREATE TABLE public.quest_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    exp_earned INTEGER NOT NULL,
    streak_count INTEGER DEFAULT 1
);
```

**Índices:**

- `idx_quest_completions_quest` en `quest_id`
- `idx_quest_completions_user_date` en `(user_id, completed_at DESC)`

### 10. `parties`

Grupos/parties creados por usuarios.

```sql
CREATE TABLE public.parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_parties_owner` en `owner_id`
- `idx_parties_invite` en `invite_code`

### 11. `party_members`

Miembros de los parties.

```sql
CREATE TABLE public.party_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(party_id, user_id)
);
```

**Índices:**

- `idx_party_members_party` en `party_id`
- `idx_party_members_user` en `user_id`

### 12. `party_shared_lists`

Listas compartidas dentro de parties.

```sql
CREATE TABLE public.party_shared_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    list_type TEXT CHECK (list_type IN ('anime', 'manga', 'quests')) NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_party_lists_party` en `party_id`

### 13. `release_calendar`

Calendario de lanzamientos y eventos.

```sql
CREATE TABLE public.release_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    release_type TEXT NOT NULL CHECK (release_type IN ('anime_episode', 'manga_volume', 'event', 'movie', 'game')),
    release_date DATE NOT NULL,
    description TEXT,
    url TEXT,
    is_global BOOLEAN DEFAULT false,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**

- `idx_releases_date` en `release_date`
- `idx_releases_user` en `user_id` WHERE `user_id IS NOT NULL`
- `idx_releases_global` en `is_global` WHERE `is_global = true`

## Seguridad de Acceso

El acceso a los datos está protegido a nivel de aplicación por los guards de NestJS:

1. Todos los endpoints requieren un JWT válido de Clerk.
2. Los services filtran siempre por `userId` extraído del token.
3. No existe RLS de Supabase — la seguridad la impone la capa de aplicación.

### Patrón de filtrado en servicios

```typescript
// packages/api/src/modules/anime/anime.service.ts
async findAll(userId: string) {
  return this.prisma.animeEntry.findMany({
    where: { userId },  // siempre filtra por el usuario autenticado
  });
}
```

## 🔄 Triggers

### `update_updated_at`

Función trigger que actualiza automáticamente el campo `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Aplicado a:

- `profiles`
- `workouts`
- `manga_collection`
- `anime_list`
- `quests`
- `parties`

## Tablas del Motor de Gamificación (F0–F1)

Tablas añadidas por el motor de gamificación event-driven:

### `domain_events`

Outbox de eventos de dominio. Registra los eventos pendientes de procesar.

```sql
id, type, payload (jsonb), processedAt (nullable), createdAt
```

El relay BullMQ hace polling sobre registros con `processedAt IS NULL`.

### `event_handler_log`

Registro de idempotencia. Garantiza que cada (eventId, handlerName) se procese exactamente una vez.

```sql
id, eventId, handlerName, processedAt
UNIQUE(eventId, handlerName)
```

### `user_stats`

Estadísticas proyectadas del usuario (escritura única desde `StatsProjector`).

```sql
userId, totalQuests, totalWorkouts, totalAnime, totalManga, updatedAt
```

### `feed_entries`

Activity feed por party (escritura única desde `FeedProjectorHandler`).

```sql
id, partyId, userId, type, payload (jsonb), createdAt
```

---

## Migraciones

Las migraciones están gestionadas por Prisma en `packages/api/prisma/migrations/`. Para crear una nueva:

```bash
make prisma-migrate
```

Para aplicar migraciones pendientes (CI/producción):

```bash
make prisma-deploy
```

Las migraciones históricas anteriores a la arquitectura NestJS+Prisma están documentadas en [`docs/migrations/`](../migrations/).

## Queries de Diagnóstico

Para inspeccionar datos en desarrollo, usa Prisma Studio:

```bash
make prisma-studio
# abre http://localhost:5555
```

O conéctate directamente (puerto 5433):

```bash
psql postgresql://postgres:postgres@localhost:5433/freakdays
```

## 🚀 Optimizaciones

### Índices Estratégicos

- Índices en `user_id` para todas las tablas de usuario
- Índices compuestos para queries frecuentes
- Índices parciales para estados específicos (ej: `status = 'in_progress'`)

### Consideraciones de Performance

1. **Arrays en PostgreSQL**: `owned_volumes` usa arrays nativos de PostgreSQL
2. **JSONB**: `social_links` usa JSONB para flexibilidad y performance
3. **Índices parciales**: Reducen el tamaño del índice para queries específicas

## 📝 Notas Importantes

1. **Cascading Deletes**: Todas las relaciones usan `ON DELETE CASCADE` para mantener integridad
2. **Timestamps**: `created_at` y `updated_at` se gestionan automáticamente
3. **UUIDs**: Todas las IDs primarias son UUIDs generados por `uuid_generate_v4()`
4. **Constraints**: Validaciones a nivel de base de datos (CHECK constraints)

## Storage (Cloudflare R2)

Los archivos estáticos (avatares, banners) se almacenan en **Cloudflare R2** (API compatible con S3). La subida se gestiona desde el backend NestJS, que firma las URLs o recibe el archivo y lo retransmite.

### Buckets

| Bucket    | Contenido           | Visibilidad           |
| --------- | ------------------- | --------------------- |
| `avatars` | Avatares de usuario | Público (URL pública) |
| `banners` | Banners de perfil   | Público (URL pública) |

Configuración en `packages/api/.env`:

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
```

---

## Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Última actualización**: Mayo 2026
