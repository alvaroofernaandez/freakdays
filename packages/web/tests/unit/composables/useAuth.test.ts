import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuth } from '../../../app/composables/useAuth';
import { useAuthStore } from '../../../stores/auth';
import { useModulesStore } from '../../../stores/modules';

const mockOrganizationContext = {
  clearActiveOrgId: vi.fn(),
};

vi.mock('../../../app/composables/useOrganizationContext', () => ({
  useOrganizationContext: () => mockOrganizationContext,
}));

vi.mock('@/composables/useOrganizationContext', () => ({
  useOrganizationContext: () => mockOrganizationContext,
}));

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    delete (window as Window & { Clerk?: unknown }).Clerk;
  });

  describe('initialize', () => {
    it('refresca auth context y limpia sesión legacy', async () => {
      const authStore = useAuthStore();
      authStore.setSession({
        access_token: 'legacy-token',
        user: { id: 'legacy-user' },
      } as any);

      const auth = useAuth();
      await auth.initialize();

      expect(authStore.session).toBeNull();
      expect(authStore.loading).toBe(false);
    });
  });

  describe('email/password legacy', () => {
    it('signUp devuelve no soportado', async () => {
      const auth = useAuth();

      const result = await auth.signUp('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clerk');
    });

    it('signIn devuelve no soportado', async () => {
      const auth = useAuth();

      const result = await auth.signIn('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clerk');
    });
  });

  describe('signOut', () => {
    it('limpia stores/context sin llamar Supabase', async () => {
      const authStore = useAuthStore();
      const modulesStore = useModulesStore();
      authStore.setSession({
        access_token: 'legacy-token',
        user: { id: 'legacy-user' },
      } as any);
      modulesStore.setModule('quests', true);
      modulesStore.synced = true;

      const auth = useAuth();
      await auth.signOut();

      expect(authStore.session).toBeNull();
      expect(modulesStore.synced).toBe(false);
      expect(mockOrganizationContext.clearActiveOrgId).toHaveBeenCalledOnce();
    });
  });

  describe('OAuth providers (Clerk bridge only)', () => {
    it('usa Clerk bridge para GitHub', async () => {
      const redirectToSignIn = vi.fn().mockResolvedValue(undefined);
      (window as Window & { Clerk?: unknown }).Clerk = {
        redirectToSignIn,
      };

      const auth = useAuth();
      await auth.signInWithGitHub();

      expect(redirectToSignIn).toHaveBeenCalledWith({
        strategy: 'oauth_github',
        redirectUrl: `${window.location.origin}/`,
      });
    });

    it('setea error claro cuando Clerk bridge no está disponible', async () => {
      const authStore = useAuthStore();
      const auth = useAuth();

      await auth.signInWithGoogle();

      expect(authStore.error).toContain('Clerk bridge no disponible');
      expect(authStore.error).toContain('NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    });
  });
});
