<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Party, PartyMember } from '@/composables/useParties'
import { Check, Copy, Crown, LogOut, Settings, Users } from 'lucide-vue-next'

type ReadonlyParty = Readonly<Omit<Party, 'members'>> & {
  readonly members: readonly Readonly<PartyMember>[]
}

interface Props {
  party: ReadonlyParty | Party
  isOwner: boolean
  copiedCode: string | null
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  copyCode: [code: string]
  viewDetails: [party: ReadonlyParty | Party]
  leave: [partyId: string]
  enter: [partyId: string]
}>()
</script>

<template>
  <Card
    class="group hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background"
    role="article"
    :aria-label="`Party: ${party.name}`"
    tabindex="0"
    @keydown.enter="emit('enter', party.id)"
    @keydown.space.prevent="emit('enter', party.id)">
    <div
      class="absolute inset-0 bg-linear-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

    <CardHeader class="relative space-y-3 sm:space-y-4 p-4 sm:p-6">
      <div class="flex items-start gap-2 sm:gap-3">
        <div class="relative shrink-0" role="img" :aria-label="`Avatar de ${party.name}`">
          <div
            class="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300 opacity-0 group-hover:opacity-100" />
          <Avatar
            class="h-10 w-10 sm:h-12 sm:w-12 relative border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
            <AvatarFallback
              class="bg-linear-to-br from-primary/20 to-accent/20 text-primary text-base sm:text-lg font-bold group-hover:scale-110 transition-transform duration-300">
              {{ party.name.charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-1">
            <CardTitle class="text-sm sm:text-base font-bold truncate group-hover:text-primary transition-colors">
              {{ party.name }}
            </CardTitle>
            <Crown v-if="isOwner" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-exp-medium shrink-0 animate-pulse"
              aria-label="Eres el dueño de esta party" role="img" />
          </div>
          <CardDescription class="text-xs flex items-center gap-1 sm:gap-1.5 flex-wrap" role="status">
            <Users class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70 shrink-0" aria-hidden="true" />
            <span class="font-medium">{{ party.members.length }}</span>
            <span class="text-muted-foreground">/ {{ party.maxMembers }} miembros</span>
          </CardDescription>
          <p v-if="party.description" class="text-xs text-muted-foreground mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
            {{ party.description }}
          </p>
        </div>
      </div>

      <div v-if="party.inviteCode"
        class="flex items-center gap-2 p-2 sm:p-2.5 bg-linear-to-r from-muted/60 to-muted/40 rounded-lg border border-primary/10 group-hover:border-primary/30 transition-colors"
        role="group" aria-label="Código de invitación">
        <code
          class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-background/80 rounded-md text-xs font-mono font-bold text-center tracking-wider sm:tracking-widest text-primary group-hover:bg-background transition-colors select-all"
          aria-label="Código de invitación: {{ party.inviteCode }}">
          {{ party.inviteCode }}
        </code>
        <Button variant="ghost" size="icon"
          class="h-9 w-9 sm:h-8 sm:w-8 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          @click.stop="emit('copyCode', party.inviteCode!)"
          :aria-label="copiedCode === party.inviteCode ? 'Código copiado al portapapeles' : 'Copiar código de invitación'"
          :aria-pressed="copiedCode === party.inviteCode">
          <Check v-if="copiedCode === party.inviteCode" class="h-4 w-4 text-exp-easy animate-in zoom-in duration-200" />
          <Copy v-else class="h-4 w-4" />
        </Button>
      </div>

      <div class="flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-border/50">
        <div class="flex -space-x-2 flex-1 min-w-0" role="list" aria-label="Miembros de la party">
          <Avatar v-for="(member, idx) in party.members.slice(0, 5)" :key="member.id"
            class="h-7 w-7 sm:h-8 sm:w-8 border-2 border-background shrink-0 hover:z-10 hover:scale-110 transition-all duration-200 cursor-pointer touch-manipulation"
            :style="{ zIndex: 5 - idx }"
            :title="member.profile?.displayName || member.profile?.username || 'Miembro'"
            :aria-label="`Miembro: ${member.profile?.displayName || member.profile?.username || 'Usuario'}`"
            role="listitem">
            <AvatarImage v-if="member.profile?.avatarUrl" :src="member.profile.avatarUrl" :alt="member.profile?.displayName || member.profile?.username" />
            <AvatarFallback class="text-[10px] sm:text-xs bg-linear-to-br from-primary/20 to-accent/20">
              {{ (member.profile?.username || member.profile?.displayName || '?').charAt(0).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
          <div v-if="party.members.length > 5"
            class="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-linear-to-br from-muted to-muted/80 border-2 border-background flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 hover:scale-110 transition-transform cursor-default"
            role="listitem"
            :aria-label="`Y ${party.members.length - 5} miembros más`"
            :title="`${party.members.length - 5} miembros adicionales`">
            +{{ party.members.length - 5 }}
          </div>
        </div>
        <div class="flex gap-1 items-center" role="group" aria-label="Acciones de la party">
          <Button variant="default" size="sm" class="h-8 px-3 text-xs min-h-[44px] sm:min-h-0" @click.stop="emit('enter', party.id)"
            aria-label="Entrar a la party {{ party.name }}">
            Entrar
          </Button>
          <Button variant="ghost" size="icon"
            class="h-9 w-9 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            @click.stop="emit('viewDetails', party)" aria-label="Ver detalles y configurar la party">
            <Settings class="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button v-if="!isOwner" variant="ghost" size="icon"
            class="h-9 w-9 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            @click.stop="emit('leave', party.id)" :disabled="isSubmitting" aria-label="Salir de la party {{ party.name }}">
            <LogOut class="h-4 w-4" aria-hidden="true" />
            <span v-if="isSubmitting" class="sr-only">Procesando...</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  </Card>
</template>
