<script setup lang="ts">
import { computed } from 'vue';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
} from 'reka-ui';
import { ChevronDown, Check } from 'lucide-vue-next';

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecciona una opción',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

/**
 * reka-ui Select does not accept an empty string as an item value.
 * We use the sentinel '__none__' internally and map it to/from '' at
 * the component boundary so the parent v-model always stores '' for "none".
 */
const NONE_SENTINEL = '__none__';

const internalValue = computed(() => (props.modelValue === '' ? NONE_SENTINEL : props.modelValue));

function handleUpdate(val: string) {
  emit('update:modelValue', val === NONE_SENTINEL ? '' : val);
}
</script>

<template>
  <SelectRoot :model-value="internalValue" @update:model-value="handleUpdate">
    <SelectTrigger
      :id="id"
      :aria-label="ariaLabel"
      class="flex h-10 w-full items-center justify-between rounded-none border-2 border-input bg-background px-3 py-2 text-sm outline-none cursor-pointer transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 data-[placeholder]:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <SelectValue :placeholder="placeholder" />
      <SelectIcon as-child>
        <ChevronDown
          class="h-4 w-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200 data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="4"
        class="z-50 min-w-[var(--reka-select-trigger-width)] rounded-none border-2 border-primary/40 bg-popover text-popover-foreground shadow-[0_0_30px_-10px_oklch(0.65_0.15_280/0.5)] motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-95 overflow-hidden"
      >
        <SelectViewport
          class="p-1 max-h-60 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:oklch(var(--primary)/0.4)_transparent]"
        >
          <SelectItem
            v-for="option in options"
            :key="option.value === '' ? NONE_SENTINEL : option.value"
            :value="option.value === '' ? NONE_SENTINEL : option.value"
            class="relative flex w-full cursor-pointer select-none items-center rounded-none px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-primary/15 data-[highlighted]:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <SelectItemIndicator class="absolute left-1 flex items-center justify-center">
              <Check class="h-3 w-3" aria-hidden="true" />
            </SelectItemIndicator>
            <SelectItemText class="pl-4">{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
