# FreakDays - Cursor AI Rules

Este archivo contiene reglas y directrices específicas para que Cursor AI siga las mejores prácticas del proyecto FreakDays.

## Principios Fundamentales

1. **Domain-Driven Design**: La lógica de negocio vive en `domain/`, independiente de Vue/Nuxt
2. **Composition API**: Siempre usar Vue 3 Composition API con `<script setup>`
3. **Type Safety**: TypeScript strict mode, sin tipos `any`
4. **Mobile-First**: Diseñar para móvil, mejorar para desktop
5. **Código Auto-documentado**: Evitar comentarios innecesarios

## Estructura de Archivos

### Componentes Vue

```vue
<script setup lang="ts">
// 1. Imports de Vue y librerías
import { ref, computed, onMounted } from 'vue';
import type { Component } from 'vue';

// 2. Imports de tipos
import type { UserProfile } from '@/composables/useProfile';

// 3. Imports de composables
import { useAnime } from '@/composables/useAnime';
import { useToast } from '@/composables/useToast';

// 4. Imports de componentes
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// 5. Imports de iconos
import { Plus, Trash2 } from 'lucide-vue-next';

// 6. Props y Emits
interface Props {
  title: string;
  items: Item[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  add: [item: Item];
  delete: [id: string];
}>();

// 7. Composables y Stores
const animeApi = useAnime();
const toast = useToast();

// 8. Refs y Reactive
const isLoading = ref(false);
const searchQuery = ref('');

// 9. Computed
const filteredItems = computed(() => {
  return props.items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// 10. Funciones
async function handleAdd(item: Item) {
  isLoading.value = true;
  try {
    await animeApi.addAnime(item);
    emit('add', item);
    toast.success('Añadido exitosamente');
  } catch (error) {
    toast.error('Error al añadir');
  } finally {
    isLoading.value = false;
  }
}

// 11. Lifecycle Hooks
onMounted(() => {
  // inicialización
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- contenido -->
    </CardContent>
  </Card>
</template>
```

### Composables

```typescript
// app/composables/useNewFeature.ts
import { useAuthStore } from '~~/stores/auth';
import { useSupabase } from './useSupabase';
import type { NewEntity } from '~~/domain/types';

export interface CreateNewEntityDTO {
  title: string;
  description?: string;
}

export function useNewFeature() {
  const supabase = useSupabase();
  const authStore = useAuthStore();

  async function fetchEntities(): Promise<NewEntity[]> {
    if (!authStore.userId) return [];

    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapDbToEntity);
  }

  async function createEntity(dto: CreateNewEntityDTO): Promise<NewEntity | null> {
    if (!authStore.userId) return null;

    const { data, error } = await supabase
      .from('table_name')
      .insert({
        user_id: authStore.userId,
        title: dto.title,
        description: dto.description,
      })
      .select()
      .single();

    if (error) throw error;

    return data ? mapDbToEntity(data) : null;
  }

  function mapDbToEntity(data: any): NewEntity {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      createdAt: new Date(data.created_at),
    };
  }

  return {
    fetchEntities,
    createEntity,
  };
}
```

## Convenciones de Naming

- **Archivos**: kebab-case (`anime-card.vue`, `use-anime.ts`)
- **Componentes**: PascalCase (`AnimeCard`, `AnimeStats`)
- **Composables**: camelCase con prefijo `use` (`useAnime`, `useQuests`)
- **Stores**: camelCase con sufijo `Store` (`useModulesStore`, `useAuthStore`)
- **Tipos/Interfaces**: PascalCase (`AnimeEntry`, `CreateAnimeDTO`)
- **Constantes**: SCREAMING_SNAKE_CASE (`DIFFICULTY_EXP`, `MAX_ITEMS`)

## Manejo de Errores

Siempre usar el composable `useErrorHandler`:

```typescript
const errorHandler = useErrorHandler();

try {
  await someOperation();
} catch (error) {
  errorHandler.handleError(error);
}
```

O usar `handleAsyncError`:

```typescript
await errorHandler.handleAsyncError(async () => {
  await someOperation();
});
```

## Estado y Reactividad

- Usar `ref` para valores primitivos
- Usar `computed` para valores derivados
- Usar `watch` para efectos secundarios
- Preferir `v-show` sobre `v-if` para elementos que se muestran/ocultan frecuentemente
- **Importante**: Al desestructurar refs de composables, usar `toRef()` para mantener reactividad:

```typescript
const profilePage = useProfilePage();
const uploadingBanner = toRef(profilePage, 'uploadingBanner');
const bannerPreview = toRef(profilePage, 'bannerPreview');
```

**NO hacer esto** (pierde reactividad):

```typescript
const { uploadingBanner, bannerPreview } = profilePage; // ❌
```

**SÍ hacer esto**:

```typescript
const uploadingBanner = toRef(profilePage, 'uploadingBanner'); // ✅
const bannerPreview = toRef(profilePage, 'bannerPreview'); // ✅
```

## Acceso a Datos

1. **Siempre verificar autenticación**:

```typescript
if (!authStore.userId) return [];
```

2. **Usar composables específicos**:

```typescript
const animeApi = useAnime();
const animeList = await animeApi.fetchAnimeList();
```

3. **Manejar errores apropiadamente**:

```typescript
try {
  const data = await animeApi.addAnime(dto);
} catch (error) {
  toast.error('Error al añadir anime');
}
```

## Componentes UI

Siempre usar componentes de shadcn-vue desde `@/components/ui/`:

```vue
<Button variant="default" size="md">Click</Button>
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido</CardContent>
</Card>
```

### Sheet Components

Para paneles laterales (mobile/tablet) usar Sheet:

```vue
<Sheet :open="isOpen" @update:open="isOpen = $event">
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Título</SheetTitle>
      <SheetDescription>Descripción</SheetDescription>
    </SheetHeader>
    <div>Contenido</div>
  </SheetContent>
</Sheet>
```

**Lados disponibles**: `'top' | 'right' | 'bottom' | 'left'`

## Testing

Al crear nueva funcionalidad:

1. Escribir tests primero (TDD)
2. Tests en `tests/unit/` siguiendo la estructura del código
3. Cobertura objetivo: 80%+ en lógica de negocio

## Base de Datos

1. **Siempre usar RLS**: Todas las queries deben filtrar por `user_id`
2. **Usar migraciones**: Nunca modificar `schema.sql` directamente
3. **Validar en cliente y servidor**: RLS es la última línea de defensa

## Performance

1. **Lazy loading** para componentes pesados
2. **Debouncing** para búsquedas (500ms mínimo)
3. **AbortController** para cancelar requests
4. **Skeleton loaders** durante carga de datos

## Accesibilidad

1. **HTML semántico**: Usar `<button>`, `<nav>`, `<main>`, etc.
2. **ARIA labels**: Para iconos y elementos no descriptivos
3. **Contraste**: Mínimo 4.5:1 para texto
4. **Touch targets**: Mínimo 44x44px en mobile
5. **Keyboard navigation**: Todos los elementos interactivos deben ser accesibles por teclado

## Imports

- Usar alias `@/` para archivos en `app/`
- Usar alias `~~/` para archivos en la raíz
- Agrupar imports: Vue, tipos, composables, componentes, iconos
- Orden de imports:
  1. Vue y librerías
  2. Tipos
  3. Composables
  4. Componentes
  5. Iconos
  6. Stores (si es necesario)

## Mobile/Tablet Considerations

### Responsive Design

- **Mobile-first**: Diseñar primero para mobile, luego mejorar para desktop
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px (tablet/desktop)
- **Touch targets**: Mínimo 44x44px
- **Sheets para mobile**: Usar `Sheet` en lugar de modales para mobile/tablet

### Drag and Drop

- **Desktop**: Habilitar drag and drop nativo
- **Mobile/Tablet**: Deshabilitar drag and drop, usar alternativas táctiles
- Detectar mobile/tablet con `window.innerWidth < 1024`

```typescript
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
});
```

### Image Upload

- **Banners**: Usar `BannerCropModal` para recortar antes de subir
- **Avatares**: Subida directa, pero considerar recorte futuro
- **Validación**: Verificar tipo de archivo y tamaño (máx 10MB para banners, 5MB para avatares)
- **Storage**: Usar buckets separados (`avatars` y `banners`)

### Supabase Storage

- **Buckets**: `avatars` y `banners` deben existir en Supabase
- **RLS Policies**: Configurar políticas para cada bucket
- **Paths**: Usar formato `{userId}/{filename}` para organización

## No Hacer

- ❌ No usar tipos `any`
- ❌ No usar `reactive` para primitivos
- ❌ No poner lógica de negocio en componentes
- ❌ No hardcodear valores mágicos (usar constantes)
- ❌ No commitear archivos `.env`
- ❌ No usar comentarios innecesarios
- ❌ No crear componentes sin props tipadas
- ❌ No acceder directamente a Supabase desde componentes

## Sí Hacer

- ✅ Usar TypeScript strict mode
- ✅ Usar composables para lógica reutilizable
- ✅ Usar stores de Pinia para estado global
- ✅ Usar componentes UI de shadcn-vue
- ✅ Validar inputs en cliente y servidor
- ✅ Manejar errores apropiadamente
- ✅ Usar skeleton loaders durante carga
- ✅ Seguir la estructura de archivos establecida
- ✅ Usar `toRef()` al desestructurar refs de composables
- ✅ Diseñar mobile-first
- ✅ Probar en diferentes tamaños de pantalla
- ✅ Usar Sheets para mobile/tablet en lugar de modales
- ✅ Deshabilitar drag and drop en mobile/tablet
- ✅ Añadir tests para nuevas funcionalidades

## Referencias

- Ver `AGENTS.md` para convenciones detalladas
- Ver `docs/` para documentación completa
- Ver componentes existentes como ejemplos

---

# FreakDays - Agent Guidelines & Project Conventions

## Project Overview

**FreakDays** es una aplicación de gestión de vida cotidiana para personas "frikis". Permite gestionar entrenamientos, colecciones de manga, animes, misiones diarias (quests), grupos (party system) y calendario de lanzamientos.

## Architecture Principles

### Separation of Concerns

```
freak-days/
├── app/                    # Nuxt application layer
│   ├── components/         # Vue components (UI only)
│   ├── pages/              # Route pages
│   ├── layouts/            # Page layouts
│   └── composables/        # Vue composables
├── domain/                 # Business logic (framework-agnostic)
│   ├── types/              # TypeScript interfaces
│   └── modules/            # Domain logic per module
├── stores/                 # Pinia state management
├── services/               # Data layer abstraction
│   └── repositories/       # Supabase-ready repositories
└── tests/                  # Test files mirror source structure
```

### Key Principles

1. **Domain-Driven**: Business logic lives in `domain/`, independent of Vue/Nuxt.
2. **Composition API**: Always use Vue 3 Composition API with `<script setup>`.
3. **Type Safety**: Strict TypeScript everywhere. No `any` types.
4. **Mobile-First**: Design for mobile, enhance for desktop.

---

## Code Conventions

### Naming

| Element          | Convention                     | Example             |
| ---------------- | ------------------------------ | ------------------- |
| Files/Folders    | kebab-case                     | `quest-card.vue`    |
| Components       | PascalCase                     | `QuestCard`         |
| Composables      | camelCase with `use` prefix    | `useQuests()`       |
| Stores           | camelCase with `use` + `Store` | `useModulesStore()` |
| Types/Interfaces | PascalCase                     | `Quest`, `ModuleId` |
| Constants        | SCREAMING_SNAKE_CASE           | `DIFFICULTY_EXP`    |

### File Structure

```vue
<script setup lang="ts">
// imports
// props/emits
// composables/stores
// refs/reactive
// computed
// functions
// lifecycle hooks
</script>

<template>
  <!-- single root element preferred -->
</template>
```

### No Comments Rule

Code should be self-documenting. Avoid inline comments except for:

- Complex regex explanations
- Non-obvious business rules
- TODO markers (temporary)

---

## TDD Guidelines

### Test-First Workflow

1. Write failing test
2. Write minimal code to pass
3. Refactor while keeping tests green

### What to Test

| Layer          | Test Type   | Coverage Target |
| -------------- | ----------- | --------------- |
| `domain/`      | Unit tests  | 90%+            |
| `stores/`      | Unit tests  | 80%+            |
| `composables/` | Unit tests  | 80%+            |
| Components     | Integration | Critical paths  |

### Test Naming

```typescript
describe('ComponentName or FunctionName', () => {
  describe('methodName or scenario', () => {
    it('should [expected behavior] when [condition]', () => {});
  });
});
```

### Running Tests

```bash
pnpm test           # Run all tests once
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

---

## Tailwind & shadcn-vue

### Theme Colors

| Token        | Purpose                   |
| ------------ | ------------------------- |
| `primary`    | Main brand color (purple) |
| `secondary`  | Accent pink               |
| `accent`     | Highlight cyan            |
| `background` | Dark background           |
| `foreground` | Text color                |
| `muted`      | Subdued elements          |
| `exp-*`      | Quest difficulty colors   |

### Component Usage

```vue
<template>
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</template>
```

### Adding New Components

```bash
pnpm dlx shadcn-vue@latest add [component-name]
```

---

## Adding New Features

### Checklist

1. [ ] Create types in `domain/types/`
2. [ ] Write tests first in `tests/unit/`
3. [ ] Implement domain logic in `domain/modules/`
4. [ ] Create/update Pinia store in `stores/`
5. [ ] Build UI components in `app/components/`
6. [ ] Create page in `app/pages/`
7. [ ] Update database schema if needed
8. [ ] Verify all tests pass

### New Module Template

```typescript
// domain/types/new-module.ts
export interface NewEntity {
  id: string;
  // ...
}

// stores/new-module.ts
export const useNewModuleStore = defineStore('new-module', () => {
  // state, getters, actions
});
```

---

## Supabase Integration

### Repository Pattern

```typescript
// services/repositories/base.ts
export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Environment Variables

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

---

## Performance Guidelines

1. **Lazy Loading**: Use `defineAsyncComponent` for heavy components
2. **Image Optimization**: Use Nuxt Image when available
3. **State Hydration**: Minimize initial payload
4. **Bundle Size**: Check with `pnpm build --analyze`
5. **Image Upload**: Crop images before upload to reduce file size
6. **Canvas Operations**: Use `toBlob()` for image processing

---

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include ARIA labels where needed
- Maintain 4.5:1 contrast ratio minimum
- Touch targets minimum 44x44px on mobile
- Support screen readers with proper ARIA attributes

## Mobile/Tablet Patterns

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: ≥ 1024px

### Component Patterns

- **Sheets**: Use `Sheet` component for side panels on mobile/tablet
- **Modals**: Use `Modal` for desktop, `Sheet` for mobile/tablet
- **Drag and Drop**: Disable on mobile/tablet, use touch alternatives
- **Navigation**: Bottom navigation on mobile, sidebar on desktop

### Image Handling

- **Banners**: 16:9 aspect ratio, crop before upload
- **Avatares**: Square format, direct upload
- **Storage**: Separate buckets for `avatars` and `banners`
- **Processing**: Use Canvas API for image cropping

## Reactivity Best Practices

When destructuring refs from composables, use `toRef()` to maintain reactivity:

```typescript
import { toRef } from 'vue';

const profilePage = useProfilePage();
const uploadingBanner = toRef(profilePage, 'uploadingBanner');
const bannerPreview = toRef(profilePage, 'bannerPreview');
```

**Why**: Direct destructuring loses reactivity, `toRef()` creates a reactive reference.
