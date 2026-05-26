<script setup lang="ts">
import NotificationPanel from '@/components/quests/NotificationPanel.vue';
import OverdueBanner from '@/components/quests/OverdueBanner.vue';
import QuestFormModal from '@/components/quests/QuestFormModal.vue';
import QuestList from '@/components/quests/QuestList.vue';
import QuestStats from '@/components/quests/QuestStats.vue';
import QuestStatsSkeleton from '@/components/quests/QuestStatsSkeleton.vue';
import { useQuestsPage } from '@/composables/useQuestsPage';
import { Bell, Clock, Plus, Swords, Trophy } from 'lucide-vue-next';

definePageMeta({
  keepalive: false,
});

const {
  quests: _quests,
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
} = useQuestsPage();

useSeoMeta({
  title: 'Tus quests',
  description: 'Gestiona tus misiones diarias y quests en FreakDays',
});

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="space-y-4 sm:space-y-6" style="position: relative; z-index: 0; pointer-events: auto">
    <!-- Page header -->
    <header
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
      style="position: relative; z-index: 1; pointer-events: auto"
    >
      <div>
        <p
          class="flex items-center gap-1.5 font-pixel text-[9px] text-muted-foreground/80 uppercase mb-1"
        >
          <span class="text-primary">▸</span> QUESTS
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Swords class="h-6 w-6 text-primary" aria-hidden="true" />
          Misiones Diarias
        </h1>
        <p class="font-pixel text-[9px] text-muted-foreground/70 mt-1 uppercase">
          COMPLETA QUESTS · GANA EXPERIENCIA
        </p>
      </div>
      <div
        class="flex items-center gap-2 w-full sm:w-auto"
        style="position: relative; z-index: 1; pointer-events: auto"
      >
        <Button
          variant="outline"
          size="lg"
          class="relative flex-1 sm:flex-none rounded-none border-2 cursor-pointer"
          aria-label="Ver notificaciones"
          @click="notificationsModal.open()"
        >
          <Bell class="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          <span class="sm:hidden">Notif.</span>
          <span class="hidden sm:inline">Notificaciones</span>
          <Badge
            v-if="unreadNotifications.length > 0"
            class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center font-pixel text-[9px] bg-destructive text-destructive-foreground"
          >
            {{ unreadNotifications.length }}
          </Badge>
        </Button>
        <Button
          size="lg"
          class="btn-game flex-1 sm:flex-none rounded-none font-pixel text-[10px] shadow-[0_5px_0_0_oklch(0.42_0.16_290)] hover:shadow-[0_5px_0_0_oklch(0.52_0.2_290)] hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.42_0.16_290)] transition-[transform,filter,box-shadow,border-color] duration-100 motion-reduce:active:translate-y-0 cursor-pointer"
          @click="modal.open()"
        >
          <Plus class="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
          <span class="sm:hidden">NUEVA</span>
          <span class="hidden sm:inline">NUEVA QUEST</span>
        </Button>
      </div>
    </header>

    <QuestStatsSkeleton v-if="loading" />
    <QuestStats
      v-else
      :pending="pendingQuests.length"
      :completed="completedQuests.length"
      :exp-today="totalExpToday"
    />

    <OverdueBanner :count="overdueQuests.length" />

    <div class="w-full" style="position: relative; z-index: 0">
      <Tabs default-value="pending" class="w-full" style="position: relative; z-index: 0">
        <TabsList
          class="w-full grid grid-cols-2 rounded-none border-2"
          style="position: relative; z-index: 1; pointer-events: auto"
        >
          <TabsTrigger value="pending" class="rounded-none gap-2 font-pixel text-[9px] uppercase">
            <Clock class="h-4 w-4" aria-hidden="true" />
            PENDIENTES
          </TabsTrigger>
          <TabsTrigger value="completed" class="rounded-none gap-2 font-pixel text-[9px] uppercase">
            <Trophy class="h-4 w-4" aria-hidden="true" />
            COMPLETADAS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" class="mt-4 space-y-3" style="position: relative; z-index: 0">
          <QuestList
            :quests="pendingQuests"
            :loading="loading"
            :is-completed="false"
            @complete="completeQuest"
            @delete="deleteQuest"
            @add="modal.open()"
          />
        </TabsContent>

        <TabsContent
          value="completed"
          class="mt-4 space-y-3"
          style="position: relative; z-index: 0"
        >
          <QuestList
            :quests="completedQuests"
            :loading="false"
            :is-completed="true"
            @complete="completeQuest"
            @delete="deleteQuest"
            @add="modal.open()"
          />
        </TabsContent>
      </Tabs>
    </div>

    <QuestFormModal
      :open="modal.isOpen.value"
      :submitting="isSubmitting"
      @close="modal.close()"
      @submit="handleAddQuest"
    />

    <NotificationPanel
      :open="notificationsModal.isOpen.value"
      :notifications="notifications"
      @close="notificationsModal.close()"
      @mark-read="markNotificationAsRead"
    />
  </div>
</template>
