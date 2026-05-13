import type { CreateReleaseDTO } from '@/composables/useCalendar';
import { useToast } from './useToast';

export function useCalendarPage() {
  const calendarApi = useCalendar();
  const modal = useModal();
  const toast = useToast();

  function showFriendlyError(error: unknown, fallbackMessage: string) {
    if (error instanceof Error) {
      toast.error(error.message);
      return;
    }

    toast.error(fallbackMessage);
  }

  const {
    data: releases,
    loading,
    reload: reloadReleases,
  } = usePageData({
    fetcher: () => calendarApi.fetchReleases(),
    onError: (error) =>
      showFriendlyError(
        error,
        'No pudimos cargar el calendario en este momento. Probá de nuevo en unos minutos.',
      ),
  });

  const currentMonth = ref(new Date());
  const newRelease = ref<CreateReleaseDTO>({
    title: '',
    type: 'anime_episode',
    release_date: new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
    description: undefined,
    url: undefined,
  });

  const monthName = computed(() =>
    currentMonth.value.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    }),
  );

  function formatDate(date: Date) {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  async function addRelease() {
    if (!newRelease.value.title.trim()) return;

    try {
      const created = await calendarApi.addRelease(newRelease.value);
      if (created) {
        await reloadReleases();
        newRelease.value = {
          title: '',
          type: 'anime_episode',
          release_date:
            new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10),
          description: undefined,
          url: undefined,
        };
        modal.close();
        toast.success('Evento añadido al calendario');
      }
    } catch (error) {
      showFriendlyError(error, 'Error al añadir evento');
    }
  }

  async function updateEventDate(eventId: string, newDate: Date) {
    try {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const updated = await calendarApi.updateRelease(eventId, {
        release_date: dateString,
      });
      if (updated) {
        await reloadReleases();
        toast.success('Evento movido');
      }
    } catch (error) {
      showFriendlyError(error, 'Error al mover evento');
    }
  }

  async function deleteReleaseEntry(id: string) {
    try {
      const success = await calendarApi.deleteRelease(id);
      if (success) {
        await reloadReleases();
        toast.success('Evento eliminado');
      }
    } catch (error) {
      showFriendlyError(error, 'Error al eliminar evento');
    }
  }

  async function updateReleaseEntry(id: string, dto: Partial<CreateReleaseDTO>) {
    try {
      const updated = await calendarApi.updateRelease(id, dto);
      if (updated) {
        await reloadReleases();
        toast.success('Evento actualizado');
        return true;
      }
      return false;
    } catch (error) {
      showFriendlyError(error, 'Error al actualizar evento');
      return false;
    }
  }

  return {
    releases: computed(() => releases.value || []),
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
  };
}
