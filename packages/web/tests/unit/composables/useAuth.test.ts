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

  describe('signUp (legacy email/password)', () => {
    it('sigue devolviendo no soportado', async () => {
      const auth = useAuth();

      const result = await auth.signUp('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clerk');
    });
  });

  describe('signIn (Clerk custom flow)', () => {
    it('falla con mensaje claro cuando Clerk no está inicializado', async () => {
      const auth = useAuth();

      const result = await auth.signIn('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Clerk');
      expect(result.error).toContain('NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    });

    it('activa la sesión cuando el intento se completa', async () => {
      const create = vi.fn().mockResolvedValue({
        status: 'complete',
        createdSessionId: 'sess_123',
      });
      const setActive = vi.fn().mockResolvedValue(undefined);
      (window as Window & { Clerk?: unknown }).Clerk = {
        client: { signIn: { create } },
        setActive,
        user: { id: 'user_1' },
      };

      const auth = useAuth();
      const result = await auth.signIn('test@test.com', 'password123');

      expect(create).toHaveBeenCalledWith({
        identifier: 'test@test.com',
        password: 'password123',
      });
      expect(setActive).toHaveBeenCalledWith({ session: 'sess_123' });
      expect(result.success).toBe(true);
    });

    it('extrae el mensaje de error de Clerk cuando el intento falla', async () => {
      const create = vi.fn().mockRejectedValue({
        errors: [{ longMessage: 'La contraseña es incorrecta.' }],
      });
      (window as Window & { Clerk?: unknown }).Clerk = {
        client: { signIn: { create } },
        setActive: vi.fn(),
      };

      const authStore = useAuthStore();
      const auth = useAuth();
      const result = await auth.signIn('test@test.com', 'wrong');

      expect(result.success).toBe(false);
      expect(authStore.error).toBe('La contraseña es incorrecta.');
    });
  });

  describe('OAuth providers (Clerk custom flow)', () => {
    it('usa authenticateWithRedirect hacia /sso-callback para GitHub', async () => {
      const authenticateWithRedirect = vi.fn().mockResolvedValue(undefined);
      (window as Window & { Clerk?: unknown }).Clerk = {
        client: { signIn: { authenticateWithRedirect } },
      };

      const auth = useAuth();
      await auth.signInWithGitHub();

      expect(authenticateWithRedirect).toHaveBeenCalledWith({
        strategy: 'oauth_github',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/`,
      });
    });

    it('setea error claro cuando Clerk no está disponible', async () => {
      const authStore = useAuthStore();
      const auth = useAuth();

      await auth.signInWithGoogle();

      expect(authStore.error).toContain('Clerk');
      expect(authStore.error).toContain('NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
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
});
