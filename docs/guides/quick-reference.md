# Referencia Rápida - FreakDays

Referencia rápida de patrones comunes, snippets de código y soluciones a problemas frecuentes.

## 🚀 Snippets Rápidos

### Verificar Autenticación

```typescript
const authStore = useAuthStore();
if (!authStore.userId) return [];
```

### Cargar Datos con Loading

```typescript
const items = ref([]);
const isLoading = ref(false);

async function loadItems() {
  isLoading.value = true;
  try {
    items.value = await api.fetchItems();
  } catch (error) {
    toast.error('Error al cargar');
  } finally {
    isLoading.value = false;
  }
}
```

### Manejar Errores

```typescript
try {
  await operation();
  toast.success('Éxito');
} catch (error) {
  errorHandler.handleError(error);
}
```

### Query Supabase Básica

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', authStore.userId)
  .order('created_at', { ascending: false });

if (error) throw error;
return data ?? [];
```

### Insert en Supabase

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert({
    user_id: authStore.userId,
    field: value,
  })
  .select()
  .single();

if (error) throw error;
return data;
```

### Update en Supabase

```typescript
const { error } = await supabase
  .from('table_name')
  .update({ field: newValue })
  .eq('id', id)
  .eq('user_id', authStore.userId);

if (error) throw error;
```

### Delete en Supabase

```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', id)
  .eq('user_id', authStore.userId);

if (error) throw error;
```

## 🎨 Componentes UI Comunes

### Botón con Loading

```vue
<Button @click="handleClick" :disabled="isLoading">
  {{ isLoading ? 'Cargando...' : 'Guardar' }}
</Button>
```

### Card con Header

```vue
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Modal de Formulario

```vue
<Dialog :open="open" @update:open="$emit('update:open', $event)">
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    <form @submit.prevent="handleSubmit">
      <!-- campos -->
    </form>
    <DialogFooter>
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Estado Vacío

```vue
<Empty title="No hay elementos" description="Añade tu primer elemento" :icon="Plus" />
```

### Skeleton Loader

```vue
<div v-if="loading">
  <Skeleton class="h-20 w-full" />
</div>
<div v-else>
  <!-- contenido -->
</div>
```

## 🔄 Patrones Reactivos

### Computed Simple

```typescript
const filtered = computed(() => {
  return items.value.filter((item) => item.active);
});
```

### Computed con Parámetros

```typescript
const getItem = computed(() => (id: string) => {
  return items.value.find((item) => item.id === id);
});
```

### Watch Simple

```typescript
watch(
  () => route.query.filter,
  (newFilter) => {
    loadItems(newFilter);
  },
);
```

### Watch con Inmediato

```typescript
watch(
  () => props.item,
  (newItem) => {
    form.value = { ...newItem };
  },
  { immediate: true },
);
```

## 📱 Responsive Design

### Grid Responsive

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- items -->
</div>
```

### Mostrar/Ocultar por Breakpoint

```vue
<div class="hidden md:block">Desktop</div>
<div class="block md:hidden">Mobile</div>
```

## 🎯 Navegación

### Navegación Programática

```typescript
navigateTo('/anime');
navigateTo({ path: '/anime', query: { filter: 'watching' } });
```

### Query Params

```typescript
const route = useRoute();
const filter = computed(() => route.query.filter as string);

function updateFilter(newFilter: string) {
  navigateTo({
    query: { ...route.query, filter: newFilter },
  });
}
```

## 🔐 Autenticación

### Verificar si está Autenticado

```typescript
const authStore = useAuthStore();
if (!authStore.isAuthenticated) {
  navigateTo('/login');
}
```

### Obtener User ID

```typescript
const authStore = useAuthStore();
const userId = authStore.userId;
```

## 📊 Estadísticas

### Calcular Totales

```typescript
const stats = computed(() => {
  return {
    total: items.value.length,
    active: items.value.filter((i) => i.status === 'active').length,
    completed: items.value.filter((i) => i.status === 'completed').length,
  };
});
```

## 🎨 Estilos Comunes

### Gradiente de Texto

```vue
<span class="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
  Texto con gradiente
</span>
```

### Glass Morphism

```vue
<div class="bg-background/80 backdrop-blur-xl border border-border/50">
  Contenido
</div>
```

### Hover Effects

```vue
<div class="transition-all hover:scale-105 hover:shadow-lg">
  Contenido
</div>
```

## 🐛 Debugging

### Console Log Condicional

```typescript
if (import.meta.dev) {
  console.log('Debug:', data);
}
```

### Ver Estado del Store

```typescript
const store = useModulesStore();
console.log('Store state:', store.$state);
```

## 📝 Imports Comunes

### Vue

```typescript
import { ref, computed, watch, onMounted } from 'vue';
```

### Composables

```typescript
import { useSupabase } from '@/composables/useSupabase';
import { useAuthStore } from '~~/stores/auth';
import { useToast } from '@/composables/useToast';
```

### Componentes UI

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
```

### Iconos

```typescript
import { Plus, Trash2, Edit2 } from 'lucide-vue-next';
```

## ✅ Checklist Rápido

Antes de commitear:

- [ ] TypeScript sin errores
- [ ] Linter sin errores
- [ ] Tests pasan
- [ ] Verificación de autenticación
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Estados vacíos
- [ ] Responsive design

---

**Última actualización**: Enero 2025
