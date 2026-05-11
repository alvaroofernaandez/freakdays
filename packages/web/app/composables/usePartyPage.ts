import type { Party, PartyMember } from '@/composables/useParties'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '~~/stores/auth'
import { useModal } from './useModal'
import { usePageData } from './usePageData'
import { computed, readonly, ref } from 'vue'

type ReadonlyParty = Readonly<Omit<Party, 'members'>> & {
  readonly members: readonly Readonly<PartyMember>[]
}

export function usePartyPage() {
  const partiesApi = useParties()
  const authStore = useAuthStore()
  const toast = useToast()
  const createModal = useModal()
  const joinModal = useModal()
  const detailsModal = useModal()
  const deleteConfirmModal = useModal()
  const removeMemberModal = useModal()

  const { data: parties, loading, reload: reloadParties, load: loadParties } = usePageData({
    fetcher: () => partiesApi.fetchUserParties(),
    immediate: true,
  })

  const newParty = ref({
    name: '',
    description: ''
  })

  const joinCode = ref('')
  const copiedCode = ref<string | null>(null)
  const selectedParty = ref<Party | null>(null)
  const memberToRemove = ref<PartyMember | null>(null)
  const isSubmitting = ref(false)
  const isRegeneratingCode = ref(false)

  async function createParty() {
    if (!newParty.value.name.trim() || isSubmitting.value) return

    isSubmitting.value = true
    try {
      const created = await partiesApi.createParty(
        newParty.value.name.trim(),
        newParty.value.description?.trim() || undefined
      )
      if (created) {
        await reloadParties()
        newParty.value = { name: '', description: '' }
        createModal.close()
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function joinParty() {
    if (!joinCode.value.trim() || isSubmitting.value) return

    isSubmitting.value = true
    try {
      const joined = await partiesApi.joinByCode(joinCode.value.trim())
      if (joined) {
        await reloadParties()
        joinCode.value = ''
        joinModal.close()
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function leaveParty(partyId: string) {
    if (isSubmitting.value) return

    isSubmitting.value = true
    try {
      const success = await partiesApi.leaveParty(partyId)
      if (success) {
        await reloadParties()
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function regenerateInviteCode(partyId: string) {
    if (isRegeneratingCode.value) return

    isRegeneratingCode.value = true
    try {
      const newCode = await partiesApi.regenerateInviteCode(partyId)
      if (newCode) {
        await reloadParties()
      }
    } finally {
      isRegeneratingCode.value = false
    }
  }

  async function removeMember(partyId: string, memberId: string) {
    if (isSubmitting.value) return

    isSubmitting.value = true
    try {
      const success = await partiesApi.removeMember(partyId, memberId)
      if (success) {
        await reloadParties()
        removeMemberModal.close()
        memberToRemove.value = null
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function deleteParty(partyId: string) {
    if (isSubmitting.value) return

    isSubmitting.value = true
    try {
      const success = await partiesApi.deleteParty(partyId)
      if (success) {
        await reloadParties()
        deleteConfirmModal.close()
        selectedParty.value = null
      }
    } finally {
      isSubmitting.value = false
    }
  }

  function copyInviteCode(code: string) {
    if (!code) return

    navigator.clipboard.writeText(code)
    copiedCode.value = code
    toast.info('Código copiado al portapapeles')
    setTimeout(() => {
      copiedCode.value = null
    }, 2000)
  }

  function openDeleteConfirm(party: ReadonlyParty | Party) {
    selectedParty.value = { ...party, members: [...party.members] } as Party
    deleteConfirmModal.open()
  }

  function openRemoveMemberConfirm(party: ReadonlyParty | Party, member: Readonly<PartyMember> | PartyMember) {
    selectedParty.value = { ...party, members: [...party.members] } as Party
    memberToRemove.value = { ...member } as PartyMember
    removeMemberModal.open()
  }

  function openDetails(party: ReadonlyParty | Party) {
    selectedParty.value = { ...party, members: [...party.members] } as Party
    detailsModal.open()
  }

  function isOwner(party: ReadonlyParty | Party): boolean {
    return party.ownerId === authStore.userId
  }

  function canManageMembers(party: ReadonlyParty | Party): boolean {
    return isOwner(party)
  }

  function getMemberRoleLabel(role: PartyMember['role']): string {
    const labels = {
      owner: 'Dueño',
      admin: 'Admin',
      member: 'Miembro'
    }
    return labels[role] || role
  }

  async function initialize() {
    await loadParties()
  }

  return {
    parties: computed(() => {
      const partiesList = parties.value || []
      return partiesList.map(party => ({
        ...party,
        members: [...party.members],
      })) as Party[]
    }),
    loading,
    createModal,
    joinModal,
    detailsModal,
    deleteConfirmModal,
    removeMemberModal,
    newParty,
    joinCode,
    selectedParty: readonly(selectedParty),
    memberToRemove: readonly(memberToRemove),
    copiedCode: readonly(copiedCode),
    isSubmitting: readonly(isSubmitting),
    isRegeneratingCode: readonly(isRegeneratingCode),
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
  }
}

