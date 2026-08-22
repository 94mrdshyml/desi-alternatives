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
});
