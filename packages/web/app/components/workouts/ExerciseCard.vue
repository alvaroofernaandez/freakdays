<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Plus, Minus, Loader2, Check, Save } from 'lucide-vue-next'
import type { WorkoutExercise, WorkoutSet } from '@/composables/useWorkouts'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  exercise: WorkoutExercise
  isActive?: boolean
  addingSet?: boolean
  updatingSets?: Set<string>
  savedSets?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  addingSet: false,
  updatingSets: undefined,
  savedSets: undefined,
})

const emit = defineEmits<{
  addSet: [exerciseId: string]
  updateSet: [exerciseId: string, setId: string, updates: { reps?: number; weight_kg?: number }]
  saveSet: [exerciseId: string, setId: string, updates: { reps?: number; weight_kg?: number }]
  removeSet: [exerciseId: string, setId: string]
}>()

const localSetValues = ref<Record<string, { reps?: number; weight_kg?: number }>>({})
const pendingSets = ref<Set<string>>(new Set())

function initializeLocalValues() {
  if (props.exercise.sets) {
    props.exercise.sets.forEach(set => {
      if (!localSetValues.value[set.id] || !pendingSets.value.has(set.id)) {
        localSetValues.value[set.id] = {
          reps: set.reps ?? undefined,
          weight_kg: set.weightKg ?? undefined,
        }
      }
    })
  }
}

watch(() => props.exercise.sets.map(s => s.id), (newSetIds, oldSetIds) => {
  const newIds = new Set(newSetIds)
  const oldIds = oldSetIds ? new Set(oldSetIds) : new Set()
  
  props.exercise.sets.forEach(set => {
    if (!oldIds.has(set.id)) {
      if (!localSetValues.value[set.id]) {
        localSetValues.value[set.id] = {
          reps: set.reps ?? undefined,
          weight_kg: set.weightKg ?? undefined,
        }
      }
    }
  })
  
  oldIds.forEach(setId => {
    if (!newIds.has(setId)) {
      delete localSetValues.value[setId]
      pendingSets.value.delete(setId)
    }
  })
}, { immediate: true })

watch(() => props.exercise.sets, (newSets) => {
  newSets.forEach(set => {
    if (pendingSets.value.has(set.id)) {
      return
    }
    
    const currentLocal = localSetValues.value[set.id]
    if (!currentLocal) {
      localSetValues.value[set.id] = {
        reps: set.reps ?? undefined,
        weight_kg: set.weightKg ?? undefined,
      }
      return
    }
    
    const localReps = currentLocal.reps
    const localWeight = currentLocal.weight_kg
    const propReps = set.reps ?? undefined
    const propWeight = set.weightKg ?? undefined
    
    if (localReps === propReps && localWeight === propWeight) {
      return
    }
    
    if (localReps !== undefined && localReps !== propReps) {
      return
    }
    
    if (localWeight !== undefined && localWeight !== propWeight) {
      return
    }
    
    localSetValues.value[set.id] = {
      reps: propReps,
      weight_kg: propWeight,
    }
  })
}, { deep: true })

function handleSetUpdate(exerciseId: string, setId: string, field: 'reps' | 'weightKg', value: string) {
  const numValue = value === '' ? undefined : Number(value)
  
  if (!localSetValues.value[setId]) {
    localSetValues.value[setId] = {}
  }
  
  pendingSets.value.add(setId)
  
  if (field === 'reps') {
    localSetValues.value[setId].reps = numValue
  } else {
    localSetValues.value[setId].weight_kg = numValue
  }
  
  const updates: { reps?: number; weight_kg?: number } = {
    reps: localSetValues.value[setId].reps,
    weight_kg: localSetValues.value[setId].weight_kg,
  }
  
  emit('updateSet', exerciseId, setId, updates)
}

function handleSetBlur(exerciseId: string, setId: string) {
  const localValues = localSetValues.value[setId]
  if (localValues) {
    emit('updateSet', exerciseId, setId, {
      reps: localValues.reps,
      weight_kg: localValues.weight_kg,
    })
  }
}

function handleSaveSet(exerciseId: string, setId: string) {
  const localValues = localSetValues.value[setId]
  if (localValues) {
    pendingSets.value.delete(setId)
    emit('saveSet', exerciseId, setId, {
      reps: localValues.reps,
      weight_kg: localValues.weight_kg,
    })
    
    nextTick(() => {
      const set = props.exercise.sets.find(s => s.id === setId)
      if (set) {
        localSetValues.value[setId] = {
          reps: set.reps ?? undefined,
          weight_kg: set.weightKg ?? undefined,
        }
      }
    })
  }
}

const hasUnsavedChanges = (setId: string) => {
  return pendingSets.value.has(setId)
}
</script>

<template>
  <div class="space-y-3 p-4 sm:p-5 border rounded-xl bg-card/50">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base sm:text-lg mb-1">{{ exercise.exerciseName }}</h3>
        <p v-if="exercise.sets.length > 0" class="text-xs sm:text-sm text-muted-foreground">
          {{ exercise.sets.length }} {{ exercise.sets.length === 1 ? 'serie' : 'series' }}
        </p>
      </div>
      <Button 
        v-if="isActive"
        variant="ghost" 
        size="sm"
        class="h-9 sm:h-10 px-3 sm:px-4 hover:bg-primary/10 hover:text-primary cursor-pointer shrink-0" 
        @click="emit('addSet', exercise.id)"
        :disabled="addingSet"
      >
        <Plus v-if="!addingSet" class="h-4 w-4 mr-1.5" />
        <Loader2 v-else class="h-4 w-4 mr-1.5 animate-spin" />
        <span class="text-xs sm:text-sm">{{ addingSet ? 'Añadiendo...' : 'Serie' }}</span>
      </Button>
    </div>

    <div v-if="exercise.sets.length === 0" class="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg bg-muted/30">
      <p class="text-sm text-muted-foreground">No hay series registradas</p>
      <p class="text-xs text-muted-foreground/70 mt-1">Añade tu primera serie</p>
    </div>

    <div v-else class="space-y-2">
      <div 
        v-for="set in exercise.sets" 
        :key="set.id" 
        class="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border/50"
      >
        <div class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 shrink-0">
          <span class="text-xs sm:text-sm font-bold text-primary">{{ set.setNumber }}</span>
        </div>
        
        <div class="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
          <div class="space-y-1">
            <Label class="text-[10px] sm:text-xs text-muted-foreground">Reps</Label>
            <div class="relative">
              <Input
                v-if="isActive"
                :model-value="localSetValues[set.id]?.reps ?? set.reps ?? ''"
                type="number"
                min="0"
                placeholder="0"
                class="h-10 sm:h-11 text-base font-medium text-center pr-8"
                :class="{ 
                  'opacity-50': updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id),
                  'border-primary/50': hasUnsavedChanges(set.id)
                }"
                :disabled="updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id)"
                @update:model-value="(val) => handleSetUpdate(exercise.id, set.id, 'reps', val as string)"
                @blur="handleSetBlur(exercise.id, set.id)"
              />
              <div v-else class="h-10 sm:h-11 flex items-center justify-center text-base font-medium">
                {{ set.reps ?? '-' }}
              </div>
              <div v-if="isActive && updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id)" class="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 class="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
              <div v-if="isActive && savedSets && typeof savedSets.has === 'function' && savedSets.has(set.id)" class="absolute right-2 top-1/2 -translate-y-1/2">
                <Check class="h-3 w-3 text-exp-easy" />
              </div>
            </div>
          </div>
          <div class="space-y-1">
            <Label class="text-[10px] sm:text-xs text-muted-foreground">Kg</Label>
            <div class="relative">
              <Input
                v-if="isActive"
                :model-value="localSetValues[set.id]?.weight_kg ?? set.weightKg ?? ''"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                class="h-10 sm:h-11 text-base font-medium text-center pr-8"
                :class="{ 
                  'opacity-50': updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id),
                  'border-primary/50': hasUnsavedChanges(set.id)
                }"
                :disabled="updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id)"
                @update:model-value="(val) => handleSetUpdate(exercise.id, set.id, 'weightKg', val as string)"
                @blur="handleSetBlur(exercise.id, set.id)"
              />
              <div v-else class="h-10 sm:h-11 flex items-center justify-center text-base font-medium">
                {{ set.weightKg ?? '-' }}
              </div>
              <div v-if="isActive && updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id)" class="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 class="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
              <div v-if="isActive && savedSets && typeof savedSets.has === 'function' && savedSets.has(set.id)" class="absolute right-2 top-1/2 -translate-y-1/2">
                <Check class="h-3 w-3 text-exp-easy" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="isActive" class="flex items-center gap-1 shrink-0">
          <Button
            v-if="hasUnsavedChanges(set.id)"
            variant="ghost"
            size="icon"
            class="h-8 w-8 sm:h-9 sm:w-9 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
            @click="handleSaveSet(exercise.id, set.id)"
            :disabled="updatingSets && typeof updatingSets.has === 'function' && updatingSets.has(set.id)"
            aria-label="Guardar serie"
          >
            <Save class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            @click="() => {
              if (!set.id || typeof set.id !== 'string' || set.id.length < 10) {
                return
              }
              emit('removeSet', exercise.id, set.id)
            }"
            aria-label="Eliminar serie"
          >
            <Minus class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

