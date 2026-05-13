import { expect, test } from '@playwright/test';

/**
 * Smoke E2E: confirm the public landing-redirect chain works. An
 * unauthenticated visit to `/` should bounce to `/login` (per
 * `app/middleware/auth.global.ts` post-S4) and the login page should
 * render its form scaffolding.
 *
 * Auth-flow happy path proper requires a Clerk test session. That goes
 * in a follow-up PR once a Clerk staging key is wired into CI secrets.
 */
test.describe('public landing', () => {
  test('unauthenticated visit to / redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('/login renders within 5s and shows the page title', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/FreakDays/);
  });
});
