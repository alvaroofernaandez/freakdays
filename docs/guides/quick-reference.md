# Referencia Rápida - FreakDays

Referencia rápida de comandos, patrones comunes y soluciones a problemas frecuentes.

---

## Comandos de desarrollo

```bash
make dev             # Stack completo (servicios + API :3001 + web :3000)
make install         # Instalar dependencias
make dev-setup       # Solo servicios Docker + Prisma (sin servidores)
make dev-down        # Parar Postgres + Redis
make services-up     # Solo levantar contenedores Docker
make services-down   # Solo parar contenedores
make services-logs   # Ver logs de Docker
make services-ps     # Estado de los contenedores
```

## Comandos de testing

```bash
make test            # Todos los tests (API + domain + web)
make test-api        # Solo API (Jest, 160 tests)
make test-web        # Solo web (Vitest, 656 tests)
make coverage        # Tests con cobertura
make e2e             # Tests end-to-end
make typecheck       # Verificación de tipos (0 errores)
make lint            # Linting
make format          # Formatea el código
make ci-local        # Suite completa (lint + typecheck + tests + build)
```

## Comandos de Prisma

```bash
make prisma-generate # Regenera el cliente TypeScript
make prisma-migrate  # Crea y aplica una nueva migración
make prisma-deploy   # Aplica migraciones pendientes
make prisma-studio   # Abre GUI en http://localhost:5555
```

## Build y release

```bash
make build           # Build de producción
make changeset       # Crea un changeset
make release         # Publica un release
make help            # Lista todos los targets
```

---

## Puertos en desarrollo

| Servicio            | Puerto   |
| ------------------- | -------- |
| Frontend Nuxt       | 3000     |
| API NestJS          | 3001     |
| PostgreSQL (Docker) | **5433** |
| Redis (Docker)      | 6379     |
| Prisma Studio       | 5555     |

---

## Snippets de código

### Llamada a la API NestJS

```typescript
// En un composable Nuxt (packages/web)
async function fetchItems() {
  return $fetch('/api/items'); // ruta relativa; NUXT_PUBLIC_API_BASE_URL se aplica automáticamente
}

async function createItem(dto: CreateItemDTO) {
  return $fetch('/api/items', { method: 'POST', body: dto });
}
```

### Cargar datos con loading state

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
  toast.success('Operación exitosa');
} catch (error) {
  errorHandler.handleError(error);
}
```

### Escuchar eventos en tiempo real

```typescript
// En un componente o composable de página
const realtime = useRealtime();
const statsStore = useStatsStore();

onMounted(() => realtime.connect());
onUnmounted(() => realtime.disconnect());

// El store se actualiza automáticamente vía useRealtime
watch(
  () => statsStore.level,
  (newLevel) => {
    // reaccionar al cambio de nivel
  },
);
```

---

## Componentes UI comunes

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
  <CardContent>Contenido</CardContent>
</Card>
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

---

## Patrones Reactivos

### Computed Simple

```typescript
const filtered = computed(() => {
  return items.value.filter((item) => item.active);
});
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

---

## Navegación

```typescript
navigateTo('/anime');
navigateTo({ path: '/anime', query: { filter: 'watching' } });
```

---

## Estilos Comunes

### Gradiente de Texto

```vue
<span class="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
  Texto con gradiente
</span>
```

### Glass Morphism (UI arcade)

```vue
<div class="bg-background/80 backdrop-blur-xl border border-border/50">
  Contenido
</div>
```

---

## Checklist antes de commitear

- [ ] `make typecheck` — sin errores
- [ ] `make lint` — sin errores
- [ ] `make test` — todos pasan
- [ ] Verificación de autenticación en composables nuevos
- [ ] Manejo de errores implementado
- [ ] Estados de carga y estados vacíos
- [ ] Responsive design verificado

---

## Troubleshooting rápido

| Síntoma                                  | Solución                                           |
| ---------------------------------------- | -------------------------------------------------- |
| `ECONNREFUSED :5433`                     | `make services-up`                                 |
| `ECONNREFUSED :6379` (Redis)             | `make services-up`                                 |
| EXP/nivel no se actualiza                | Redis no disponible — verificar `make services-ps` |
| `Cannot find module '@freakdays/domain'` | `make install && make prisma-generate`             |
| Errores de tipo                          | `make typecheck` para ver el detalle               |
| Migración fallida                        | `make prisma-generate && make prisma-deploy`       |

---

**Última actualización**: Mayo 2026
