# Guías para IA - FreakDays

Este documento proporciona guías específicas para que las IAs (como Cursor AI) implementen código siguiendo las mejores prácticas de FreakDays.

## 🎯 Principios para Implementación por IA

### 1. Seguir la Arquitectura Existente

**Siempre:**

- Mantener la separación de capas (domain, app, stores)
- Usar composables para lógica reutilizable
- Colocar tipos en `domain/types/`
- Usar componentes UI de shadcn-vue

**Ejemplo Correcto:**

```typescript
// ✅ Correcto: Lógica en composable
// app/composables/useNewFeature.ts
export function useNewFeature() {
  const supabase = useSupabase()
  // lógica aquí
}

// app/components/new-feature/NewFeatureCard.vue
<script setup>
const featureApi = useNewFeature()
// solo UI aquí
</script>
```

**Ejemplo Incorrecto:**

```typescript
// ❌ Incorrecto: Lógica en componente
<script setup>
const supabase = useSupabase()
const { data } = await supabase.from('table').select('*')
// lógica mezclada con UI
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

- [ ] Crear tipos en `domain/types/module-name.ts`
- [ ] Crear composable en `app/composables/useModuleName.ts`
- [ ] Crear componentes en `app/components/module-name/`
- [ ] Crear página en `app/pages/module-name.vue`
- [ ] Añadir migración SQL si es necesario
- [ ] Actualizar `domain/types/modules.ts` si es un módulo principal
- [ ] Añadir icono en `domain/constants/module-icons.ts`
- [ ] Escribir tests en `tests/unit/`

### Al Crear un Nuevo Componente

- [ ] Definir props con TypeScript
- [ ] Definir emits con TypeScript
- [ ] Usar componentes UI de shadcn-vue
- [ ] Añadir skeleton loader si carga datos
- [ ] Manejar estados vacíos con componente `Empty`
- [ ] Añadir tooltips donde sea útil
- [ ] Verificar accesibilidad (ARIA, contraste)

### Al Crear un Nuevo Composable

- [ ] Verificar autenticación al inicio
- [ ] Usar `useSupabase()` para acceso a datos
- [ ] Mapear datos de DB a tipos TypeScript
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

## 🚫 Errores Comunes a Evitar

### 1. No Verificar Autenticación

```typescript
// ❌ Incorrecto
async function fetchData() {
  const { data } = await supabase.from('table').select('*');
  return data;
}

// ✅ Correcto
async function fetchData() {
  const authStore = useAuthStore();
  if (!authStore.userId) return [];

  const { data } = await supabase.from('table').select('*').eq('user_id', authStore.userId);
  return data ?? [];
}
```

### 2. No Manejar Errores

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

### 3. No Usar Tipos

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

### 4. Lógica en Componentes

```vue
<!-- ❌ Incorrecto -->
<script setup>
const supabase = useSupabase();
const { data } = await supabase.from('table').select('*');
</script>

<!-- ✅ Correcto -->
<script setup>
const api = useItems();
const items = await api.fetchItems();
</script>
```

## 📝 Templates Rápidos

### Template: Nuevo Composable

```typescript
// app/composables/useFeatureName.ts
import { useAuthStore } from '~~/stores/auth';
import { useSupabase } from './useSupabase';
import type { FeatureEntity } from '~~/domain/types';

export interface CreateFeatureDTO {
  // definir campos
}

export function useFeatureName() {
  const supabase = useSupabase();
  const authStore = useAuthStore();

  async function fetchAll(): Promise<FeatureEntity[]> {
    if (!authStore.userId) return [];

    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapDbToEntity);
  }

  async function create(dto: CreateFeatureDTO): Promise<FeatureEntity | null> {
    if (!authStore.userId) return null;

    const { data, error } = await supabase
      .from('table_name')
      .insert({
        user_id: authStore.userId,
        // campos del DTO
      })
      .select()
      .single();

    if (error) throw error;

    return data ? mapDbToEntity(data) : null;
  }

  function mapDbToEntity(data: any): FeatureEntity {
    return {
      id: data.id,
      // mapear campos
      createdAt: new Date(data.created_at),
    };
  }

  return {
    fetchAll,
    create,
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

**Última actualización**: Enero 2025
