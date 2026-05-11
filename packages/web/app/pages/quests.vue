<script setup lang="ts">
import NotificationPanel from '@/components/quests/NotificationPanel.vue'
import OverdueBanner from '@/components/quests/OverdueBanner.vue'
import QuestFormModal from '@/components/quests/QuestFormModal.vue'
import QuestList from '@/components/quests/QuestList.vue'
import QuestStats from '@/components/quests/QuestStats.vue'
import QuestStatsSkeleton from '@/components/quests/QuestStatsSkeleton.vue'
import { useQuestsPage } from '@/composables/useQuestsPage'
import { Bell, Clock, Plus, Swords, Trophy } from 'lucide-vue-next'

definePageMeta({
  keepalive: false
})

const {
  quests,
  notifications,
  loading,
  isSubmitting,
  modal,
  notificationsModal,
  pendingQuests,
  completedQuests,
  overdueQuests,
  totalExpToday,
  unreadNotifications,
  handleAddQuest,
  completeQuest,
  deleteQuest,
  markNotificationAsRead,
  initialize,
} = useQuestsPage()

onMounted(() => {
  initialize()
})
</script>

<template>
  <div class="space-y-4 sm:space-y-6" style="position: relative; z-index: 0; pointer-events: auto;">
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0" style="position: relative; z-index: 1; pointer-events: auto;">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Swords class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Misiones Diarias
        </h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Completa quests y gana experiencia
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto" style="position: relative; z-index: 1; pointer-events: auto;">
        <Button variant="outline" size="lg" class="relative flex-1 sm:flex-none" @click="notificationsModal.open()">
          <Bell class="h-4 w-4 sm:h-5 sm:w-5" />
          <span class="sm:hidden">Notif.</span>
          <span class="hidden sm:inline">Notificaciones</span>
          <Badge v-if="unreadNotifications.length > 0"
            class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
            {{ unreadNotifications.length }}
          </Badge>
        </Button>
        <Button size="lg" class="flex-1 sm:flex-none sm:h-10 sm:w-auto rounded-full glow-primary"
          @click="modal.open()">
          <Plus class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span class="sm:hidden">Nueva</span>
          <span class="hidden sm:inline">Nueva Quest</span>
        </Button>
      </div>
    </header>

    <QuestStatsSkeleton v-if="loading" />
    <QuestStats v-else :pending="pendingQuests.length" :completed="completedQuests.length" :exp-today="totalExpToday" />

    <OverdueBanner :count="overdueQuests.length" />

    <div class="w-full" style="position: relative; z-index: 0;">
      <Tabs default-value="pending" class="w-full" style="position: relative; z-index: 0;">
        <TabsList class="w-full grid grid-cols-2" style="position: relative; z-index: 1; pointer-events: auto;">
          <TabsTrigger value="pending" class="gap-2">
            <Clock class="h-4 w-4" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="completed" class="gap-2">
            <Trophy class="h-4 w-4" />
            Completadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" class="mt-4 space-y-3" style="position: relative; z-index: 0;">
          <QuestList :quests="pendingQuests" :loading="loading" :is-completed="false" @complete="completeQuest"
            @delete="deleteQuest" @add="modal.open()" />
        </TabsContent>

        <TabsContent value="completed" class="mt-4 space-y-3" style="position: relative; z-index: 0;">
          <QuestList :quests="completedQuests" :loading="false" :is-completed="true" @complete="completeQuest"
            @delete="deleteQuest" @add="modal.open()" />
        </TabsContent>
      </Tabs>
    </div>

    <QuestFormModal :open="modal.isOpen.value" :submitting="isSubmitting" @close="modal.close()"
      @submit="handleAddQuest" />

    <NotificationPanel :open="notificationsModal.isOpen.value" :notifications="notifications" @close="notificationsModal.close()"
      @mark-read="markNotificationAsRead" />
  </div>
</template>
