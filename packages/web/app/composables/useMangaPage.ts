import { useErrorHandler } from "@/composables/useErrorHandler";
import type { CreateMangaDTO, MangaEntry } from "@/composables/useManga";

export function useMangaPage() {
  const mangaApi = useManga();
  const { handleError } = useErrorHandler();
  const modal = useModal();

  const {
    data: mangaCollection,
    loading,
    error,
    reload: reloadManga,
  } = usePageData({
    fetcher: () => mangaApi.fetchCollection(),
    onError: (err) =>
      handleError(err, {
        customMessage: "No se pudo cargar la colección de manga",
      }),
  });

  const activeTab = ref<"all" | "collecting" | "completed" | "wishlist">("all");

  const filteredMangas = computed(() => {
    const collection = mangaCollection.value || [];
    const mapped = collection.map((m) => ({
      ...m,
      ownedVolumes: [...m.ownedVolumes],
    }));
    if (activeTab.value === "all") {
      return mapped;
    }
    return mapped.filter((m) => m.status === activeTab.value);
  });

  async function addManga(dto: CreateMangaDTO) {
    try {
      const created = await mangaApi.addManga(dto);
      if (created) {
        await reloadManga();
        modal.close();
      } else {
        handleError(new Error("No se pudo añadir el manga"), {
          customMessage: "No se pudo añadir el manga a tu colección",
        });
      }
    } catch (err) {
      handleError(err, { customMessage: "Error al añadir el manga" });
    }
  }

  async function handleAddVolume(id: string) {
    const manga = (mangaCollection.value || []).find((m) => m.id === id);
    if (!manga) return;

    const nextVolume =
      manga.ownedVolumes.length > 0 ? Math.max(...manga.ownedVolumes) + 1 : 1;

    if (manga.totalVolumes && nextVolume > manga.totalVolumes) return;

    try {
      const success = await mangaApi.addVolume(id, nextVolume);
      if (success) {
        await reloadManga();
      } else {
        handleError(new Error("No se pudo añadir el volumen"), {
          customMessage: "No se pudo añadir el volumen",
        });
      }
    } catch (err) {
      handleError(err, { customMessage: "Error al añadir el volumen" });
    }
  }

  async function handleRemoveVolume(id: string, volume: number) {
    try {
      const success = await mangaApi.removeVolume(id, volume);
      if (success) {
        await reloadManga();
      } else {
        handleError(new Error("No se pudo eliminar el volumen"), {
          customMessage: "No se pudo eliminar el volumen",
        });
      }
    } catch (err) {
      handleError(err, { customMessage: "Error al eliminar el volumen" });
    }
  }

  async function handleDelete(id: string) {
    try {
      const success = await mangaApi.deleteManga(id);
      if (success) {
        await reloadManga();
      } else {
        handleError(new Error("No se pudo eliminar el manga"), {
          customMessage: "No se pudo eliminar el manga",
        });
      }
    } catch (err) {
      handleError(err, { customMessage: "Error al eliminar el manga" });
    }
  }

  async function handleUpdatePrice(id: string, price: number | null) {
    try {
      const success = await mangaApi.updatePricePerVolume(id, price);
      if (success) {
        await reloadManga();
      } else {
        handleError(new Error("No se pudo actualizar el precio"), {
          customMessage: "No se pudo actualizar el precio",
        });
      }
    } catch (err) {
      handleError(err, { customMessage: "Error al actualizar el precio" });
    }
  }

  async function handleUpdateStatus(id: string, status: MangaEntry["status"]) {
    try {
      const success = await mangaApi.updateStatus(id, status);
      if (success) {
        await reloadManga();
      } else {
        handleError(new Error("No se pudo actualizar el estado"), {
          customMessage: "No se pudo actualizar el estado del manga",
        });
      }
    } catch (err) {
      handleError(err, { customMessage: "Error al actualizar el estado" });
    }
  }

  return {
    mangaCollection: computed(() => {
      const collection = mangaCollection.value || [];
      return collection.map((m) => ({
        ...m,
        ownedVolumes: [...m.ownedVolumes],
      })) as MangaEntry[];
    }),
    loading,
    error,
    modal,
    activeTab,
    filteredMangas,
    addManga,
    handleAddVolume,
    handleRemoveVolume,
    handleDelete,
    handleUpdatePrice,
    handleUpdateStatus,
    reloadManga,
  };
}
