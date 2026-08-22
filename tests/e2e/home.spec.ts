import { test, expect } from '@playwright/test';

test.describe('Landing Page & Directory E2E', () => {
  test('renders Indian tech header and title', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Desi Alternatives/);

    // Check main brand heading
    const heading = page.locator('main h1');
    await expect(heading).toContainText('Replace Global Giants');
    await expect(heading).toContainText('Indian Tech');

    // Check badge
    const badge = page.locator('main').getByText('Indian Alternatives to Global Giants');
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
