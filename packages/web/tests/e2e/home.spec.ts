import { expect, test } from '@playwright/test';

/**
 * Smoke E2E: confirm the public landing-redirect chain works.
 *
 * Unauthenticated requests to protected routes should bounce to either:
 *   - `/login`   — custom middleware redirect (auth.global.ts)
 *   - `/sign-in` — Clerk's built-in redirect (happens when Clerk
 *                  intercepts before the middleware, e.g. on first
 *                  cold-start or when publishableKey is live)
 *
 * Both destinations are valid. The regex `/\/(login|sign-in)/` accepts
 * either, including Clerk's query-string variant
 * (`/sign-in?redirect_url=...`).
 *
 * To validate locally:
 *   pnpm --filter freak-days build
 *   pnpm --filter freak-days preview
 * then run `pnpm --filter freak-days test:e2e` with the correct env vars
 * (NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY).
 *
 * Auth-flow happy path requires a Clerk test session and goes in a
 * follow-up once a Clerk staging key is wired into CI secrets.
 */
test.describe('public landing', () => {
  test('unauthenticated visit to / redirects to login or sign-in', async ({ page }) => {
    await page.goto('/');
    // Accept both /login (custom middleware) and /sign-in (Clerk built-in).
    await expect(page).toHaveURL(/\/(login|sign-in)/);
  });

  test('/login renders within 5s and shows the FreakDays page title', async ({ page }) => {
    await page.goto('/login');
    // Title must contain "FreakDays". If another project's build is being
    // served, this assertion fails with a clear mismatch message.
    await expect(page).toHaveTitle(/FreakDays/);
  });

  test('unauthenticated visit to /anime redirects to login or sign-in', async ({ page }) => {
    await page.goto('/anime');
    // Protected route — must redirect away from /anime.
    await expect(page).toHaveURL(/\/(login|sign-in)/);
  });

  test('visiting a non-existent route renders the FreakDays 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-fd404');
    // The 404 page should still be served under the FreakDays shell; verify
    // via the <title> tag so the check works regardless of layout changes.
    await expect(page).toHaveTitle(/FreakDays/);
  });
});
