<script setup lang="ts">
import { Loader2, Search, X } from 'lucide-vue-next';

interface Props {
  query: string
  searching: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:query': [value: string]
  search: [query: string]
  clear: []
}>()

const localQuery = ref(props.query || '')

watch(() => props.query, (newQuery) => {
  if (newQuery !== localQuery.value) {
    localQuery.value = newQuery || ''
  }
})

function handleInput(value: string | number) {
  const stringValue = String(value)
  localQuery.value = stringValue
  emit('update:query', stringValue)
  emit('search', stringValue)
}

function handleClear() {
  localQuery.value = ''
  emit('update:query', '')
  emit('clear')
}
</script>

<template>
  <div class="relative w-full bg-background"
    style="position: relative; z-index: 10; display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 60px; pointer-events: auto !important;">
    <div class="relative flex items-center w-full" style="pointer-events: auto !important;">
      <Search v-if="!searching" class="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
      <Loader2 v-else class="absolute left-3 h-5 w-5 text-primary animate-spin pointer-events-none z-10" />
      <Input :model-value="localQuery" @update:model-value="handleInput"
        placeholder="Buscar anime (ej: One Piece, Naruto...)" class="pl-10 pr-10 h-12 text-base w-full bg-background"
        style="position: relative; z-index: 1; display: block !important; visibility: visible !important; opacity: 1 !important;"
        autofocus />
      <Button v-if="localQuery" variant="ghost" size="icon" class="absolute right-1 h-8 w-8 hover:bg-muted z-10"
        style="position: absolute; z-index: 15;" @click="handleClear">
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
