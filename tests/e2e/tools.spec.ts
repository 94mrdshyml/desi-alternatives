import { test, expect } from '@playwright/test';

test.describe('Tools & Pages E2E', () => {
  test('renders submit page', async ({ page }) => {
    await page.goto('/submit');
    await expect(page).toHaveTitle(/Submit/);
    await expect(page.locator('main h1')).toContainText('List your');
  });

  test('restricts admin page for unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('main h1')).toContainText('Admin Access Restricted');
  });

  test('renders programmatic SEO alternative comparison page', async ({ page }) => {
    await page.goto('/alternatives/datadog');
    await expect(page.locator('main h1')).toContainText('Alternatives to');
    await expect(page.locator('table')).toBeVisible();
  });
});
