# Guías para IA - FreakDays

Este documento proporciona guías específicas para que agentes e IAs implementen código siguiendo las mejores prácticas de FreakDays.

## Contexto rápido del proyecto

- **Monorepo pnpm**. Paquetes: `packages/api` (NestJS, :3001), `packages/web` (Nuxt 4, :3000), `packages/domain` (`@freakdays/domain`, TypeScript puro).
- **Entrypoint de desarrollo**: `make dev` (levanta todo).
- **Base de datos**: PostgreSQL en Docker, puerto **5433** (no 5432). Gestionado con **Prisma**.
- **Redis**: requerido para BullMQ y Socket.IO. También corre en Docker.
- **Auth**: Clerk (no Supabase).
- **Storage**: Cloudflare R2 (no Supabase Storage).
- **Tests**: API → Jest (160), domain → Vitest (38), web → Vitest (656). `make test` para todos.
- **Ver**: `make help` para todos los comandos disponibles.

---

## Principios para Implementación por IA

### 1. Seguir la Arquitectura Existente

**Siempre:**

- Mantener la separación de capas (domain, api, web)
- Usar composables para lógica reutilizable en el frontend
- Colocar tipos compartidos en `packages/domain`
- Usar componentes UI de shadcn-vue
- Los composables Nuxt llaman a la API NestJS vía `$fetch`, nunca acceden a la BD directamente

**Ejemplo correcto:**

```typescript
// ✅ Correcto: composable llama a la API NestJS
// packages/web/app/composables/useNewFeature.ts
export function useNewFeature() {
  async function fetchAll() {
    return $fetch('/api/new-feature');
  }
  return { fetchAll };
}

// packages/web/app/components/new-feature/NewFeatureCard.vue
<script setup>
const featureApi = useNewFeature()
// solo UI aquí
</script>
```

**Ejemplo incorrecto:**

```typescript
// ❌ Incorrecto: acceso directo a BD desde el frontend
<script setup>
const prisma = usePrisma() // NO existe en el frontend
const data = await prisma.table.findMany()
</script>
```

### 2. TypeScript Estricto

**Siempre:**

- Definir interfaces para todos los objetos
- No usar `any` (usar `unknown` si es necesario)
- Tipar props, emits, y funciones

**Ejemplo:**

```typescript
// ✅ Correcto
interface Props {
  title: string;
  items: Item[];
  optional?: boolean;
}

const props = defineProps<Props>();

// ❌ Incorrecto
const props = defineProps({
  title: String,
  items: Array,
});
```

### 3. Manejo de Errores Consistente

**Siempre usar:**

```typescript
const errorHandler = useErrorHandler();
const toast = useToast();

try {
  await operation();
  toast.success('Operación exitosa');
} catch (error) {
  errorHandler.handleError(error);
}
```

### 4. Verificación de Autenticación

**Siempre verificar antes de operaciones:**

```typescript
const authStore = useAuthStore();

if (!authStore.userId) {
  return []; // o null, o redirigir
}
```

## 📋 Checklist para Nuevas Funcionalidades

### Al Crear un Nuevo Módulo

- [ ] Crear tipos compartidos en `packages/domain/src/` (si son cross-package)
- [ ] Crear módulo NestJS en `packages/api/src/modules/module-name/`
- [ ] Añadir modelo en `packages/api/prisma/schema.prisma` y ejecutar `make prisma-migrate`
- [ ] Publicar evento de dominio en la misma transacción si la acción dispara gamificación
- [ ] Crear composable en `packages/web/app/composables/useModuleName.ts`
- [ ] Crear componentes en `packages/web/app/components/module-name/`
- [ ] Crear página en `packages/web/app/pages/module-name.vue`
- [ ] Actualizar navegación si es un módulo principal
- [ ] Escribir tests (`packages/api/src/modules/module-name/*.spec.ts` y `packages/web/app/**/*.spec.ts`)

### Al Crear un Nuevo Componente

- [ ] Definir props con TypeScript
- [ ] Definir emits con TypeScript
- [ ] Usar componentes UI de shadcn-vue
- [ ] Añadir skeleton loader si carga datos
- [ ] Manejar estados vacíos con componente `Empty`
- [ ] Añadir tooltips donde sea útil
- [ ] Verificar accesibilidad (ARIA, contraste)

### Al Crear un Nuevo Composable

- [ ] Llamar a la API NestJS con `$fetch` (no acceder a la BD directamente)
- [ ] Mapear la respuesta a tipos TypeScript
- [ ] Manejar errores apropiadamente
- [ ] Retornar tipos bien definidos
- [ ] Documentar funciones complejas

## 🔄 Patrones Comunes

### Patrón: Lista con Filtros

```vue
<script setup lang="ts">
const items = ref<Item[]>([]);
const filter = ref<'all' | 'active' | 'completed'>('all');

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value;
  return items.value.filter((item) => item.status === filter.value);
});

async function loadItems() {
  const api = useItems();
  items.value = await api.fetchItems();
}

onMounted(() => {
  loadItems();
});
</script>

<template>
  <div>
    <Tabs v-model="filter">
      <TabsList>
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="active">Activos</TabsTrigger>
        <TabsTrigger value="completed">Completados</TabsTrigger>
      </TabsList>
    </Tabs>

    <div v-if="loading">
      <ItemCardSkeleton v-for="i in 3" :key="i" />
    </div>

    <Empty
      v-else-if="filteredItems.length === 0"
      title="No hay elementos"
      description="Añade tu primer elemento"
    />

    <ItemCard v-for="item in filteredItems" :key="item.id" :item="item" @delete="handleDelete" />
  </div>
</template>
```

### Patrón: Modal de Formulario

```vue
<script setup lang="ts">
interface Props {
  open: boolean;
  item?: Item | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  save: [item: Item];
}>();

const form = ref({
  title: '',
  description: '',
});

const isLoading = ref(false);
const api = useItems();
const toast = useToast();

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.item) {
      form.value = {
        title: props.item.title,
        description: props.item.description,
      };
    } else if (isOpen) {
      form.value = { title: '', description: '' };
    }
  },
);

async function handleSave() {
  if (!form.value.title.trim()) {
    toast.error('El título es requerido');
    return;
  }

  isLoading.value = true;
  try {
    const item = props.item
      ? await api.updateItem(props.item.id, form.value)
      : await api.createItem(form.value);

    emit('save', item);
    emit('update:open', false);
    toast.success(props.item ? 'Actualizado' : 'Creado');
  } catch (error) {
    toast.error('Error al guardar');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ item ? 'Editar' : 'Crear' }} Item</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div>
          <Label>Título</Label>
          <Input v-model="form.title" />
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea v-model="form.description" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)"> Cancelar </Button>
        <Button @click="handleSave" :disabled="isLoading">
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Patrón: Estadísticas con Skeleton

```vue
<script setup lang="ts">
interface Props {
  items: Item[];
}

const props = defineProps<Props>();

const stats = computed(() => {
  return {
    total: props.items.length,
    active: props.items.filter((i) => i.status === 'active').length,
    completed: props.items.filter((i) => i.status === 'completed').length,
  };
});
</script>

<template>
  <div v-if="loading" class="grid grid-cols-3 gap-4">
    <StatsCardSkeleton v-for="i in 3" :key="i" />
  </div>

  <div v-else class="grid grid-cols-3 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Total</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ stats.total }}</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Activos</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ stats.active }}</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Completados</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ stats.completed }}</div>
      </CardContent>
    </Card>
  </div>
</template>
```

## Errores Comunes a Evitar

### 1. Acceder a la BD directamente desde el frontend

```typescript
// ❌ Incorrecto: no hay Prisma en el frontend
const prisma = new PrismaClient();
const data = await prisma.table.findMany();

// ✅ Correcto: llamar a la API NestJS
const data = await $fetch('/api/table');
```

### 2. Usar puerto 5432 para la BD en desarrollo

```env
# ❌ Incorrecto
DATABASE_URL=postgresql://...@localhost:5432/...

# ✅ Correcto
DATABASE_URL=postgresql://...@localhost:5433/...
```

### 3. No Manejar Errores

```typescript
// ❌ Incorrecto
async function save() {
  await api.create(data);
}

// ✅ Correcto
async function save() {
  try {
    await api.create(data);
    toast.success('Guardado');
  } catch (error) {
    toast.error('Error al guardar');
  }
}
```

### 4. No Usar Tipos

```typescript
// ❌ Incorrecto
const items = ref([]);
function addItem(item: any) {
  items.value.push(item);
}

// ✅ Correcto
interface Item {
  id: string;
  title: string;
}

const items = ref<Item[]>([]);
function addItem(item: Item) {
  items.value.push(item);
}
```

### 5. Lógica en Componentes

```vue
<!-- ❌ Incorrecto -->
<script setup>
const data = await $fetch('/api/table'); // lógica mezclada con UI
</script>

<!-- ✅ Correcto -->
<script setup>
const api = useItems();
const items = await api.fetchItems(); // la lógica vive en el composable
</script>
```

### 6. Olvidar que Redis es obligatorio

Si los tests de integración o el stack local fallan con errores de conexión a Redis, levanta los servicios:

```bash
make services-up
```

Sin Redis, el pipeline BullMQ no funciona y la gamificación no se procesa.

## 📝 Templates Rápidos

### Template: Nuevo Composable

```typescript
// packages/web/app/composables/useFeatureName.ts
import type { FeatureEntity, CreateFeatureDTO } from '@freakdays/domain';

export function useFeatureName() {
  async function fetchAll(): Promise<FeatureEntity[]> {
    return $fetch<FeatureEntity[]>('/api/feature-name');
  }

  async function create(dto: CreateFeatureDTO): Promise<FeatureEntity> {
    return $fetch<FeatureEntity>('/api/feature-name', {
      method: 'POST',
      body: dto,
    });
  }

  async function remove(id: string): Promise<void> {
    await $fetch(`/api/feature-name/${id}`, { method: 'DELETE' });
  }

  return {
    fetchAll,
    create,
    remove,
  };
}
```

### Template: Nuevo Componente

```vue
<!-- app/components/feature/FeatureCard.vue -->
<script setup lang="ts">
import type { FeatureEntity } from '~~/domain/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  feature: FeatureEntity;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [id: string];
}>();

function handleDelete() {
  emit('delete', props.feature.id);
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ feature.title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{{ feature.description }}</p>
      <Button variant="destructive" @click="handleDelete">
        <Trash2 class="h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
</template>
```

## 🎨 Reglas de UI/UX

1. **Siempre mostrar feedback visual**:
   - Loading states (skeleton loaders)
   - Success/error toasts
   - Disabled states en botones

2. **Manejar estados vacíos**:
   - Usar componente `Empty`
   - Mensajes descriptivos
   - Acciones claras

3. **Responsive design**:
   - Mobile-first
   - Breakpoints de Tailwind
   - Testing en diferentes tamaños

4. **Accesibilidad**:
   - ARIA labels
   - Keyboard navigation
   - Contraste adecuado

## 🔍 Verificación Antes de Completar

Antes de considerar una implementación completa, verificar:

- [ ] TypeScript sin errores
- [ ] Todos los imports correctos
- [ ] Manejo de errores implementado
- [ ] Verificación de autenticación
- [ ] Estados de carga manejados
- [ ] Estados vacíos manejados
- [ ] Accesibilidad básica
- [ ] Responsive design
- [ ] Sigue convenciones de naming
- [ ] Usa componentes UI existentes

---

**Última actualización**: Mayo 2026
