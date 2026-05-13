# Supabase → Clerk + Nest Cutover (FreakDays)

## 1) Contexto y objetivos

FreakDays está migrando desde un frontend con fuerte acoplamiento a Supabase (auth, persistencia y storage) hacia una arquitectura desacoplada:

- **Frontend (este repo)**: Nuxt 4 + Vue 3 + TypeScript.
- **Backend (repo separado)**: `freak-days-api` en NestJS como único punto de negocio/autorización.
- **Auth**: Clerk para identidad y sesión.
- **Storage**: Cloudflare R2 operado por backend con URLs firmadas.
- **Email**: Resend orquestado desde backend.

Objetivos del cambio:

1. Reducir acoplamiento del frontend con proveedores de infraestructura.
2. Consolidar reglas de negocio y autorización en backend.
3. Garantizar aislamiento multitenant por organización (`orgId`).
4. Estandarizar contratos FE↔BE para evolución independiente.

---

## 2) SDD integrado (Proposal / Spec / Design / Tasks)

### 2.1 Proposal

**Problema actual**

- Frontend con lógica y dependencias que asumen Supabase como backend integral.
- Riesgo de mezclar responsabilidades (presentación, auth y acceso a datos) en capa cliente.
- Dificultad para escalar multitenancy y políticas de acceso centralizadas.

**Propuesta**

- Introducir `freak-days-api` (NestJS) como BFF/API de dominio.
- Migrar autenticación de Supabase Auth a Clerk.
- Reemplazar integración directa de storage por flujo signed URL desde backend.
- Mantener frontend como consumidor de contratos tipados y estado/UI.

### 2.2 Spec

#### Requerimiento R1 — Auth desacoplada

El frontend debe autenticarse con Clerk y enviar contexto de sesión al backend para endpoints protegidos.

**Escenario S1**

- Dado un usuario autenticado en Clerk
- Cuando el frontend consume un endpoint protegido de `freak-days-api`
- Entonces el request incluye token válido y el backend valida identidad server-side.

#### Requerimiento R2 — Tenant-aware por organización

El frontend debe propagar `orgId`/tenant activo en todos los flujos multi-tenant.

**Escenario S2**

- Dado un usuario miembro de múltiples organizaciones
- Cuando selecciona una organización activa
- Entonces todas las consultas/mutaciones usan el contexto de esa organización.

#### Requerimiento R3 — Storage seguro

La subida de archivos debe ejecutarse con URLs firmadas emitidas por backend.

**Escenario S3**

- Dado un usuario autorizado para subir avatar/banner
- Cuando solicita carga de archivo
- Entonces el frontend pide URL firmada al backend, sube el archivo y confirma la operación al backend.

#### Requerimiento R4 — Emails transaccionales

El frontend no debe invocar Resend directamente; solo dispara acciones de negocio en backend.

**Escenario S4**

- Dado un evento que requiere notificación
- Cuando se ejecuta la acción desde UI
- Entonces el backend decide y ejecuta envío por Resend según políticas de negocio.

### 2.3 Design

#### Principios

1. **BFF mindset**: frontend no autoriza ni ejecuta lógica de negocio crítica.
2. **Composables como boundary**: toda llamada HTTP centralizada y tipada.
3. **Provider-agnostic UI**: componentes no conocen Clerk/R2/Resend directamente.
4. **Errores de dominio consistentes**: mapear errores técnicos a mensajes de producto.

#### Vista de arquitectura objetivo

```mermaid
flowchart LR
  U[Usuario] --> FE[Frontend Nuxt]
  FE -->|JWT + orgId| BE[freak-days-api (Nest)]
  BE --> CL[Clerk Verification]
  BE --> DB[(DB)]
  BE --> R2[Cloudflare R2]
  BE --> RS[Resend]
```

#### Decisiones de diseño relevantes

- Token y contexto de org se envían desde FE, autorización final siempre backend.
- Operaciones de upload se modelan en 3 pasos: `request signed URL -> upload -> confirm`.
- Contratos FE↔BE se consideran API pública interna y deben versionarse/coordinarse.

### 2.4 Tasks (macro backlog)

- [ ] **T1** Inventario de puntos de acoplamiento actual a Supabase en frontend.
- [ ] **T2** Integrar Clerk en capa de sesión cliente (sin lógica de autorización).
- [ ] **T3** Crear/ajustar client HTTP tenant-aware hacia `freak-days-api`.
- [ ] **T4** Migrar flujos críticos de datos al backend Nest.
- [ ] **T5** Implementar flujo de archivos por signed URLs.
- [ ] **T6** Eliminar llamadas directas a proveedores sensibles desde frontend.
- [ ] **T7** Ejecutar validación funcional y regresión de módulos principales.

### 2.5 Frontend API boundary

Se agregó una base transicional para empezar a consumir `freak-days-api` sin remover todavía flujos legacy de Supabase.

#### Runtime config

- `NUXT_PUBLIC_API_BASE_URL`: base URL del backend Nest (default transicional: `/api`).
- `NUXT_PUBLIC_APP_ENV`: etiqueta de entorno para comportamiento de cliente/observabilidad.

Ambas variables se exponen en `runtimeConfig.public` como `apiBaseUrl` y `appEnv`.

#### `useAuthContext` (neutral, migración)

Composable puente que expone una interfaz neutral de sesión:

- `token` y `orgId` reactivos.
- `refresh()` para sincronizar desde sesión legacy (Supabase) durante la transición.
- `setContext(...)`, `setOrgId(...)` y `clear()` para preparar wiring futuro con Clerk.

Esto permite migrar consumidores al contrato de contexto sin atarlos al proveedor de auth.

#### `useApiClient` (tenant-aware + auth-aware)

Boundary HTTP centralizado para nuevos consumos hacia backend Nest:

- Usa `runtimeConfig.public.apiBaseUrl`.
- Adjunta `Authorization: Bearer <token>` si hay token en contexto.
- Adjunta `x-org-id` si hay organización activa.
- Soporta `requireOrg` para fallar temprano en operaciones multi-tenant.
- Normaliza errores de red/API en `AppError` con `statusCode`, `code` y `details`.

Ejemplo rápido:

```ts
const authContext = useAuthContext();
await authContext.refresh();

const api = useApiClient();
const profile = await api.get<UserProfile>('/v1/profile/me', {
  requireOrg: true,
});
```

> Nota: en fase transicional se convive con composables legacy que aún llaman Supabase o `/api/*` actuales. La migración se hará por flujo para evitar regresiones.

#### Contexto tenant activo en frontend (organization context)

Se incorporó `useOrganizationContext` como capa explícita de tenant activo para desacoplar selector de organización de la fuente de identidad.

- Mantiene `activeOrgId` en estado reactivo (`useState`) y lo persiste en `localStorage` (cliente) para continuidad de sesión UI.
- Sincroniza la selección activa con `useAuthContext().setOrgId(...)` para que el resto del runtime mantenga una vista consistente.
- Expone API mínima: `activeOrgId`, `setActiveOrgId`, `clearActiveOrgId`, `hydrateFromStorage`.

**Prioridad de `orgId` en requests**:

1. `useOrganizationContext.activeOrgId` (selector activo en frontend).
2. `useAuthContext.orgId` derivado de claims/sesión (fallback).

Esto permite UX multiorganización controlada por selector sin perder compatibilidad con el contexto legado basado en sesión.

### 2.6 Selector de organización activo (tenant switcher)

Se incorporó un selector de organización activo en frontend, sincronizado con memberships reales del backend Nest, manteniendo compatibilidad transicional con el flujo legacy.

#### Endpoints usados

- `GET /api/v1/organizations/me` — devuelve memberships del usuario autenticado (`request.user.sub`) con shape:
  - `organizationId`
  - `clerkOrgId`
  - `slug`
  - `name`
  - `role` (`owner|admin|member`)

#### Reglas de selección de organización activa

1. Frontend carga memberships al montar el layout principal.
2. Si existe `activeOrgId` persistido y sigue presente en memberships, se conserva.
3. Si no existe o ya no es válido, se selecciona la primera organización devuelta por backend.
4. Backend retorna memberships ordenados por prioridad de rol (`owner > admin > member`) y luego por nombre, por lo que la selección por defecto respeta esa prioridad.
5. Si no hay memberships (`[]`), se limpia organización activa en frontend.

#### Integración UI

- Composable `useOrganizations` centraliza fetch + inicialización tenant.
- Componente reusable `OrganizationSwitcher` se integra en desktop (`AppHeader`) y mobile (`MobileMenu`).
- Al cambiar organización desde UI, se actualiza `useOrganizationContext.setActiveOrgId(...)`; esto mantiene sincronía con `useAuthContext` y `useApiClient` (`x-org-id`).

### 2.7 Vertical 1 implementado: Party MVP (Nest API + FE boundary)

Se implementó el primer vertical funcional de Party entre `freak-days-api` (Nest + Prisma) y `freak-days` (Nuxt), manteniendo compatibilidad transicional con flujos legacy en Supabase.

#### Endpoints incluidos (`/api/v1/party`)

- `GET /v1/party` — lista parties del usuario autenticado en `orgId` activo.
- `POST /v1/party` — crea party y agrega al owner como miembro.
- `POST /v1/party/join` — join por `inviteCode`.
- `POST /v1/party/:partyId/leave` — salida de party (owner no puede salir).
- `POST /v1/party/:partyId/regenerate-invite-code` — owner/admin.
- `DELETE /v1/party/:partyId` — solo owner.
- `DELETE /v1/party/:partyId/members/:memberUserId` — owner/admin (no remueve owner).
- `GET /v1/party/:partyId` — detalle de party con miembros.

#### Contrato/seguridad del vertical

- Identidad desde `request.user.sub` (claim JWT).
- `orgId` requerido (header `x-org-id` o claim `org_id` ya resuelto por guard).
- Si falta `orgId`, el backend responde `400` en operaciones Party.
- En acciones sensibles se valida pertenencia y rol (`owner|admin|member`).
- Resolución estricta de identidad: si `User` no está provisionado/activo en backend, la operación falla con `401`.

#### Limitaciones actuales

- El frontend migra **solo operaciones core** de Party al boundary `useApiClient`; el resto sigue legacy mientras avanza el cutover.
- Se mantiene fallback automático a Supabase ante no disponibilidad de endpoints nuevos (404/501/errores de red), para reducir riesgo de regresión.
- No se completó todavía transferencia de ownership ni políticas avanzadas de administración de miembros (queda para vertical siguiente).

### 2.8 Vertical 2 implementado: Profile + R2 Signed Uploads (transicional)

Se implementó el vertical transicional de perfil entre `freak-days-api` y `freak-days`, manteniendo fallback legacy para no romper flujos existentes.

#### Endpoints incluidos (`/api/v1/profile`)

- `GET /v1/profile/me`
- `PUT /v1/profile/me`
- `POST /v1/profile/me/exp`
- `POST /v1/profile/me/avatar/upload-url`
- `POST /v1/profile/me/banner/upload-url`
- `POST /v1/profile/me/avatar/confirm`
- `POST /v1/profile/me/banner/confirm`
- `DELETE /v1/profile/me/avatar`
- `DELETE /v1/profile/me/banner`

#### Contrato/flujo upload (R2 signed URL)

1. Frontend solicita URL firmada al backend (`.../upload-url`) con `contentType/fileName`.
2. Frontend ejecuta `PUT` directo al `uploadUrl` firmado.
3. Frontend confirma en backend (`.../confirm`) para persistir `avatarKey/avatarUrl` o `bannerKey/bannerUrl`.

#### Compatibilidad transicional

- `useProfile` migra a `useApiClient` para operaciones profile/upload.
- Si endpoint nuevo no está disponible (`404/501`) o hay error de red, se usa fallback legacy (`/api/profile/*` + Supabase Storage).
- Se preserva UX actual de página de perfil (mismos toasts/mensajes y semántica de retorno de composables).

#### Limitaciones actuales

- No se eliminan archivos previos en storage al reemplazar avatar/banner (solo se actualiza referencia actual).
- Persisten endpoints legacy de Nuxt server (`/api/profile/*`) mientras finaliza la migración.
- El modelo Profile se maneja por usuario autenticado (`request.user.sub`) sin superficie multi-tenant explícita en este vertical.

### 2.9 OAuth providers transicionales en frontend (Clerk-first bridge)

Se incorporó soporte de OAuth en login/registro para **Google, GitHub y Discord** manteniendo convivencia con Supabase Auth durante el cutover.

- Estrategia por provider: **primero Clerk bridge en cliente** (`window.Clerk`) usando `strategy`:
  - Google → `oauth_google`
  - GitHub → `oauth_github`
  - Discord → `oauth_discord`
- (Histórico) durante transición inicial existió fallback automático a Supabase OAuth; ese fallback quedó removido en lote final de auth.
- El flujo email/password legacy quedó deprecado y ahora responde error explícito de no soportado, manteniendo manejo centralizado en `authStore.error`.

### 2.10 Provisioning por webhooks de Clerk

Para reducir dependencia de bootstrap implícito en endpoints de runtime (por ejemplo `/v1/organizations/me`), el backend `freak-days-api` incorpora provisioning reactivo por webhooks de Clerk.

- Endpoint público: `POST /api/v1/webhooks/clerk` (`@Public()`).
- Verificación de firma Svix con headers `svix-id`, `svix-timestamp`, `svix-signature`.
- Secret requerido en backend: `CLERK_WEBHOOK_SECRET`.

Eventos mínimos sincronizados:

- `user.created|updated|deleted`
- `organization.created|updated|deleted`
- `organizationMembership.created|updated|deleted`

Reglas de sincronización:

- `User` por `clerkUserId` (email primario + firstName/lastName); `deleted` -> `isActive=false`.
- `Organization` por `clerkOrgId` (`name`, `slug` seguro); `deleted` -> `isActive=false`.
- `Membership` upsert por `(userId, organizationId)` con mapping de roles Clerk → `owner|admin|member` (fallback `member`), y delete físico de membership en evento `deleted`.
- Idempotencia por upsert/updateMany/deleteMany y creación transaccional de entidades faltantes cuando llega un membership sin preexistencia local.

### 2.11 Migración de `user_modules` a API Nest (transicional)

Se migró el vertical de preferencias de módulos por usuario desde acceso directo a Supabase (`user_modules`) hacia `freak-days-api`, manteniendo fallback transicional para evitar regresiones durante el cutover.

#### Endpoints nuevos (`/api/v1/modules`)

- `GET /v1/modules/me`
  - Requiere usuario autenticado (`request.user.sub`).
  - Requiere org activa (`x-org-id` o contexto equivalente).
  - Devuelve `Array<{ moduleId: string; enabled: boolean }>` para `user + org`.
- `PUT /v1/modules/me`
  - Body: `{ modules: Array<{ moduleId: string; enabled: boolean }> }`.
  - Sincroniza preferencias por `moduleId` (upsert + reemplazo del set para la org activa).
  - Devuelve `{ modules: Array<{ moduleId: string; enabled: boolean }> }` con estado final persistido.

#### Reglas de seguridad/consistencia

- Si falta contexto de organización, backend responde `400`.
- Si la organización enviada no existe o está inactiva en DB, backend responde `404` (sin crear org implícita).
- Se exige `User` provisionado por webhook Clerk; no se crea usuario implícitamente en runtime.

### 2.12 Modo estricto webhook-provisioned

Se endureció el backend `freak-days-api` para eliminar bootstrap implícito de identidad/tenant fuera del módulo de webhooks.

Reglas de enforcement:

- Endpoints protegidos resuelven `User` activo únicamente por `clerkUserId`; si no existe, responden `401` con mensaje de provisioning pendiente.
- Contexto de organización se resuelve por `id` o `clerkOrgId` y exige `isActive=true`; si no existe, responde `404`.
- Endpoints tenant-aware validan membresía user+organization antes de operar; si no existe, responde `403`.
- Falta de contexto de organización (`x-org-id`/claim) mantiene respuesta `400`.

Fuente de verdad:

- `POST /api/v1/webhooks/clerk` queda como único lugar de creación implícita (`User`, `Organization`, `Membership`) y mantiene idempotencia por upsert/deleteMany.

#### Estrategia de fallback en frontend

Se introdujo `useUserModules` como boundary para módulos:

- Camino principal: `useApiClient` + `GET/PUT /v1/modules/me` con `requireOrg: true`.
- Fallback legacy automático a Supabase `user_modules` cuando endpoint nuevo no está disponible (`404`, `501`) o hay error de red.
- El store actual (`modulesStore`) y la UX de onboarding/perfil/layout se mantienen sin cambios de comportamiento visibles.

### 2.13 Lote A de decommission: fallback controlado por flag

Se incorporó un **feature flag global** para controlar de forma reversible el uso de caminos legacy de Supabase en verticales ya migrados (`Party`, `Profile`, `UserModules`).

#### Flag de runtime

- Variable: `NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK`
- Expuesta en `runtimeConfig.public.enableSupabaseFallback`
- Helper centralizado: `isSupabaseFallbackEnabled()` (`app/utils/migration-flags.ts`)

#### Comportamiento por defecto (seguro)

- **Default: `false`** (si no se define la variable).
- Con flag en `false`, los composables migrados **no ejecutan fallback legacy** ante errores del endpoint nuevo: devuelven error/resultado fallido según su contrato actual.
- Con flag en `true`, se mantiene el comportamiento transicional de fallback legacy a Supabase.

#### Cobertura del lote A

- `useParties`, `useProfile`, `useUserModules`: fallback legacy condicionado por flag.
- `useAuthContext`: en modo cutover (`false`) omite `supabase.auth.getSession()` en `refresh()`, priorizando bridge Clerk + `authStore.session`.
- Telemetría mínima: `console.warn` solo en `dev` cuando efectivamente se dispara fallback legacy (sin PII ni tokens).

#### Activación temporal del fallback

Para rehabilitar temporalmente los paths legacy durante una contingencia:

```bash
NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK=true
```

Recomendación operativa: mantener `false` como baseline y activar `true` solo durante ventanas de mitigación controladas.

### 2.14 Lote B de decommission: remoción de módulo Supabase + endpoints legacy deprecados

Se avanzó en el desacople efectivo de Supabase en frontend eliminando wiring principal de Nuxt y apagando rutas legacy de `server/api` en verticales ya migrados.

#### Cambios aplicados

- Se removió el módulo Nuxt `@nuxtjs/supabase` y el SDK `@supabase/supabase-js` de `package.json`.
- `nuxt.config.ts` quedó sin bloque `supabase` ni módulo de inyección automática.
- En composables migrados (`useParties`, `useProfile`, `useUserModules`, `useAuth`) se evitó inicializar cliente Supabase de forma eager: el acceso legacy quedó lazy y solo se evalúa cuando corresponde fallback.
- Middleware global `auth.global.ts` pasó a estrategia **auth-context first** (bridge Clerk + contexto neutral), usando sesión legacy solo si fallback está activo y disponible.

#### Endpoints legacy deprecados (410 Gone)

Se deshabilitaron rutas legacy de `server/api` para verticales ya migrados y ahora responden:

- `410 Gone`
- Mensaje: `Legacy endpoint deprecado: usar /api/v1/... en freak-days-api`

Rutas cubiertas en este lote:

- `GET/PUT /api/profile/:id`
- `POST /api/profile/:id/exp`
- `GET/POST /api/party/:partyId/lists`
- `GET/PUT /api/party/lists/:listId`
- `POST /api/party/lists/:listId/items`

#### Nota operativa

Los verticales no migrados aún se mantienen fuera de este decommission y no fueron modificados en este lote.

### 2.15 Inventario de dominios legacy pendientes (Lote C)

Con `NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK=false` se endurece runtime para **bloquear explícitamente** puntos de entrada públicos que todavía dependen de Supabase directo.

| Dominio                 | Estado Lote C             | Punto legacy bloqueado cuando fallback OFF                                              |
| ----------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| Calendar                | Pending migration         | `useCalendar.*` (lectura/escritura en `release_calendar` vía Supabase)                  |
| Quests / Notifications  | Pending migration parcial | `useQuests.checkOverdueQuests` y `useQuests.checkQuestsDueSoon` (RPC Supabase)          |
| Party Lists compartidas | Pending migration         | `usePartyLists.fetchLists` y `usePartyLists.createList` (token/session legacy Supabase) |

Comportamiento UX asociado:

- Se muestra error controlado y en español en páginas que consumen estos composables (`quests`, `calendar`, `party/[id]`) para evitar crashes silenciosos.
- El resto de verticales ya migrados mantiene el comportamiento del lote A/B (sin fallback legacy por defecto).

### 2.16 Lote D: migración funcional de `calendar`, `quests-notifications` y `party-lists`

Se completó la migración API-first de los dominios pendientes priorizados en Lote C, incorporando contratos en `freak-days-api` y consumo frontend mediante `useApiClient` con contexto tenant (`x-org-id`), manteniendo fallback legacy solo bajo feature flag para contingencia transicional.

#### Backend (`freak-days-api`)

**Calendar (`/api/v1/calendar`)**

- `GET /v1/calendar/releases`
- `GET /v1/calendar/releases/upcoming?daysAhead=30`
- `POST /v1/calendar/releases`
- `PUT /v1/calendar/releases/:id`
- `DELETE /v1/calendar/releases/:id`

Reglas aplicadas:

- identidad desde `request.user.sub`
- contexto de organización obligatorio (`x-org-id`/claim)
- validación de usuario activo + organización activa + membresía (`IdentityContextService`)
- aislamiento por `userId + organizationId` en lecturas/escrituras

**Quests notifications (`/api/v1/quests/notifications`)**

- `POST /v1/quests/notifications/overdue/check` → `{ updatedCount: number }`
- `POST /v1/quests/notifications/due-soon/check` → `{ updatedCount: number }`

Implementación inicial:

- validación estricta de identidad tenant-aware
- placeholder consistente (`updatedCount: 0`) hasta consolidar lógica de dominio de quests en backend

**Party lists (`/api/v1/party`)**

- `GET /v1/party/:partyId/lists`
- `POST /v1/party/:partyId/lists`
- `GET /v1/party/lists/:listId`
- `PUT /v1/party/lists/:listId`
- `POST /v1/party/lists/:listId/items`

Soporte adicional de compatibilidad UI:

- `DELETE /v1/party/lists/:listId/items/:itemId`

Reglas aplicadas:

- usuario debe ser miembro activo de la party dentro de la organización activa
- validaciones de payload en creación/edición de listas e items
- respuestas compatibles con shape UI transicional (`listType`, `creator`, `_count`, `animeItems`)

#### Frontend (`freak-days`)

Composables migrados a API-first:

- `useCalendar.ts` → consume `/v1/calendar/*`
- `useQuests.ts` (solo checks de notificaciones) → consume `/v1/quests/notifications/*`
- `usePartyLists.ts` → consume `/v1/party/*/lists` y `/v1/party/lists/*`

También se migraron consumidores directos de lists detail:

- `PartyAnimeList.vue` y `TierListEditor.vue` dejaron de usar `/api/party/lists/*` legacy y pasan por composable API-first.

Fallback transicional:

- permanece condicionado por `NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK=true`
- con fallback apagado no se ejecutan caminos legacy Supabase
- con fallback encendido se permite degradación controlada en operaciones legacy compatibles

#### Estado de endpoints legacy `server/api`

Los endpoints legacy de party-lists en `server/api/party/*/lists*` continúan deprecados en `410 Gone` y el frontend ya no depende de ellos como camino principal.

### 2.17 Lote E: API-only en dominios migrados

Se aplicó limpieza de runtime para eliminar fallback legacy de Supabase en dominios ya migrados, dejando comportamiento **API-only** sobre `freak-days-api`.

#### Dominios sin fallback legacy (API-only)

- `party` (`useParties`)
- `profile` (`useProfile`)
- `userModules` (`useUserModules`)
- `calendar` (`useCalendar`)
- `party-lists` (`usePartyLists`)
- `quests-notifications` (`useQuests.checkOverdueQuests` y `useQuests.checkQuestsDueSoon`)

Reglas aplicadas:

- se mantienen llamadas `/v1/*` con `useApiClient` y contexto tenant (`requireOrg` cuando corresponde)
- ante errores API se mantiene manejo amigable de UX (mensajes/toasts/errores controlados) sin degradar a Supabase
- el fallback global `NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK` sigue disponible **solo** para dominios no migrados

#### Dominios que continúan con superficie legacy

- `anime`
- `manga`
- `quests` core (CRUD/estado/completions/notificaciones legacy fuera de checks migrados)

### 2.18 Lote F1: migración anime+manga a `freak-days-api`

Se migró el dominio personal de anime y manga a backend Nest (`freak-days-api`) con enforcement tenant-aware por usuario + organización.

#### Backend (`freak-days-api`)

Nuevos módulos:

- `AnimeModule` (`/v1/anime`)
- `MangaModule` (`/v1/manga`)

Contratos implementados:

- `GET /v1/anime`
- `POST /v1/anime`
- `PATCH /v1/anime/:id`
- `DELETE /v1/anime/:id`
- `GET /v1/manga`
- `POST /v1/manga`
- `PATCH /v1/manga/:id`
- `DELETE /v1/manga/:id`

Reglas de seguridad aplicadas:

- identidad estricta vía `request.user.sub`
- contexto de organización obligatorio (`x-org-id` / claim)
- validación de usuario activo + organización activa + membresía (`IdentityContextService`)
- aislamiento por `userId + organizationId` en todas las lecturas/escrituras

Persistencia Prisma:

- modelos `AnimeEntry` y `MangaEntry` en `freak-days-api`
- campos mínimos de compatibilidad UI (title, status, progreso/episodios/volúmenes, score, notes, fechas, costos)
- índices por tenant: `@@index([userId, organizationId, updatedAt])`

#### Frontend (`freak-days`)

Composables migrados a API-first:

- `useAnime.ts` → consume `/v1/anime` con `useApiClient` (`requireOrg: true`)
- `useManga.ts` → consume `/v1/manga` con `useApiClient` (`requireOrg: true`)

Compatibilidad preservada:

- se mantuvo la shape pública de funciones de composables (`fetch*`, `add*`, `update*`, `delete*`)
- se mantienen payloads snake_case transicionales en creación (`total_episodes`, `cover_url`, `total_volumes`, `price_per_volume`)

#### Server legacy (`server/api/*`)

Endpoints legacy de anime y manga quedaron deprecados con `410 Gone`:

- `server/api/anime/*`
- `server/api/manga/*`

Esto evita lecturas/escrituras divergentes fuera del backend Nest cuando el frontend principal ya usa API-first.

#### Contrato FE↔BE (resumen)

**Anime (`/v1/anime`)**

- **GET**: retorna `AnimeEntry[]`
  - `id`, `title`, `status`, `currentEpisode`, `totalEpisodes`, `score`, `notes`, `coverUrl`, `startDate`, `endDate`, `rewatchCount`, timestamps
- **POST**: crea entrada (acepta compat transicional en creación)
  - body mínimo: `title`
  - opcional: `status`, `totalEpisodes|total_episodes`, `score`, `notes`, `coverUrl|cover_url`, `startDate`, `endDate`, `rewatchCount`
- **PATCH /:id**: actualiza parcialmente los mismos campos
- **DELETE /:id**: `{ success: true }`

**Manga (`/v1/manga`)**

- **GET**: retorna `MangaEntry[]`
  - `id`, `title`, `author`, `totalVolumes`, `ownedVolumes`, `status`, `score`, `notes`, `coverUrl`, `pricePerVolume`, `totalCost`, timestamps
- **POST**: crea entrada (acepta compat transicional en creación)
  - body mínimo: `title`
  - opcional: `author`, `totalVolumes|total_volumes`, `ownedVolumes`, `status`, `score`, `notes`, `coverUrl|cover_url`, `pricePerVolume|price_per_volume`, `totalCost|total_cost`
- **PATCH /:id**: actualiza parcialmente los mismos campos
- **DELETE /:id**: `{ success: true }`

**Headers requeridos (ambos dominios)**

- `Authorization: Bearer <clerk_jwt>`
- `x-org-id: <organization-id>`

### 2.19 Lote F2: migración `quests core` a `freak-days-api`

Se migró el dominio core de quests (CRUD + completions + notifications list/update) a backend Nest, con enforcement tenant-aware estricto por `user + organization`.

#### Backend (`freak-days-api`)

Nuevo módulo:

- `QuestsModule` (`/v1/quests`)

Contrato implementado:

- `GET /v1/quests`
- `POST /v1/quests`
- `PATCH /v1/quests/:id`
- `POST /v1/quests/:id/complete`
- `GET /v1/quests/completions`
- `GET /v1/quests/notifications`
- `PATCH /v1/quests/notifications/:id`

Persistencia Prisma (backend):

- `Quest`
- `QuestCompletion`
- `QuestNotification`

Campos incluidos para compatibilidad UI actual:

- quest: `title`, `description`, `difficulty`, `expReward`, `dueDate`, `dueTime`, `reminderMinutesBefore`, `active`, `isRecurring`, `recurrencePattern`, timestamps
- completion: `questId`, `completedAt`, `expEarned`, `streakCount`
- notification: `questId`, `notificationType`, `message`, `sentAt`, `readAt`

Reglas de seguridad aplicadas:

- validación estricta de `User` activo, `Organization` activa y membresía (`IdentityContextService`)
- aislamiento por `userId + organizationId` en todas las lecturas/escrituras
- actualización de EXP en `Profile.totalExp` al completar quest cuando existe perfil del usuario

#### Frontend (`freak-days`)

`useQuests.ts` quedó API-first para flujos core migrados:

- `fetchQuests` → `GET /v1/quests`
- `createQuest` → `POST /v1/quests`
- `deleteQuest` (soft-delete) → `PATCH /v1/quests/:id` con `{ active: false }`
- `completeQuest` → `POST /v1/quests/:id/complete`
- `fetchTodayCompletions` → `GET /v1/quests/completions`
- `fetchNotifications` → `GET /v1/quests/notifications`
- `markNotificationRead` → `PATCH /v1/quests/notifications/:id`

Se mantiene shape pública de composable usada por UI (`useQuestsPage`, `useIndexPage`) para evitar cambios de consumo.

#### Decommission legacy (`server/api/quests/*`)

Los endpoints legacy de quests en Nuxt server quedaron deprecados con `410 Gone` y mensaje de migración a `/api/v1/...`:

- `GET/POST /api/quests`
- `PATCH /api/quests/:id`
- `POST /api/quests/:id/complete`
- `GET /api/quests/completions`
- `GET /api/quests/notifications`
- `PATCH /api/quests/notifications/:id`

### 2.20 Lote F3: migración `workouts` a `freak-days-api`

Se completó la migración integral del dominio de entrenamientos (`workouts`) desde rutas legacy de Nuxt server hacia backend Nest, con consumo frontend API-first y aislamiento tenant-aware estricto por `user + organization`.

#### Backend (`freak-days-api`)

Nuevo módulo:

- `WorkoutsModule` (`/v1/workouts`)

Contrato implementado:

- `GET /v1/workouts`
- `GET /v1/workouts/in-progress`
- `GET /v1/workouts/weekly-stats`
- `GET /v1/workouts/:id`
- `POST /v1/workouts`
- `PATCH /v1/workouts/:id`
- `DELETE /v1/workouts/:id`
- `POST /v1/workouts/:id/exercises`
- `POST /v1/workouts/exercises/:id/sets`
- `PATCH /v1/workouts/sets/:id`
- `DELETE /v1/workouts/sets/:id`

Persistencia Prisma (backend):

- `WorkoutSession`
- `WorkoutExercise`
- `WorkoutSet`

Campos de compatibilidad UI incluidos:

- sesión: `name`, `description`, `workoutDate`, `durationMinutes`, `notes`, `status`, `startedAt`, `completedAt`
- ejercicio: `exerciseName`, `muscleGroup`, `notes`, `orderIndex`
- set: `setNumber`, `reps`, `weightKg`, `restSeconds`, `durationSeconds`, `notes`

Reglas de seguridad aplicadas:

- validación estricta de `User` activo, `Organization` activa y membresía (`IdentityContextService`)
- aislamiento por `userId + organizationId` en todas las lecturas/escrituras
- validación de ownership en rutas por `id` (`workout`, `exercise`, `set`) antes de mutar

#### Frontend (`freak-days`)

`useWorkouts.ts` quedó API-first sin fallback legacy:

- `fetchWorkouts` → `GET /v1/workouts`
- `getInProgressWorkout` → `GET /v1/workouts/in-progress`
- `getWorkoutById` → `GET /v1/workouts/:id`
- `createWorkout` → `POST /v1/workouts`
- `addExercise` → `POST /v1/workouts/:id/exercises`
- `addSet` → `POST /v1/workouts/exercises/:id/sets`
- `updateSet` → `PATCH /v1/workouts/sets/:id`
- `deleteSet` → `DELETE /v1/workouts/sets/:id`
- `completeWorkout` → `PATCH /v1/workouts/:id`
- `deleteWorkout` → `DELETE /v1/workouts/:id`
- `getWeeklyStats` → `GET /v1/workouts/weekly-stats`

Compatibilidad preservada:

- se mantiene shape pública de retorno consumida por `useWorkoutsPage` y componentes de UI
- se mantiene mapeo snake_case → modelo frontend para evitar regresiones visuales

#### Decommission legacy (`server/api/workouts/*`)

Las rutas legacy de workouts en Nuxt server quedaron deprecadas con `410 Gone` y mensaje de migración a `/api/v1/...`:

- `GET/POST /api/workouts`
- `GET/PATCH/DELETE /api/workouts/:id`
- `GET /api/workouts/in-progress`
- `GET /api/workouts/weekly-stats`
- `POST /api/workouts/:id/exercises`
- `POST /api/workouts/exercises/:id/sets`
- `PATCH/DELETE /api/workouts/sets/:id`

### 2.21 Lote final A-B: cierre auth legacy Supabase + limpieza runtime

Se cerró el cutover de autenticación runtime en frontend para operar en modo **Clerk-only**, eliminando sincronizaciones legacy de Supabase en auth y middleware.

#### Auth runtime (frontend)

- `useAuth`:
  - `signIn` / `signUp` (email/password legacy) devuelven error explícito de no soportado.
  - OAuth social usa exclusivamente `window.Clerk.redirectToSignIn(...)`.
  - Si Clerk bridge no está disponible, se informa error claro sin fallback a Supabase.
  - `signOut` limpia stores/contexto (`auth`, `modules`, org activa) sin invocar Supabase.
- `useAuthContext.refresh()`:
  - fuentes válidas: Clerk bridge + `authStore.session` (si existe sesión transicional local).
  - se elimina fallback a `supabase.auth.getSession()`.
- `auth.global.ts`:
  - se elimina sincronización de `useSupabaseUser` / `supabase.auth.getUser/getSession`.
  - autenticación determinada por `authContext.refresh()` + señales de contexto/store.

#### Limpieza de remanentes runtime

- `useSupabase` queda neutralizado (throw explícito) para evitar uso accidental en runtime Clerk-only.
- `modulesStore.syncToDatabase` queda como no-op (sin side effects legacy contra Supabase).
- `runtimeConfig.public` elimina `supabaseUrl` y `supabaseAnonKey`; esas vars quedan solo en runtime server privado para superficies legacy puntuales.

### 2.22 Bootstrap de organización personal para primer login (onboarding)

Se agregó un camino explícito para destrabar onboarding cuando un usuario autenticado en Clerk todavía no tiene organización activa/membership provisionada al primer acceso.

#### Backend (`freak-days-api`)

- Nuevo endpoint autenticado: `POST /v1/organizations/bootstrap-personal`
- Comportamiento:
  - resuelve `User` activo por `request.user.sub` (`clerkUserId`)
  - busca memberships activas en organizaciones activas
  - si existen memberships, devuelve la organización principal ordenada por rol (`owner > admin > member`) y nombre
  - si no existen, crea organización local personal (`clerkOrgId: null`), crea membership `owner` y devuelve esa organización

Shape de respuesta:

- `organizationId`
- `clerkOrgId`
- `slug`
- `name`
- `role`

#### Frontend (`freak-days`)

- En `/onboarding`, antes de persistir módulos:
  - si no hay org activa (`useOrganizationContext` / `useAuthContext`), intenta `bootstrapPersonalOrganization()`
  - setea la organización activa y continúa `saveUserModules`
- Se mejoraron mensajes de error para distinguir:
  - fallo preparando organización inicial
  - fallo guardando módulos en la organización activa

---

## 3) Fases de migración

### Fase 0 — Preparación

- Alinear contratos iniciales FE↔BE.
- Definir estrategia de tenant context (`orgId`).
- Identificar rutas críticas (auth, profile, modules principales).

### Fase 1 — Auth y sesión

- Integrar Clerk en frontend.
- Validar token forwarding hacia backend.
- Retirar dependencia de Supabase Auth en flujos nuevos.

### Fase 2 — Datos de dominio

- Mover operaciones de lectura/escritura a `freak-days-api`.
- Ajustar composables/stores para consumo HTTP tipado.

### Fase 3 — Assets y notificaciones

- Migrar uploads a signed URL con R2 vía backend.
- Asegurar que emails se disparen por backend con Resend.

### Fase 4 — Endurecimiento y deprecación

- Apagar caminos legacy de Supabase en frontend.
- Cerrar gaps de observabilidad, errores y documentación.

---

## 4) Riesgos y mitigaciones

| Riesgo                                    | Impacto | Mitigación                                                      |
| ----------------------------------------- | ------- | --------------------------------------------------------------- |
| Desalineación de contratos FE↔BE          | Alto    | Definir DTOs y versionado de endpoints antes de cada fase       |
| Pérdida de contexto tenant                | Crítico | Forzar `orgId` en requests multi-tenant + tests de aislamiento  |
| Brecha de seguridad en auth               | Crítico | Validación JWT en backend en todo endpoint protegido            |
| Regresión funcional por migración gradual | Alto    | Migración por fases con feature flags y smoke tests             |
| Flujo de uploads inconsistente            | Medio   | Protocolo fijo request/upload/confirm y validación de ownership |

---

## 5) Plan de rollback interno

### Principios de rollback

1. Rollback por fase, no big-bang.
2. Mantener toggles para convivir temporalmente con flujo legacy.
3. Priorizar restauración de disponibilidad antes que limpieza técnica.

### Procedimiento resumido

1. Detectar regresión crítica y congelar despliegues.
2. Revertir al último estado estable de la fase en frontend.
3. Rehabilitar temporalmente endpoint o flujo legacy acordado con backend.
4. Documentar causa raíz + acción correctiva antes de reintentar.

---

## 6) Matriz de responsabilidades (Frontend vs Backend)

| Capacidad        | Frontend (`freak-days`)                         | Backend (`freak-days-api`)                                 |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| UI/UX            | Render, interacción y estados locales           | No aplica                                                  |
| Auth             | Iniciar sesión Clerk y enviar contexto          | Verificar JWT y autorizar                                  |
| Multitenancy     | Selección tenant activa y propagación `orgId`   | Enforcement de aislamiento por tenant                      |
| Datos de dominio | Consumir contratos HTTP tipados                 | Reglas de negocio + persistencia                           |
| Storage          | Solicitar signed URL, subir archivo y confirmar | Emitir signed URL, validar ownership y registrar metadatos |
| Emails           | Disparar acción de negocio desde UI             | Ejecutar envío con Resend + trazabilidad                   |
| Errores          | Mapear a mensajes de producto                   | Emitir códigos/errores de dominio consistentes             |

---

## 7) Criterios de éxito del cutover

1. Frontend sin dependencia directa de Supabase para auth/storage sensible.
2. Todos los flujos protegidos pasan por `freak-days-api`.
3. Aislamiento tenant validado en escenarios críticos.
4. Documentación operativa y de arquitectura actualizada.
