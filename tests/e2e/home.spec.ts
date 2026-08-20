import { test, expect } from '@playwright/test';

test.describe('Landing Page & Directory E2E', () => {
  test('renders sovereign editorial header and title', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Desi Alternatives/);

    // Check main brand heading
    const heading = page.locator('main h1');
    await expect(heading).toContainText('Discover');
    await expect(heading).toContainText('sovereign');

    // Check Sovereign Indian SaaS badge
    const badge = page.locator('main').getByText('Sovereign Indian SaaS Directory');
    await expect(badge).toBeVisible();
  });

  test('renders category navigation pills', async ({ page }) => {
    await page.goto('/');
    const allToolsPill = page.locator('main').getByText('All Tools');
    await expect(allToolsPill).toBeVisible();
  });

  test('navigates to clean category landing page', async ({ page }) => {
    await page.goto('/category/developer-tools');
    await expect(page).toHaveTitle(/Developer Tools/);
    const categoryHeading = page.locator('main h1');
    await expect(categoryHeading).toContainText('Developer Tools');
  });
});
