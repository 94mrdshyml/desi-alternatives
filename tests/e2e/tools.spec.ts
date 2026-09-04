import { test, expect } from '@playwright/test';

test.describe('Tools & Pages E2E', () => {
  test('renders submit page', async ({ page }) => {
    await page.goto('/submit');
    await expect(page).toHaveTitle(/Submit/);
    await expect(page.locator('main h1')).toContainText('List your');
  });

  test('redirects unauthenticated users away from admin page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/login/);
  });

  test('renders programmatic SEO alternative comparison page', async ({ page }) => {
    await page.goto('/alternatives/datadog');
    await expect(page.locator('main h1')).toContainText('Alternatives to');
    await expect(page.locator('table')).toBeVisible();
  });

  test('renders footer on tools page, alternatives directory, and alternative detail page', async ({ page }) => {
    // 1. Alternatives directory
    await page.goto('/alternatives');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('Desi Alternatives');

    // 2. Alternative detail page
    await page.goto('/alternatives/datadog');
    await expect(page.locator('footer')).toBeVisible();

    // 3. Category tools page
    await page.goto('/category/developer-tools');
    await expect(page.locator('footer')).toBeVisible();

    // 4. Submit page
    await page.goto('/submit');
    await expect(page.locator('footer')).toBeVisible();
  });
});
