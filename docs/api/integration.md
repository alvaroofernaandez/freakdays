# Integración de APIs - FreakDays

Documentación sobre las integraciones con APIs externas y servicios utilizados en FreakDays.

> **Nota**: Las versiones anteriores del proyecto usaban Supabase como backend principal (base de datos + auth + storage). Eso ya no aplica. El backend actual es NestJS, la autenticación la gestiona Clerk y el storage es Cloudflare R2.

## Índice

- [API NestJS (interna)](#api-nestjs-interna)
- [Clerk (Autenticación)](#clerk-autenticación)
- [Jikan API (MyAnimeList)](#jikan-api-myanimelist)
- [Cloudflare R2 (Storage)](#cloudflare-r2-storage)
- [Resend (Email)](#resend-email)
- [Socket.IO (Realtime)](#socketio-realtime)
- [Manejo de Errores](#manejo-de-errores)

---

## API NestJS (interna)

El frontend Nuxt llama exclusivamente a la API NestJS en `http://localhost:3001` (desarrollo) o en la URL configurada por `NUXT_PUBLIC_API_BASE_URL` (producción).

### Configuración

```env
# packages/web/.env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Llamadas desde composables

```typescript
// packages/web/app/composables/useAnime.ts
async function fetchAnimeList() {
  return $fetch('/api/anime');
  // expandido: NUXT_PUBLIC_API_BASE_URL + '/anime'
}
```

El token JWT de Clerk se incluye automáticamente en las cabeceras de `$fetch` gracias al plugin de autenticación de Nuxt.

### Estructura de rutas

| Método   | Ruta                       | Descripción                                      |
| -------- | -------------------------- | ------------------------------------------------ |
| `GET`    | `/api/anime`               | Lista de anime del usuario                       |
| `POST`   | `/api/anime`               | Añadir anime                                     |
| `PATCH`  | `/api/anime/:id`           | Actualizar anime                                 |
| `DELETE` | `/api/anime/:id`           | Eliminar anime                                   |
| `GET`    | `/api/manga`               | Colección de manga                               |
| `POST`   | `/api/manga`               | Añadir manga                                     |
| `GET`    | `/api/quests`              | Quests activas                                   |
| `POST`   | `/api/quests`              | Crear quest                                      |
| `POST`   | `/api/quests/:id/complete` | Completar quest (dispara evento de gamificación) |
| `GET`    | `/api/workouts`            | Entrenamientos                                   |
| `POST`   | `/api/workouts`            | Crear entrenamiento                              |
| `GET`    | `/api/party`               | Parties del usuario                              |
| `POST`   | `/api/party`               | Crear party                                      |
| `GET`    | `/api/profile`             | Perfil del usuario                               |
| `PUT`    | `/api/profile`             | Actualizar perfil                                |
| `GET`    | `/api/calendar`            | Eventos del calendario                           |

---

## Clerk (Autenticación)

FreakDays usa **Clerk** para autenticación.

### Flujo de autenticación

1. El usuario se autentica en el frontend (Clerk Components o Clerk-hosted pages).
2. Clerk emite un JWT firmado con el par de claves del proyecto.
3. El frontend incluye el JWT en cada request a la API NestJS.
4. El guard de NestJS valida el JWT contra el JWKS de Clerk.
5. El Socket.IO gateway también valida el JWT en el handshake.

### Configuración

```env
# packages/api/.env
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_WEBHOOK_SECRET=whsec_...

# packages/web/.env
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

### Webhooks

Clerk envía webhooks para eventos de usuario (creación, actualización, eliminación). El endpoint `/api/clerk/webhook` en NestJS los recibe y sincroniza los perfiles en la base de datos.

---

## Jikan API (MyAnimeList)

Jikan API proporciona datos de anime y manga desde MyAnimeList.

### Endpoint Base

```
https://api.jikan.moe/v4
```

### Búsqueda de Anime

**Endpoint:**

```
GET /anime?q={query}&limit={limit}&page={page}
```

**Implementación:**

```typescript
// packages/web/app/composables/useAnimeSearch.ts
const response = await fetch(
  `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&limit=20&page=${page}`,
  { signal: abortController.signal },
);
```

**Parámetros:**

- `q`: Query de búsqueda
- `limit`: Resultados por página (máx 25)
- `page`: Número de página

### Detalles de Anime

**Endpoint:**

```
GET /anime/{id}/full
```

### Optimizaciones

#### Debouncing

Las búsquedas tienen debounce de 500ms para reducir requests:

```typescript
const DEBOUNCE_DELAY = 500;

function debouncedSearch(query: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => searchAnime(query, 1), DEBOUNCE_DELAY);
}
```

#### AbortController

Cancela requests anteriores cuando se inicia una nueva búsqueda.

#### Rate Limiting

Jikan API tiene límites de rate:

- **3 requests por segundo**
- **60 requests por minuto**

El debouncing y el AbortController gestionan esto automáticamente.

---

## Cloudflare R2 (Storage)

R2 almacena avatares y banners de usuario. La API NestJS gestiona las subidas.

### Configuración

```env
# packages/api/.env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://pub-...r2.dev
```

### Flujo de subida de avatar

```
Frontend → POST /api/profile/avatar (multipart) → NestJS
  → NestJS sube a R2
  → NestJS actualiza avatarUrl en la BD
  → Retorna la URL pública
```

Las URLs públicas de R2 siguen el patrón:

```
https://pub-{id}.r2.dev/{bucket}/{userId}/{filename}
```

---

## Resend (Email)

Resend gestiona los emails transaccionales (notificaciones, invitaciones de party, etc.).

### Configuración

```env
# packages/api/.env
RESEND_API_KEY=re_...
```

Los emails se envían desde NestJS a través del módulo de Resend.

---

## Socket.IO (Realtime)

El gateway Socket.IO en NestJS proporciona actualizaciones en tiempo real.

### Autenticación

El cliente incluye el JWT de Clerk en el handshake:

```typescript
// packages/web/app/composables/useRealtime.ts
const socket = io(SOCKET_URL, {
  auth: { token: clerkToken },
});
```

El gateway valida el token contra el JWKS de Clerk antes de aceptar la conexión.

### Rooms

- `user:{userId}` — eventos personales (EXP, nivel, logros, stats)
- `party:{partyId}` — eventos del grupo (feed, leaderboard)

La membresía a rooms de party se verifica contra la BD en el momento de la conexión.

### Eventos emitidos por el servidor

| Evento                 | Room         | Payload                                 |
| ---------------------- | ------------ | --------------------------------------- |
| `exp.updated`          | `user:{id}`  | `{ totalExp, level, expForNextLevel }`  |
| `streak.updated`       | `user:{id}`  | `{ questId, streak }`                   |
| `achievement.unlocked` | `user:{id}`  | `{ achievementId, title, description }` |
| `stats.updated`        | `user:{id}`  | `UserStats`                             |
| `feed.entry.created`   | `party:{id}` | `FeedEntry`                             |
| `leaderboard.updated`  | `party:{id}` | `LeaderboardEntry[]`                    |

### Adaptador Redis

El adaptador Redis permite múltiples instancias de la API. Sin Redis disponible, se usa el adaptador in-memory (solo válido en desarrollo con una única instancia).

---

## Manejo de Errores

### Errores de API interna

```typescript
try {
  const data = await $fetch('/api/anime');
  return data;
} catch (error) {
  if (error.statusCode === 401) {
    // JWT expirado o inválido — Clerk renueva automáticamente
    return;
  }
  toast.error('Error al cargar los datos');
  throw error;
}
```

### Errores de API externa (Jikan)

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    return; // Request cancelado intencionalmente
  }
  console.error('Jikan API error:', error);
  throw error;
}
```

### Manejo Centralizado

```typescript
// packages/web/app/composables/useErrorHandler.ts
export function useErrorHandler() {
  const toast = useToast();

  function handleError(error: Error | unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    toast.error(message);
    console.error('Error:', error);
  }

  return { handleError };
}
```

---

**Última actualización**: Mayo 2026
