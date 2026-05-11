<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { LayoutGrid, List, Plus } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  isSubmitting?: boolean
}>(), {
  isSubmitting: false
})

const isSubmittingValue = computed(() => props.isSubmitting)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { name: string, type: 'anime' | 'tier_list' }): void
}>()

const name = ref('')
const type = ref<'anime' | 'tier_list'>('anime')

function handleSubmit() {
  if (!name.value) return
  emit('submit', { name: name.value, type: type.value })
  name.value = ''
  type.value = 'anime'
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crear Nueva Lista</DialogTitle>
        <DialogDescription>
          Elige el tipo de lista que quieres compartir con tu party.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <div class="space-y-2">
          <Label for="list-name">Nombre de la lista *</Label>
          <Input id="list-name" v-model="name" placeholder="Ej: Animes de Temporada, Tier List de Waifus..."
            maxlength="50" aria-required="true" aria-describedby="list-name-helper" autofocus
            @keydown.enter.prevent="name.trim() && handleSubmit()" />
          <p id="list-name-helper" class="text-xs text-muted-foreground">
            Elige un nombre descriptivo para tu lista compartida
          </p>
        </div>

        <div class="space-y-3">
          <Label>Tipo de Lista *</Label>
          <RadioGroup v-model="type" class="grid grid-cols-2 gap-3 sm:gap-4" role="radiogroup"
            aria-label="Tipo de lista a crear">
            <div>
              <RadioGroupItem id="anime" value="anime" class="peer sr-only" />
              <Label
                for="anime"
                class="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 sm:p-6 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200 min-h-[100px] sm:min-h-[120px]"
                role="radio" :aria-checked="type === 'anime'" aria-label="Lista de anime compartida">
                <List class="mb-2 sm:mb-3 h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                <span class="text-sm sm:text-base font-medium text-center">Anime List</span>
                <span class="text-xs text-muted-foreground mt-1 text-center">Comparte animes</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem id="tier" value="tier_list" class="peer sr-only" />
              <Label
                for="tier"
                class="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 sm:p-6 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200 min-h-[100px] sm:min-h-[120px]"
                role="radio" :aria-checked="type === 'tier_list'" aria-label="Tier list colaborativa">
                <LayoutGrid class="mb-2 sm:mb-3 h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                <span class="text-sm sm:text-base font-medium text-center">Tier List</span>
                <span class="text-xs text-muted-foreground mt-1 text-center">Clasifica juntos</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <DialogFooter class="flex-col sm:flex-row gap-2">
        <Button variant="outline" class="w-full sm:w-auto min-h-[44px]" @click="$emit('close')"
          :disabled="isSubmittingValue">
          Cancelar
        </Button>
        <Button class="w-full sm:w-auto min-h-[44px]" @click="handleSubmit" :disabled="!name.trim() || isSubmittingValue">
          <Plus v-if="!isSubmittingValue" class="h-4 w-4 mr-2" aria-hidden="true" />
          <span v-else class="animate-spin mr-2 inline-block" role="status">⏳</span>
          {{ isSubmittingValue ? 'Creando...' : 'Crear Lista' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
