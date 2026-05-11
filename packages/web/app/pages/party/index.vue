<script setup lang="ts">
import CreatePartyModal from '@/components/party/CreatePartyModal.vue'
import DeletePartyConfirmModal from '@/components/party/DeletePartyConfirmModal.vue'
import JoinPartyModal from '@/components/party/JoinPartyModal.vue'
import PartyCard from '@/components/party/PartyCard.vue'
import PartyCardSkeleton from '@/components/party/PartyCardSkeleton.vue'
import PartyDetailsModal from '@/components/party/PartyDetailsModal.vue'
import PartyEmptyState from '@/components/party/PartyEmptyState.vue'
import RemoveMemberConfirmModal from '@/components/party/RemoveMemberConfirmModal.vue'
import { Button } from '@/components/ui/button'
import { usePartyPage } from '@/composables/usePartyPage'
import { Plus, UserPlus, Users } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const {
  parties,
  loading,
  createModal,
  joinModal,
  detailsModal,
  deleteConfirmModal,
  removeMemberModal,
  newParty,
  joinCode,
  selectedParty,
  memberToRemove,
  copiedCode,
  isSubmitting,
  isRegeneratingCode,
  createParty,
  joinParty,
  leaveParty,
  regenerateInviteCode,
  removeMember,
  deleteParty,
  copyInviteCode,
  openDeleteConfirm,
  openRemoveMemberConfirm,
  openDetails,
  isOwner,
  canManageMembers,
  getMemberRoleLabel,
  initialize,
} = usePartyPage()

const hasParties = computed(() => !loading.value && parties.value.length > 0)
const isEmpty = computed(() => !loading.value && parties.value.length === 0)

onMounted(() => {
  initialize()
})

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function handleCreateParty() {
  createParty()
}

function handleJoinParty() {
  joinParty()
}

function handleDeleteParty(partyId: string) {
  deleteParty(partyId)
}

function handleRemoveMember(partyId: string, memberId: string) {
  removeMember(partyId, memberId)
}

function handleRegenerateCode(partyId: string) {
  regenerateInviteCode(partyId)
}

function handleEnterParty(partyId: string) {
  router.push(`/party/${partyId}`)
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6 px-1 sm:px-0" role="main">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4" role="banner">
      <div>
        <h1 class="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
          <Users class="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" aria-hidden="true" />
          <span>Party System</span>
        </h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-1">
          Crea grupos con tus amigos y comparte tus progresos
        </p>
      </div>
      <div class="flex gap-2 sm:gap-2" role="group" aria-label="Acciones principales">
        <Button variant="outline" size="sm" class="flex-1 sm:flex-none min-h-[44px] sm:min-h-0"
          @click="joinModal.open()" aria-label="Unirse a una party con código de invitación">
          <UserPlus class="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span class="hidden sm:inline">Unirse</span>
          <span class="sm:hidden">Unirse</span>
        </Button>
        <Button size="sm" class="flex-1 sm:flex-none glow-primary min-h-[44px] sm:min-h-0" @click="createModal.open()"
          aria-label="Crear nueva party">
          <Plus class="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span class="hidden sm:inline">Crear Party</span>
          <span class="sm:hidden">Crear</span>
        </Button>
      </div>
    </header>

    <section v-if="loading" class="space-y-3 sm:space-y-4" role="status" aria-live="polite" aria-label="Cargando parties">
      <h2 class="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
        Cargando...
      </h2>
      <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="list">
        <div v-for="i in 3" :key="i" role="listitem">
          <PartyCardSkeleton />
        </div>
      </div>
    </section>

    <section v-else-if="hasParties" class="space-y-3 sm:space-y-4">
      <h2 class="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
        Tus Parties ({{ parties.length }})
      </h2>

      <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Lista de parties">
        <TransitionGroup name="list" tag="div" class="contents">
          <div v-for="(party, index) in parties" :key="party.id" role="listitem"
            :style="{ animationDelay: `${index * 50}ms` }">
            <PartyCard :party="party" :is-owner="isOwner(party)" :copied-code="copiedCode"
              :is-submitting="isSubmitting" @copy-code="copyInviteCode" @view-details="openDetails"
              @leave="leaveParty" @enter="handleEnterParty" />
          </div>
        </TransitionGroup>
      </div>
    </section>

    <Transition name="fade">
      <PartyEmptyState v-if="isEmpty" @create="createModal.open()" @join="joinModal.open()" />
    </Transition>

    <CreatePartyModal :open="createModal.isOpen.value" v-model:name="newParty.name"
      v-model:description="newParty.description" :is-submitting="isSubmitting" @close="createModal.close()"
      @submit="handleCreateParty" />

    <JoinPartyModal :open="joinModal.isOpen.value" v-model:code="joinCode" :is-submitting="isSubmitting"
      @close="joinModal.close()" @submit="handleJoinParty" />

    <PartyDetailsModal :open="detailsModal.isOpen.value" :party="selectedParty" :member-to-remove="memberToRemove"
      :copied-code="copiedCode" :is-owner="selectedParty ? isOwner(selectedParty) : false"
      :can-manage-members="selectedParty ? canManageMembers(selectedParty) : false" :is-submitting="isSubmitting"
      :is-regenerating-code="isRegeneratingCode" :current-user-id="authStore.userId"
      :get-member-role-label="(role: string) => getMemberRoleLabel(role as 'owner' | 'admin' | 'member')"
      :format-date="formatDate" @close="detailsModal.close()" @copy-code="copyInviteCode"
      @regenerate-code="handleRegenerateCode" @remove-member="openRemoveMemberConfirm"
      @delete-party="openDeleteConfirm" />

    <DeletePartyConfirmModal :open="deleteConfirmModal.isOpen.value" :party="selectedParty as any"
      :is-submitting="isSubmitting" @close="deleteConfirmModal.close()" @confirm="handleDeleteParty" />

    <RemoveMemberConfirmModal :open="removeMemberModal.isOpen.value" :party="selectedParty as any"
      :member="memberToRemove as any" :is-submitting="isSubmitting" @close="removeMemberModal.close()"
      @confirm="handleRemoveMember" />
  </div>
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

.fade-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-active {
  transition: all 0.3s ease;
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.list-move {
  transition: transform 0.3s ease;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>