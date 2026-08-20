import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E', () => {
  test('renders sovereign editorial header and title', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Desi Alternatives/);

    // Check brand heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Discover');
    await expect(heading).toContainText('sovereign');

    // Check Sovereign Indian SaaS badge
    const badge = page.locator('text=Sovereign Indian SaaS Directory');
    await expect(badge).toBeVisible();
  });
});
