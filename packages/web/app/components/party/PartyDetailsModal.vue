<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Check, Copy, Crown, RefreshCw, Shield, Trash2, UserMinus, Users, X } from 'lucide-vue-next'
import type { Party, PartyMember } from '@/composables/useParties'

type ReadonlyParty = Readonly<Omit<Party, 'members'>> & {
  readonly members: readonly Readonly<PartyMember>[]
}

type ReadonlyPartyMember = Readonly<PartyMember>

interface Props {
  open: boolean
  party: ReadonlyParty | Party | null
  memberToRemove: ReadonlyPartyMember | PartyMember | null
  copiedCode: string | null
  isOwner: boolean
  canManageMembers: boolean
  isSubmitting: boolean
  isRegeneratingCode: boolean
  currentUserId: string | null
  getMemberRoleLabel: (role: string) => string
  formatDate: (date: Date) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  copyCode: [code: string]
  regenerateCode: [partyId: string]
  removeMember: [party: ReadonlyParty | Party, member: ReadonlyPartyMember | PartyMember]
  deleteParty: [party: ReadonlyParty | Party]
}>()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open && party"
          class="fixed inset-0 z-100 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto;"
          @click.self="emit('close')"
          @keydown.esc="emit('close')"
          role="dialog"
          aria-modal="true"
          aria-labelledby="party-details-title"
        >
          <Card
            class="w-full max-w-2xl min-h-screen sm:min-h-0 my-0 sm:my-8 shadow-xl border-0 sm:border-2 rounded-none sm:rounded-lg"
            @click.stop
          >
            <CardHeader
              class="flex flex-row items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b sm:border-b-0"
            >
              <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Avatar class="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                  <AvatarFallback class="bg-primary/20 text-primary text-base sm:text-lg">
                    {{ party.name.charAt(0).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <CardTitle id="party-details-title" class="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                    <span class="truncate">{{ party.name }}</span>
                    <Crown v-if="isOwner" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-exp-medium shrink-0" />
                  </CardTitle>
                  <CardDescription class="text-xs sm:text-sm">
                    Creada el {{ formatDate(party.createdAt) }}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="h-9 w-9 sm:h-8 sm:w-8 shrink-0 touch-manipulation"
                @click="emit('close')"
                aria-label="Cerrar"
              >
                <X class="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent class="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div v-if="party.description" class="p-3 bg-muted/50 rounded-md">
                <p class="text-sm">{{ party.description }}</p>
              </div>

              <div class="space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 class="text-sm font-semibold flex items-center gap-2">
                    <Users class="h-4 w-4 shrink-0" />
                    <span>Miembros ({{ party.members.length }}/{{ party.maxMembers }})</span>
                  </h3>
                  <div v-if="party.inviteCode" class="flex items-center gap-2">
                    <code
                      class="px-2 sm:px-3 py-1.5 bg-muted rounded text-xs sm:text-sm font-mono font-semibold tracking-wider sm:tracking-widest select-all"
                      aria-label="Código de invitación: {{ party.inviteCode }}"
                    >
                      {{ party.inviteCode }}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                      @click="emit('copyCode', party.inviteCode!)"
                      :aria-label="copiedCode === party.inviteCode ? 'Código copiado al portapapeles' : 'Copiar código de invitación'"
                      :aria-pressed="copiedCode === party.inviteCode"
                    >
                      <Check v-if="copiedCode === party.inviteCode" class="h-4 w-4 text-exp-easy animate-in zoom-in duration-200" />
                      <Copy v-else class="h-4 w-4" />
                    </Button>
                    <Button
                      v-if="isOwner"
                      variant="ghost"
                      size="icon"
                      class="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                      @click="emit('regenerateCode', party.id)"
                      :disabled="isRegeneratingCode"
                      aria-label="Regenerar código de invitación"
                    >
                      <RefreshCw :class="['h-4 w-4', isRegeneratingCode && 'animate-spin']" />
                      <span v-if="isRegeneratingCode" class="sr-only">Regenerando código...</span>
                    </Button>
                  </div>
                </div>

                <div class="space-y-2" role="list" aria-label="Lista de miembros">
                  <div
                    v-for="member in party.members"
                    :key="member.id"
                    class="flex items-center justify-between p-2.5 sm:p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background"
                    role="listitem"
                  >
                    <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Avatar class="h-9 w-9 sm:h-10 sm:w-10 shrink-0" role="img"
                        :aria-label="`Avatar de ${member.profile?.displayName || member.profile?.username || 'Usuario'}`">
                        <AvatarImage v-if="member.profile?.avatarUrl" :src="member.profile.avatarUrl"
                          :alt="member.profile?.displayName || member.profile?.username" />
                        <AvatarFallback class="text-xs sm:text-sm">
                          {{
                            (member.profile?.username || member.profile?.displayName || '?')
                              .charAt(0)
                              .toUpperCase()
                          }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate text-sm sm:text-base">
                          {{ member.profile?.displayName || member.profile?.username || 'Usuario' }}
                        </p>
                        <div class="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground flex-wrap" role="group"
                          aria-label="Información del miembro">
                          <Shield class="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span>{{ getMemberRoleLabel(member.role) }}</span>
                          <span class="mx-0.5 sm:mx-1" aria-hidden="true">•</span>
                          <Calendar class="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span class="truncate">Se unió {{ formatDate(member.joinedAt) }}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      v-if="canManageMembers && member.role !== 'owner' && member.userId !== currentUserId"
                      variant="ghost"
                      size="icon"
                      class="h-9 w-9 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 transition-colors"
                      @click="emit('removeMember', party, member)"
                      :aria-label="`Expulsar a ${member.profile?.displayName || member.profile?.username || 'este miembro'}`"
                    >
                      <UserMinus class="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>

              <div v-if="isOwner" class="flex gap-2 pt-3 sm:pt-4 border-t">
                <Button variant="destructive" class="flex-1 min-h-[44px]" @click="emit('deleteParty', party)"
                  aria-label="Eliminar party">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Eliminar Party
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
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
</style>

