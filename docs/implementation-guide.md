# Guía de Implementación - FreakDays

Guía paso a paso para implementar nuevas funcionalidades en FreakDays siguiendo las mejores prácticas.

## 🎯 Flujo de Implementación

### Paso 1: Definir Tipos

**Ubicación**: `domain/types/[module-name].ts`

```typescript
export interface EntityType {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityDTO {
  title: string;
  description?: string;
}
```

### Paso 2: Crear Composable

**Ubicación**: `app/composables/use[ModuleName].ts`

Usa el template en `templates/composable.ts.template` como base.

**Checklist:**

- [ ] Verificar autenticación
- [ ] Mapear datos de DB a tipos
- [ ] Manejar errores
- [ ] Retornar tipos bien definidos

### Paso 3: Crear Componentes

**Ubicación**: `app/components/[module]/`

**Componentes necesarios:**

- `[Module]Card.vue` - Tarjeta individual
- `[Module]List.vue` - Lista con filtros
- `[Module]Stats.vue` - Estadísticas
- `[Module]CardSkeleton.vue` - Skeleton loader
- `[Module]StatsSkeleton.vue` - Skeleton loader
- `Add[Module]Modal.vue` - Modal de creación

Usa el template en `templates/component.vue.template` como base.

### Paso 4: Crear Página

**Ubicación**: `app/pages/[module-name].vue`

Usa el template en `templates/page.vue.template` como base.

**Checklist:**

- [ ] Cargar datos con skeleton
- [ ] Manejar estados vacíos
- [ ] Integrar todos los componentes
- [ ] Manejar eventos

### Paso 5: Migración de Base de Datos

**Ubicación**: `database/migrations/[NNN]_[description].sql`

```sql
-- Migration: [Description]
-- Execute this in Supabase SQL Editor
-- Date: YYYY-MM-DD

BEGIN;

-- Crear tabla
CREATE TABLE IF NOT EXISTS public.table_name (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_table_name_user ON public.table_name(user_id);

-- Habilitar RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage own items" ON public.table_name
    FOR ALL USING (auth.uid() = user_id);

COMMIT;
```

### Paso 6: Actualizar Navegación

Si es un módulo principal, actualizar:

- `domain/types/modules.ts` - Añadir a `ALL_MODULES`
- `domain/constants/module-icons.ts` - Añadir icono
- `app/utils/nav-items.ts` - Se añade automáticamente si está en `ALL_MODULES`

### Paso 7: Escribir Tests

**Ubicación**: `tests/unit/[path]/[module].test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '~~/domain/modules/module';

describe('Module', () => {
  describe('functionToTest', () => {
    it('should do something', () => {
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });
  });
});
```

### Paso 8: Documentación

Actualizar:

- `docs/composables.md` - Documentar nuevo composable
- `docs/components.md` - Documentar nuevos componentes
- `docs/pages.md` - Documentar nueva página
- `docs/database.md` - Documentar nueva tabla

## 🔄 Ejemplo Completo: Nuevo Módulo "Books"

### 1. Tipos

```typescript
// domain/types/books.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  readPages: number;
  status: 'reading' | 'completed' | 'want_to_read';
  createdAt: Date;
}

export interface CreateBookDTO {
  title: string;
  author: string;
  pages: number;
  status?: 'reading' | 'completed' | 'want_to_read';
}
```

### 2. Composable

```typescript
// app/composables/useBooks.ts
import { useAuthStore } from '~~/stores/auth';
import { useSupabase } from './useSupabase';
import type { Book, CreateBookDTO } from '~~/domain/types/books';

export function useBooks() {
  const supabase = useSupabase();
  const authStore = useAuthStore();

  async function fetchBooks(): Promise<Book[]> {
    if (!authStore.userId) return [];

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapDbToBook);
  }

  async function createBook(dto: CreateBookDTO): Promise<Book | null> {
    if (!authStore.userId) return null;

    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: authStore.userId,
        title: dto.title,
        author: dto.author,
        pages: dto.pages,
        read_pages: 0,
        status: dto.status || 'reading',
      })
      .select()
      .single();

    if (error) throw error;

    return data ? mapDbToBook(data) : null;
  }

  function mapDbToBook(data: any): Book {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      pages: data.pages,
      readPages: data.read_pages,
      status: data.status,
      createdAt: new Date(data.created_at),
    };
  }

  return {
    fetchBooks,
    createBook,
  };
}
```

### 3. Componente Card

```vue
<!-- app/components/books/BookCard.vue -->
<script setup lang="ts">
import type { Book } from '~~/domain/types/books';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  book: Book;
}

defineProps<Props>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ book.title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Autor: {{ book.author }}</p>
      <p>Páginas: {{ book.readPages }} / {{ book.pages }}</p>
    </CardContent>
  </Card>
</template>
```

### 4. Página

```vue
<!-- app/pages/books.vue -->
<script setup lang="ts">
import { useBooks } from '@/composables/useBooks';
import BookCard from '@/components/books/BookCard.vue';

const booksApi = useBooks();
const books = ref([]);

onMounted(async () => {
  books.value = await booksApi.fetchBooks();
});
</script>

<template>
  <div class="container mx-auto py-6">
    <h1 class="text-3xl font-bold mb-6">Libros</h1>
    <div class="grid grid-cols-3 gap-4">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>
  </div>
</template>
```

## ✅ Checklist Final

Antes de considerar una implementación completa:

- [ ] Tipos definidos en `domain/types/`
- [ ] Composable creado y funcionando
- [ ] Componentes creados con skeleton loaders
- [ ] Página creada con manejo de estados
- [ ] Migración SQL aplicada
- [ ] RLS configurado
- [ ] Tests escritos y pasando
- [ ] Documentación actualizada
- [ ] Sin errores de TypeScript
- [ ] Sin errores de linter
- [ ] Responsive design verificado
- [ ] Accesibilidad básica verificada

## 🚨 Errores Comunes

### Error: "Cannot find module"

**Solución**: Verificar que el alias `~~/` apunta a la raíz del proyecto. Para archivos en `app/`, usar `@/`.

### Error: "Property does not exist"

**Solución**: Verificar que los tipos estén correctamente importados y definidos.

### Error: "RLS policy violation"

**Solución**: Asegurar que todas las queries filtren por `user_id` y que las políticas RLS estén correctamente configuradas.

---

**Última actualización**: Enero 2025
