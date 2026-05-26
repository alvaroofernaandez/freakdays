# Guía de Desarrollo - FreakDays

Guía completa para desarrolladores que quieren contribuir o trabajar en FreakDays.

## Índice

- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Levantar el entorno](#levantar-el-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Convenciones de Código](#convenciones-de-código)
- [Testing](#testing)
- [Debugging](#debugging)
- [Mejores Prácticas](#mejores-prácticas)

---

## Prerrequisitos

- **Node.js**: 22 o superior
- **pnpm**: 9 o superior
- **Docker** (Docker Desktop o equivalente): para Postgres y Redis en desarrollo

---

## Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/alvaroofernaandez/freak-days.git
cd freak-days
```

2. **Instalar dependencias**

```bash
make install
# equivalente a: pnpm install
```

3. **Configurar variables de entorno**

Copia los archivos de ejemplo y rellena los valores:

```bash
cp packages/api/.env.example packages/api/.env
cp packages/web/.env.example packages/web/.env
```

Variables principales de `packages/api/.env`:

```env
# Base de datos local (Postgres en Docker, puerto 5433)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/freakdays

# Clerk (autenticación)
CLERK_JWKS_URL=https://...
CLERK_WEBHOOK_SECRET=...

# Cloudflare R2 (storage)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Resend (email)
RESEND_API_KEY=...
```

Variables principales de `packages/web/.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

---

## Levantar el entorno

### Forma principal: `make dev`

```bash
make dev
```

Este comando hace todo en orden:

1. Levanta Postgres (:5433) y Redis (:6379) con Docker Compose.
2. Ejecuta `prisma generate` + `prisma migrate deploy` y verifica las migraciones.
3. Inicia la API NestJS en `http://localhost:3001`.
4. Inicia el frontend Nuxt en `http://localhost:3000`.

Cuando interrumpes el proceso (Ctrl-C), ambos servidores se detienen.

### Primeros pasos con una base de datos limpia

Si es la primera vez (o necesitas reiniciar la BD):

```bash
make dev-setup   # solo arranca Docker + Prisma, sin servidores
make dev         # luego el entorno completo
```

### Otros targets útiles

| Target                 | Qué hace                                         |
| ---------------------- | ------------------------------------------------ |
| `make install`         | Instala todas las dependencias (pnpm install)    |
| `make dev`             | **Stack completo** (servicios + API + web)       |
| `make dev-setup`       | Solo servicios Docker + Prisma (sin servidores)  |
| `make dev-down`        | Para Postgres y Redis                            |
| `make services-up`     | Solo levanta los contenedores Docker             |
| `make services-down`   | Solo detiene los contenedores Docker             |
| `make services-logs`   | Logs de los contenedores                         |
| `make services-ps`     | Estado de los contenedores                       |
| `make test`            | Todos los tests                                  |
| `make test-api`        | Tests de la API (jest, 160 tests)                |
| `make test-web`        | Tests del frontend (vitest, 656 tests)           |
| `make coverage`        | Cobertura de tests                               |
| `make e2e`             | Tests end-to-end                                 |
| `make lint`            | Linting                                          |
| `make typecheck`       | Verificación de tipos (0 errores)                |
| `make format`          | Formatea el código                               |
| `make build`           | Build de producción                              |
| `make ci-local`        | Suite completa (lint + typecheck + test + build) |
| `make prisma-generate` | Genera el cliente Prisma                         |
| `make prisma-migrate`  | Crea una nueva migración                         |
| `make prisma-studio`   | Abre Prisma Studio                               |
| `make prisma-deploy`   | Aplica migraciones pendientes                    |
| `make changeset`       | Crea un changeset                                |
| `make release`         | Publica un release                               |
| `make help`            | Lista todos los targets con descripción          |

---

## Estructura del Proyecto

FreakDays es un monorepo pnpm con tres paquetes:

```
freakdays/
├── packages/
│   ├── api/                    # Backend NestJS (freak-days-api, :3001)
│   │   ├── src/
│   │   │   ├── modules/        # Módulos de NestJS
│   │   │   ├── domain/         # Lógica de dominio (eventos, handlers)
│   │   │   └── infra/          # Infraestructura (Prisma, BullMQ, Socket.IO)
│   │   ├── prisma/             # Schema y migraciones de Prisma
│   │   ├── docker-compose.yml  # Postgres :5433 + Redis :6379
│   │   └── .env.example
│   ├── web/                    # Frontend Nuxt 4 (freak-days, :3000)
│   │   ├── app/
│   │   │   ├── components/     # Componentes Vue
│   │   │   ├── pages/          # Páginas/rutas
│   │   │   ├── composables/    # Lógica reutilizable
│   │   │   ├── stores/         # Stores de Pinia
│   │   │   └── assets/
│   │   └── .env.example
│   └── domain/                 # Lógica de dominio compartida (@freakdays/domain, puro TS)
│       └── src/
│           ├── gamification/   # Curvas de EXP, niveles, streaks
│           └── types/          # Tipos TypeScript compartidos
├── Makefile                    # Entrypoint principal
├── pnpm-workspace.yaml
└── docs/
```

---

## Convenciones de Código

### Naming

| Elemento    | Convención           | Ejemplo             |
| ----------- | -------------------- | ------------------- |
| Archivos    | kebab-case           | `anime-card.vue`    |
| Componentes | PascalCase           | `AnimeCard`         |
| Composables | camelCase + `use`    | `useAnime()`        |
| Stores      | camelCase + `Store`  | `useModulesStore()` |
| Tipos       | PascalCase           | `AnimeEntry`        |
| Constantes  | SCREAMING_SNAKE_CASE | `DIFFICULTY_EXP`    |

### Estructura de Componentes

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed } from 'vue';
import type { AnimeEntry } from '@/composables/useAnime';

// 2. Props y Emits
interface Props {
  anime: AnimeEntry;
}

defineProps<Props>();

const emit = defineEmits<{
  update: [value: string];
  delete: [];
}>();

// 3. Composables y Stores
const animeApi = useAnime();
const toast = useToast();

// 4. Refs y Reactive
const isLoading = ref(false);

// 5. Computed
const progress = computed(() => {
  // lógica
});

// 6. Funciones
async function handleUpdate() {
  // lógica
}

// 7. Lifecycle Hooks
onMounted(() => {
  // lógica
});
</script>

<template>
  <!-- Template -->
</template>
```

### TypeScript

- **Strict mode**: Siempre activado
- **Sin `any`**: Usar tipos específicos o `unknown`
- **Interfaces**: Para objetos y estructuras de datos
- **Types**: Para uniones y tipos más complejos

```typescript
// ✅ Correcto
interface User {
  id: string;
  name: string;
}

type Status = 'active' | 'inactive';

// ❌ Incorrecto
const user: any = {};
```

### Vue Composition API

- Siempre usar `<script setup>`
- Preferir `ref` sobre `reactive` para primitivos
- Usar `computed` para valores derivados
- Usar `watch` para efectos secundarios

---

## Testing

### Contadores de tests actuales

| Paquete           | Runner | Tests |
| ----------------- | ------ | ----- |
| `packages/api`    | Jest   | 160   |
| `packages/domain` | Vitest | 38    |
| `packages/web`    | Vitest | 656   |

### Ejecutar Tests

```bash
# Todos los tests
make test

# Solo API
make test-api

# Solo web
make test-web

# Con cobertura
make coverage

# Tests end-to-end
make e2e
```

> Para ejecutar un test individual en el frontend:
>
> ```bash
> cd packages/web && pnpm vitest run path/to/test.spec.ts
> ```

---

## Debugging

### DevTools

Nuxt DevTools está habilitado en desarrollo. Accede en: `http://localhost:3000/_nuxt/dev`

### Vue DevTools

Instala la extensión del navegador:

- [Chrome](https://chrome.google.com/webstore/detail/vuejs-devtools)
- [Firefox](https://addons.mozilla.org/firefox/addon/vue-js-devtools)

### Console Logging

```typescript
// Desarrollo
if (import.meta.dev) {
  console.log('Debug info:', data);
}

// Producción (evitar)
console.error('Error:', error); // Solo errores críticos
```

### Prisma Studio (interfaz para la BD)

```bash
make prisma-studio
```

Abre en `http://localhost:5555`.

### Logs de servicios Docker

```bash
make services-logs
```

---

## Mejores Prácticas

### Performance

1. **Lazy Loading**

```typescript
const HeavyComponent = defineAsyncComponent(() => import('@/components/HeavyComponent.vue'));
```

2. **Computed vs Methods**

```typescript
// ✅ Usar computed para valores derivados
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// ✅ Usar methods para acciones
function handleClick() {
  // acción
}
```

3. **v-show vs v-if**

```vue
<!-- ✅ v-show para elementos que se muestran/ocultan frecuentemente -->
<div v-show="isVisible">Contenido</div>

<!-- ✅ v-if para elementos que raramente se renderizan -->
<Modal v-if="showModal" />
```

### Accesibilidad

1. **Semantic HTML**: usar `<button>`, `<nav>`, `<main>` en lugar de `<div>` con onClick.
2. **ARIA Labels**: en iconos sin texto visible.
3. **Contraste**: mínimo 4.5:1 para texto normal, 3:1 para texto grande.

### Código Limpio

- Funciones pequeñas y con nombres descriptivos.
- El código debe ser auto-documentado (preferir nombres claros a comentarios).
- Sin comentarios que expliquen el "qué" — solo el "por qué" cuando no es obvio.

---

## Workflow de Desarrollo

### 1. Crear una rama

```bash
git checkout -b feat/nueva-funcionalidad
```

### 2. Desarrollar

- Escribir tests primero (TDD donde sea práctico).
- Implementar funcionalidad.
- Asegurar que los tests pasen: `make test`.

### 3. Commit

Conventional commits obligatorios:

```bash
git commit -m "feat: añade nueva funcionalidad"
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

### 4. Push y PR

```bash
git push origin feat/nueva-funcionalidad
```

Crear Pull Request en GitHub.

---

## Troubleshooting

### Error: "Cannot find module"

```bash
make install
```

### Error: "Can't reach database server" / "ECONNREFUSED :5433"

Los servicios Docker no están levantados:

```bash
make services-up
# o el stack completo:
make dev
```

### Error: "Redis connection refused"

Redis es obligatorio para el pipeline de eventos (BullMQ) y Socket.IO. Sin Redis, EXP/niveles/streaks/logros/feed/leaderboard dejan de actualizarse. Asegúrate de que los servicios Docker estén corriendo:

```bash
make services-ps
make services-up
```

### Error: "Type error"

```bash
make typecheck
```

Verifica que TypeScript esté en strict mode y que todos los tipos estén importados.

### Prisma: "Migration failed"

```bash
make prisma-generate
make prisma-deploy
```

---

## Recursos

- [Nuxt Documentation](https://nuxt.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Clerk Documentation](https://clerk.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

---

**Última actualización**: Mayo 2026
