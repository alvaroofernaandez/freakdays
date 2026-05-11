import type {
  AnimeEntry,
  AnimeStatus,
  CreateAnimeDTO,
} from "@/composables/useAnime";
import type { AnimeSearchResult } from "@/composables/useAnimeSearch";
import { parseJikanAnimeToDTO } from "@/utils/anime-parser";

export function useAnimePage() {
  const route = useRoute();
  const router = useRouter();
  const animeApi = useAnime();
  const toast = useToast();

  const modal = useModal();
  const statusModal = useModal();

  const {
    data: animeList,
    loading,
    reload: reloadAnime,
  } = usePageData({
    fetcher: () => animeApi.fetchAnimeList(),
  });

  const activeView = ref<"list" | "marketplace">("list");
  const activeTab = ref<"all" | AnimeStatus>("all");
  const selectedAnimeForAdd = ref<AnimeSearchResult | null>(null);
  const addingAnime = ref(false);

  const newAnime = ref<CreateAnimeDTO>({
    title: "",
    status: "watching",
    total_episodes: undefined,
    score: undefined,
    cover_url: undefined,
  });

  const filteredAnime = computed(() => {
    if (activeTab.value === "all") {
      return animeList.value || [];
    }
    return (animeList.value || []).filter((a) => a.status === activeTab.value);
  });

  const stats = computed(() => ({
    watching: (animeList.value || []).filter((a) => a.status === "watching")
      .length,
    completed: (animeList.value || []).filter((a) => a.status === "completed")
      .length,
    total: (animeList.value || []).length,
  }));

  function setActiveView(view: "list" | "marketplace") {
    activeView.value = view;
    const query: Record<string, string | string[]> = {
      ...route.query,
    } as Record<string, string | string[]>;

    if (view === "marketplace") {
      query.view = "marketplace";
    } else {
      delete query.view;
      delete query.q;
    }

    router.replace({ query });
  }

  function updateSearchQuery(query: string) {
    const currentQuery: Record<string, string | string[]> = {
      ...route.query,
    } as Record<string, string | string[]>;
    const trimmedQuery = query?.trim() || "";

    if (trimmedQuery) {
      currentQuery.q = trimmedQuery;
      currentQuery.view = "marketplace";
      if (activeView.value !== "marketplace") {
        activeView.value = "marketplace";
      }
    } else {
      delete currentQuery.q;
    }

    const currentQ = (route.query.q as string) || "";
    if (currentQ !== trimmedQuery) {
      router.replace({ query: currentQuery });
    }
  }

  function handleAddAnimeClick(animeResult: AnimeSearchResult) {
    selectedAnimeForAdd.value = animeResult;
    statusModal.open();
  }

  async function addAnimeFromSearch(status: AnimeStatus) {
    if (!selectedAnimeForAdd.value || addingAnime.value) return;

    addingAnime.value = true;

    try {
      const animeData = parseJikanAnimeToDTO(selectedAnimeForAdd.value, status);

      if (!animeData.title || !animeData.title.trim()) {
        toast.error("El título del anime es requerido");
        return;
      }

      const created = await animeApi.addAnime(animeData);

      if (created) {
        await reloadAnime();
        setActiveView("list");
        activeTab.value = status;
        statusModal.close();
        selectedAnimeForAdd.value = null;
        toast.success("Anime añadido correctamente");
      } else {
        toast.error("No se pudo añadir el anime");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.error?.message ||
        "Error al añadir el anime. Inténtalo de nuevo.";
      toast.error(errorMessage);
    } finally {
      addingAnime.value = false;
    }
  }

  async function addAnime() {
    if (!newAnime.value.title.trim()) return;

    const created = await animeApi.addAnime(newAnime.value);
    if (created) {
      await reloadAnime();
      newAnime.value = {
        title: "",
        status: "watching",
        total_episodes: undefined,
        score: undefined,
        cover_url: undefined,
      };
      modal.close();
    }
  }

  async function incrementEpisode(anime: AnimeEntry) {
    const newEp = anime.currentEpisode + 1;
    if (anime.totalEpisodes && newEp > anime.totalEpisodes) return;

    const success = await animeApi.updateProgress(anime.id, newEp);
    if (success) {
      await reloadAnime();
      if (anime.totalEpisodes && newEp === anime.totalEpisodes) {
        await animeApi.updateStatus(anime.id, "completed");
        await reloadAnime();
      }
    }
  }

  async function decrementEpisode(anime: AnimeEntry) {
    if (anime.currentEpisode <= 0) return;

    const newEp = anime.currentEpisode - 1;
    const success = await animeApi.updateProgress(anime.id, newEp);
    if (success) {
      await reloadAnime();
    }
  }

  async function deleteAnimeEntry(id: string) {
    const success = await animeApi.deleteAnime(id);
    if (success) {
      await reloadAnime();
    }
  }

  onMounted(() => {
    const view = route.query.view as string;
    if (view === "marketplace") {
      setActiveView("marketplace");
    }
  });

  return {
    animeList: computed(() => animeList.value || []),
    loading,
    modal,
    statusModal,
    activeView,
    activeTab,
    selectedAnimeForAdd,
    addingAnime: readonly(addingAnime),
    newAnime,
    filteredAnime,
    stats,
    setActiveView,
    updateSearchQuery,
    handleAddAnimeClick,
    addAnimeFromSearch,
    addAnime,
    incrementEpisode,
    decrementEpisode,
    deleteAnimeEntry,
  };
}
