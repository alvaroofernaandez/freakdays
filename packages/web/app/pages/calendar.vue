<script setup lang="ts">
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import DayEventsSheet from '@/components/calendar/DayEventsSheet.vue'
import DeleteEventConfirmModal from '@/components/calendar/DeleteEventConfirmModal.vue'
import EditEventSheet from '@/components/calendar/EditEventSheet.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateReleaseDTO, Release, ReleaseType } from '@/composables/useCalendar'
import { useCalendarPage } from '@/composables/useCalendarPage'
import { BookOpen, Calendar as CalendarIcon, Plus, Ticket, Tv, X } from 'lucide-vue-next'

const {
  releases,
  loading,
  modal,
  currentMonth,
  newRelease,
  monthName,
  formatDate,
  addRelease,
  updateEventDate,
  deleteReleaseEntry,
  updateReleaseEntry,
} = useCalendarPage()

const deleteModal = useModal()
const releaseToDelete = ref<Release | null>(null)
const isDeleting = ref(false)

const editSheetOpen = ref(false)
const releaseToEdit = ref<Release | null>(null)
const isUpdating = ref(false)

const dayEventsSheetOpen = ref(false)
const selectedDay = ref<Date | null>(null)
const isMovingEvent = ref(false)

function handleDeleteRequest(release: Release) {
  releaseToDelete.value = release
  deleteModal.open()
}

async function handleDeleteConfirm(releaseId: string) {
  if (isDeleting.value) return

  isDeleting.value = true
  try {
    await deleteReleaseEntry(releaseId)
    deleteModal.close()
    releaseToDelete.value = null
  } finally {
    isDeleting.value = false
  }
}

function handleEditRequest(release: Release) {
  releaseToEdit.value = release
  editSheetOpen.value = true
}

async function handleEditSave(id: string, dto: Partial<CreateReleaseDTO>) {
  if (isUpdating.value) return

  isUpdating.value = true
  try {
    const success = await updateReleaseEntry(id, dto)
    if (success) {
      editSheetOpen.value = false
      releaseToEdit.value = null
    }
  } finally {
    isUpdating.value = false
  }
}

function handleDayClick(date: Date) {
  selectedDay.value = date
  dayEventsSheetOpen.value = true
}

function handleAddFromSheet(date: Date) {
  dayEventsSheetOpen.value = false
  newRelease.value.release_date = date.toISOString().split('T')[0] || date.toISOString().slice(0, 10)
  modal.open()
}

async function handleMoveEvent(eventId: string, newDate: Date) {
  if (isMovingEvent.value) return

  isMovingEvent.value = true
  try {
    await updateEventDate(eventId, newDate)
  } finally {
    isMovingEvent.value = false
  }
}

function handleDaySheetEdit(release: Release) {
  dayEventsSheetOpen.value = false
  handleEditRequest(release)
}

function handleDaySheetDelete(release: Release) {
  dayEventsSheetOpen.value = false
  handleDeleteRequest(release)
}

const typeConfig: Record<ReleaseType, { icon: any; color: string; label: string }> = {
  anime_episode: { icon: Tv, color: 'text-primary', label: 'Episodio Anime' },
  manga_volume: { icon: BookOpen, color: 'text-exp-easy', label: 'Tomo Manga' },
  event: { icon: Ticket, color: 'text-exp-legendary', label: 'Evento' },
}

function handleMonthChange(date: Date) {
  currentMonth.value = date
}

function handleEventUpdate(eventId: string, date: Date) {
  updateEventDate(eventId, date)
}
</script>

<template>
  <div class="space-y-2 px-2 sm:px-0 pb-2 h-full flex flex-col overflow-visible">
    <header class="flex items-center justify-between gap-2 sm:gap-3 shrink-0 py-1 sm:py-0">
      <h1 class="text-base sm:text-lg font-bold flex items-center gap-2">
        <CalendarIcon class="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" aria-hidden="true" />
        <span>Calendario</span>
      </h1>
      <Button size="sm"
        class="h-10 sm:h-9 px-3 sm:px-3 glow-primary touch-manipulation shrink-0 min-h-[44px] sm:min-h-[36px]"
        @click="modal.open()" aria-label="Añadir nuevo evento">
        <Plus class="h-4 w-4 sm:h-4 sm:w-4 sm:mr-1.5" />
        <span class="hidden sm:inline">Añadir</span>
      </Button>
    </header>

    <CalendarGrid :current-month="currentMonth" :events="releases" :loading="loading"
      @update:current-month="handleMonthChange" @update:event="handleEventUpdate" @delete="deleteReleaseEntry"
      @deleteRequest="handleDeleteRequest" @editRequest="handleEditRequest" @dayClick="handleDayClick"
      @add="modal.open()" />

    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="modal.isOpen.value"
            class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-sm overflow-y-auto"
            style="pointer-events: auto;" @click.self="modal.close()" @keydown.esc="modal.close()" role="dialog"
            aria-modal="true" aria-labelledby="add-event-title">
            <Card class="w-full max-w-md shadow-xl border-2 my-auto" @click.stop>
              <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6">
                <CardTitle id="add-event-title" class="text-lg sm:text-xl">Nuevo Evento</CardTitle>
                <Button variant="ghost" size="icon" class="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                  @click="modal.close()" aria-label="Cerrar">
                  <X class="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent class="space-y-4 sm:space-y-5 p-4 sm:p-6 pt-0">
                <div class="space-y-2">
                  <Label for="title" class="text-sm font-semibold">Título *</Label>
                  <Input id="title" v-model="newRelease.title" placeholder="Ej: One Piece Ep. 1120"
                    class="w-full h-11 sm:h-10 text-sm" maxlength="100" aria-required="true" autocomplete="off"
                    @keydown.enter.prevent="addRelease" />
                  <p class="text-xs text-muted-foreground">
                    {{ newRelease.title.length }}/100 caracteres
                  </p>
                </div>
                <div class="space-y-2">
                  <Label for="date" class="text-sm font-semibold">Fecha *</Label>
                  <DatePicker id="date" v-model="newRelease.release_date" placeholder="Selecciona una fecha"
                    class="w-full h-11 sm:h-10" aria-required="true" />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-semibold">Tipo *</Label>
                  <div class="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Tipo de evento">
                    <Button v-for="(config, type) in typeConfig" :key="type"
                      :variant="newRelease.type === type ? 'default' : 'outline'" size="sm"
                      class="text-xs sm:text-sm flex-col h-auto py-3 sm:py-4 touch-manipulation min-h-[80px] sm:min-h-[90px] transition-all"
                      :class="newRelease.type === type && 'ring-2 ring-primary/50 shadow-md'"
                      :aria-pressed="newRelease.type === type" role="radio" :aria-label="config.label"
                      @click="newRelease.type = type">
                      <component :is="config.icon" :class="['h-5 w-5 sm:h-6 sm:w-6 mb-2', config.color]"
                        aria-hidden="true" />
                      <span class="font-semibold">{{ config.label.split(' ')[0] }}</span>
                    </Button>
                  </div>
                </div>
                <div class="pt-2">
                  <Button class="w-full min-h-[44px] text-sm font-semibold glow-primary" @click="addRelease"
                    :disabled="!newRelease.title.trim() || !newRelease.release_date">
                    <Plus class="h-4 w-4 mr-2" />
                    Añadir Evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <DeleteEventConfirmModal :open="deleteModal.isOpen.value" :release="releaseToDelete" :is-submitting="isDeleting"
      @close="deleteModal.close()" @confirm="handleDeleteConfirm" />

    <EditEventSheet :open="editSheetOpen" :release="releaseToEdit" :is-submitting="isUpdating"
      @update:open="editSheetOpen = $event" @save="handleEditSave" />

    <DayEventsSheet v-if="selectedDay" :open="dayEventsSheetOpen" :date="selectedDay" :events="(() => {
      if (!selectedDay) return []
      const day = selectedDay
      return releases.filter(r => {
        const eventDate = new Date(r.releaseDate)
        return eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
      })
    })()" :is-submitting="isMovingEvent" @update:open="dayEventsSheetOpen = $event" @update:event="handleMoveEvent"
      @edit="handleDaySheetEdit" @delete="handleDaySheetDelete" @add="handleAddFromSheet" />
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
