<script setup lang="ts">
import { Bell, X } from 'lucide-vue-next'

interface Notification {
  readonly id: string
  readonly quest_id: string
  readonly notification_type: 'overdue' | 'reminder' | 'due_soon'
  readonly message: string
  readonly sent_at: Date
  readonly read_at: Date | null
}

interface Props {
  open: boolean
  notifications: readonly Notification[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  markRead: [id: string]
}>()

const unreadCount = computed(() => props.notifications.filter(n => !n.read_at).length)
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="open"
          class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm"
          style="pointer-events: auto;" @click.self="emit('close')" @keydown.esc="emit('close')">
          <Card class="w-full max-w-md shadow-xl border-2" @click.stop>
            <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
              <CardTitle class="text-lg sm:text-xl flex items-center gap-2">
                <Bell class="h-5 w-5" />
                Notificaciones
                <Badge v-if="unreadCount > 0" variant="destructive" class="ml-2">
                  {{ unreadCount }}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="icon"
                class="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hover:text-foreground cursor-pointer"
                @click="emit('close')">
                <X class="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent class="pt-4 sm:pt-6">
              <div v-if="notifications.length === 0" class="text-center py-8">
                <p class="text-muted-foreground text-sm">No hay notificaciones</p>
              </div>
              <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto">
                <div v-for="notification in notifications" :key="notification.id" :class="[
                  'p-3 rounded-lg border transition-colors cursor-pointer',
                  notification.read_at ? 'bg-muted/30 border-border/50' : 'bg-primary/5 border-primary/20'
                ]" @click="emit('markRead', notification.id)">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium"
                        :class="notification.read_at ? 'text-muted-foreground' : 'text-foreground'">
                        {{ notification.message }}
                      </p>
                      <p class="text-xs text-muted-foreground mt-1">
                        {{ new Date(notification.sent_at).toLocaleString('es-ES') }}
                      </p>
                    </div>
                    <div v-if="!notification.read_at" class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
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
