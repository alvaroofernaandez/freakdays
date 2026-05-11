<script setup lang="ts">
import type { OrganizationMembership } from '@/composables/useOrganizations'

interface Props {
  items: OrganizationMembership[]
  activeOrgId: string | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  change: [orgId: string]
}>()

const selectedOrgId = computed({
  get: () => props.activeOrgId ?? '',
  set: (value: string) => {
    if (value && value !== props.activeOrgId) {
      emit('change', value)
    }
  },
})

const isDisabled = computed(() => props.loading || props.items.length === 0)

function formatRole(role: OrganizationMembership['role']): string {
  if (role === 'owner') return 'Owner'
  if (role === 'admin') return 'Admin'
  return 'Member'
}
</script>

<template>
  <div class="flex items-center gap-2 min-w-0">
    <label class="text-xs text-muted-foreground whitespace-nowrap" for="organization-switcher">
      Organización
    </label>
    <select
      id="organization-switcher"
      v-model="selectedOrgId"
      class="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground min-w-40 max-w-56"
      :disabled="isDisabled"
      aria-label="Selector de organización activa"
    >
      <option value="" disabled>
        {{ loading ? 'Cargando organizaciones...' : 'Sin organizaciones' }}
      </option>
      <option
        v-for="organization in items"
        :key="organization.organizationId"
        :value="organization.organizationId"
      >
        {{ organization.name }} · {{ formatRole(organization.role) }}
      </option>
    </select>
  </div>
</template>
