import type { Quest, QuestDifficulty } from '~~/domain/types';
import { DIFFICULTY_EXP } from '~~/domain/types';

export interface QuestForm {
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  due_date: string;
  due_time: string;
  reminder_minutes_before: number;
}

export function useQuestsPage() {
  const questsApi = useQuests();
  const modal = useModal();
  const notificationsModal = useModal();
  const toast = useToast();

  const quests = ref<Quest[]>([]);
  const notifications = ref<
    Array<{
      id: string;
      quest_id: string;
      notification_type: 'overdue' | 'reminder' | 'due_soon';
      message: string;
      sent_at: Date;
      read_at: Date | null;
    }>
  >([]);
  const completions = ref<string[]>([]);
  const loading = ref(true);
  const isSubmitting = ref(false);

  function showFriendlyError(error: unknown, fallbackMessage: string) {
    if (error instanceof Error) {
      toast.error(error.message);
      return;
    }

    toast.error(fallbackMessage);
  }

  const { load: loadData, reload: reloadData } = usePageData({
    fetcher: async () => {
      const [questsData, completionsData] = await Promise.all([
        questsApi.fetchQuests(),
        questsApi.fetchTodayCompletions(),
      ]);
      quests.value = questsData;
      completions.value = completionsData;
      updateQuestStatuses();
      return questsData;
    },
    immediate: false,
    onError: (error) =>
      showFriendlyError(
        error,
        'No pudimos cargar quests en este momento. Probá de nuevo en unos minutos.',
      ),
  });

  async function checkNotifications() {
    try {
      const notifs = await questsApi.fetchNotifications();
      notifications.value = notifs;
    } catch (error) {
      showFriendlyError(
        error,
        'No pudimos cargar las notificaciones de quests. Probá de nuevo en unos minutos.',
      );
      console.error('Error fetching notifications:', error);
    }
  }

  function updateQuestStatuses() {
    const now = new Date();
    quests.value = quests.value.map((quest) => {
      if (!quest.dueDate) return quest;

      const dueDateTime = quest.dueTime
        ? new Date(`${quest.dueDate.toISOString().split('T')[0]}T${quest.dueTime}`)
        : new Date(quest.dueDate);

      const timeParts = quest.dueTime?.split(':') || [];
      const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 23;
      const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 59;
      dueDateTime.setHours(hours, minutes, 59);

      const isOverdue = dueDateTime < now && !completions.value.includes(quest.id);
      const isDueSoon =
        !isOverdue && quest.reminderMinutesBefore
          ? dueDateTime.getTime() - now.getTime() <= quest.reminderMinutesBefore * 60 * 1000 &&
            dueDateTime > now &&
            !completions.value.includes(quest.id)
          : false;

      return {
        ...quest,
        isOverdue,
        isDueSoon: isDueSoon || undefined,
      } as Quest;
    });
  }

  async function handleAddQuest(form: QuestForm) {
    if (!form.title.trim() || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
      await questsApi.createQuest({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        difficulty: form.difficulty,
        exp_reward: DIFFICULTY_EXP[form.difficulty],
        due_date: form.due_date || undefined,
        due_time: form.due_time || undefined,
        reminder_minutes_before: form.due_date ? form.reminder_minutes_before || 15 : undefined,
      });
      modal.close();
      await reloadData();
    } finally {
      isSubmitting.value = false;
    }
  }

  async function completeQuest(questId: string) {
    await questsApi.completeQuest(questId);
    await reloadData();
    await checkNotifications();
  }

  async function deleteQuest(id: string) {
    await questsApi.deleteQuest(id);
    await reloadData();
  }

  async function markNotificationAsRead(notificationId: string) {
    await questsApi.markNotificationRead(notificationId);
    await checkNotifications();
  }

  const pendingQuests = computed(() =>
    quests.value.filter((q) => !completions.value.includes(q.id)),
  );

  const completedQuests = computed(() =>
    quests.value.filter((q) => completions.value.includes(q.id)),
  );

  const overdueQuests = computed(() => pendingQuests.value.filter((q) => q.isOverdue));

  const totalExpToday = computed(() => completedQuests.value.reduce((sum, q) => sum + q.exp, 0));

  const unreadNotifications = computed(() => notifications.value.filter((n) => !n.read_at));

  async function initialize() {
    loading.value = true;
    try {
      await Promise.all([loadData(), checkNotifications()]);
    } finally {
      loading.value = false;
    }
  }

  return {
    quests: readonly(quests),
    notifications: readonly(notifications),
    loading: readonly(loading),
    isSubmitting: readonly(isSubmitting),
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
    reloadData,
  };
}
