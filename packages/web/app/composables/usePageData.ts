import type { Ref } from "vue";
import { computed, onMounted, readonly, ref } from "vue";

export interface UsePageDataOptions<T> {
  fetcher: () => Promise<T>;
  immediate?: boolean;
  onError?: (error: Error) => void;
}

export function usePageData<T>(options: UsePageDataOptions<T>) {
  const { fetcher, immediate = true, onError } = options;

  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function load() {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      data.value = await fetcher();
    } catch (err) {
      const errorInstance =
        err instanceof Error ? err : new Error("Unknown error");
      error.value = errorInstance;
      console.error("Error in usePageData:", errorInstance);
      onError?.(errorInstance);
    } finally {
      loading.value = false;
    }
  }

  async function reload() {
    await load();
  }

  if (immediate) {
    onMounted(() => {
      load();
    });
  }

  return {
    data: readonly(data),
    loading: computed(() => loading.value),
    error: readonly(error),
    load,
    reload,
  };
}
