<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Party, PartyMember } from '@/composables/useParties';
import { Check, Copy, Crown, LogOut, Settings, Users } from 'lucide-vue-next';

type ReadonlyParty = Readonly<Omit<Party, 'members'>> & {
  readonly members: readonly Readonly<PartyMember>[];
};

interface Props {
  party: ReadonlyParty | Party;
  isOwner: boolean;
  copiedCode: string | null;
  isSubmitting: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  copyCode: [code: string];
  viewDetails: [party: ReadonlyParty | Party];
  leave: [partyId: string];
  enter: [partyId: string];
}>();

const NOTCH =
  'polygon(0 5px,5px 5px,5px 0,calc(100% - 5px) 0,calc(100% - 5px) 5px,100% 5px,100% calc(100% - 5px),calc(100% - 5px) calc(100% - 5px),calc(100% - 5px) 100%,5px 100%,5px calc(100% - 5px),0 calc(100% - 5px))';
</script>

<template>
  <Card
    class="group relative rounded-none border-2 border-secondary/25 bg-card/60 hover:border-secondary/50 hover:brightness-105 shadow-[0_5px_0_0_oklch(0.38_0.18_330)] hover:shadow-[0_5px_0_0_oklch(0.48_0.22_330)] active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.38_0.18_330)] transition-[transform,filter,box-shadow,border-color] duration-100 motion-reduce:active:translate-y-0 focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2 focus-within:ring-offset-background overflow-hidden cursor-pointer"
    role="article"
    :aria-label="`Party: ${party.name}`"
    tabindex="0"
    @keydown.enter="emit('enter', party.id)"
    @keydown.space.prevent="emit('enter', party.id)"
  >
    <!-- HUD corner brackets -->
    <span
      class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40"
      aria-hidden="true"
    />
    <span
      class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary/40"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-secondary/40"
      aria-hidden="true"
    />

    <CardHeader class="relative space-y-3 sm:space-y-4 p-4 sm:p-6">
      <div class="flex items-start gap-2 sm:gap-3">
        <div class="relative shrink-0" role="img" :aria-label="`Avatar de ${party.name}`">
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 flex items-center justify-center text-secondary text-base sm:text-lg font-bold"
            :style="{ clipPath: NOTCH }"
          >
            {{ party.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2 mb-1">
            <CardTitle
              class="text-sm sm:text-base font-bold truncate group-hover:text-secondary transition-colors"
            >
              {{ party.name }}
            </CardTitle>
            <Crown
              v-if="isOwner"
              class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-exp-medium shrink-0 motion-safe:animate-pulse"
              aria-label="Eres el dueño de esta party"
              role="img"
            />
          </div>
          <CardDescription
            class="font-pixel text-[8px] flex items-center gap-1 sm:gap-1.5 flex-wrap"
            role="status"
          >
            <Users
              class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary/70 shrink-0"
              aria-hidden="true"
            />
            <span class="font-medium text-secondary/80">{{ party.members.length }}</span>
            <span class="text-muted-foreground">/ {{ party.maxMembers }} MIEMBROS</span>
          </CardDescription>
          <p
            v-if="party.description"
            class="text-xs text-muted-foreground mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed"
          >
            {{ party.description }}
          </p>
        </div>
      </div>

      <div
        v-if="party.inviteCode"
        class="flex items-center gap-2 p-2 sm:p-2.5 bg-muted/50 border border-secondary/15 group-hover:border-secondary/30 transition-colors"
        role="group"
        aria-label="Código de invitación"
      >
        <code
          class="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-background/80 text-xs font-mono font-bold text-center tracking-wider sm:tracking-widest text-secondary group-hover:bg-background transition-colors select-all"
          :aria-label="`Código de invitación: ${party.inviteCode}`"
        >
          {{ party.inviteCode }}
        </code>
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 sm:h-8 sm:w-8 shrink-0 rounded-none hover:bg-secondary/10 hover:text-secondary transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          :aria-label="
            copiedCode === party.inviteCode
              ? 'Código copiado al portapapeles'
              : 'Copiar código de invitación'
          "
          :aria-pressed="copiedCode === party.inviteCode"
          @click.stop="emit('copyCode', party.inviteCode!)"
        >
          <Check
            v-if="copiedCode === party.inviteCode"
            class="h-4 w-4 text-exp-easy motion-safe:animate-in motion-safe:zoom-in motion-safe:duration-200"
            aria-hidden="true"
          />
          <Copy v-else class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div class="flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-border/40">
        <div class="flex -space-x-2 flex-1 min-w-0" role="list" aria-label="Miembros de la party">
          <Avatar
            v-for="(member, idx) in party.members.slice(0, 5)"
            :key="member.id"
            class="h-7 w-7 sm:h-8 sm:w-8 border-2 border-background shrink-0 hover:z-10 hover:scale-110 transition-all duration-200 cursor-pointer touch-manipulation"
            :style="{ zIndex: 5 - idx }"
            :title="member.profile?.displayName || member.profile?.username || 'Miembro'"
            :aria-label="`Miembro: ${member.profile?.displayName || member.profile?.username || 'Usuario'}`"
            role="listitem"
          >
            <AvatarImage
              v-if="member.profile?.avatarUrl"
              :src="member.profile.avatarUrl"
              :alt="member.profile?.displayName || member.profile?.username"
            />
            <AvatarFallback class="text-[10px] sm:text-xs bg-secondary/15 text-secondary">
              {{
                (member.profile?.username || member.profile?.displayName || '?')
                  .charAt(0)
                  .toUpperCase()
              }}
            </AvatarFallback>
          </Avatar>
          <div
            v-if="party.members.length > 5"
            class="h-7 w-7 sm:h-8 sm:w-8 bg-muted border-2 border-background flex items-center justify-center font-pixel text-[8px] font-bold shrink-0 hover:scale-110 transition-transform cursor-default"
            role="listitem"
            :aria-label="`Y ${party.members.length - 5} miembros más`"
            :title="`${party.members.length - 5} miembros adicionales`"
          >
            +{{ party.members.length - 5 }}
          </div>
        </div>
        <div class="flex gap-1 items-center" role="group" aria-label="Acciones de la party">
          <Button
            variant="default"
            size="sm"
            class="btn-game h-8 px-3 rounded-none font-pixel text-[9px] min-h-[44px] sm:min-h-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            :aria-label="`Entrar a la party ${party.name}`"
            @click.stop="emit('enter', party.id)"
          >
            ENTRAR
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-9 w-9 sm:h-8 sm:w-8 rounded-none hover:bg-secondary/10 hover:text-secondary transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Ver detalles y configurar la party"
            @click.stop="emit('viewDetails', party)"
          >
            <Settings class="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            v-if="!isOwner"
            variant="ghost"
            size="icon"
            class="h-9 w-9 sm:h-8 sm:w-8 rounded-none text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            :disabled="isSubmitting"
            :aria-label="`Salir de la party ${party.name}`"
            @click.stop="emit('leave', party.id)"
          >
            <LogOut class="h-4 w-4" aria-hidden="true" />
            <span v-if="isSubmitting" class="sr-only">Procesando...</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  </Card>
</template>
