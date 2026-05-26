import { useAuth } from './useAuth';
import { useAuthStore } from '~~/stores/auth';

export function useRegisterPage() {
  const auth = useAuth();
  const authStore = useAuthStore();

  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const showPassword = ref(false);

  // Clerk email/password sign-up needs an email verification step. Once
  // `signUp.create` succeeds, we flip into the code-entry stage.
  const pendingVerification = ref(false);
  const verificationCode = ref('');

  const passwordsMatch = computed(() => password.value === confirmPassword.value);
  const isValidPassword = computed(() => password.value.length >= 6);

  const passwordStrength = computed(() => {
    const p = password.value;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  });

  const strengthLabel = computed((): string => {
    const labels: string[] = ['', 'Débil', 'Regular', 'Fuerte', '¡Épica!'];
    const index = Math.max(0, Math.min(passwordStrength.value, labels.length - 1));
    return labels[index] ?? '';
  });

  const strengthColor = computed((): string => {
    const colors: string[] = ['', 'bg-destructive', 'bg-exp-hard', 'bg-exp-medium', 'bg-exp-easy'];
    const index = Math.max(0, Math.min(passwordStrength.value, colors.length - 1));
    return colors[index] ?? '';
  });

  const canSubmit = computed(() => {
    return (
      email.value &&
      password.value &&
      passwordsMatch.value &&
      isValidPassword.value &&
      !authStore.loading
    );
  });

  async function handleSubmit() {
    if (!canSubmit.value) return;

    const result = await auth.signUp(email.value, password.value);

    if (!result.success) return;

    // Instance without email verification — the session is already active.
    if ('status' in result && result.status === 'complete') {
      await navigateTo('/');
      return;
    }

    pendingVerification.value = true;
  }

  async function handleVerify() {
    if (!verificationCode.value || authStore.loading) return;

    const result = await auth.verifyEmailCode(verificationCode.value);

    if (result.success) {
      await navigateTo('/');
    }
  }

  async function handleGoogleSignIn() {
    await auth.signInWithGoogle();
  }

  async function handleGitHubSignIn() {
    await auth.signInWithGitHub();
  }

  async function handleDiscordSignIn() {
    await auth.signInWithDiscord();
  }

  function reset() {
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    showPassword.value = false;
    pendingVerification.value = false;
    verificationCode.value = '';
  }

  return {
    email,
    password,
    confirmPassword,
    showPassword,
    pendingVerification,
    verificationCode,
    passwordsMatch,
    isValidPassword,
    passwordStrength,
    strengthLabel,
    strengthColor,
    canSubmit,
    handleSubmit,
    handleVerify,
    handleGoogleSignIn,
    handleGitHubSignIn,
    handleDiscordSignIn,
    reset,
  };
}
