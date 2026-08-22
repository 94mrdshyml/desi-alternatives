import { test, expect } from '@playwright/test';

test.describe('Admin Control Center & Programmatic SEO E2E', () => {
  test('redirects unauthenticated users from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/login/);
  });

  test('redirects unauthenticated users from /admin/catalog to /login', async ({ page }) => {
    await page.goto('/admin/catalog');
    await expect(page).toHaveURL(/login/);
  });

  test('redirects unauthenticated users from /admin/moderation to /login', async ({ page }) => {
    await page.goto('/admin/moderation');
    await expect(page).toHaveURL(/login/);
  });

  test('redirects unauthenticated users from /admin/analytics to /login', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page).toHaveURL(/login/);
  });

  test('redirects unauthenticated users from /admin/settings to /login', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page).toHaveURL(/login/);
  });

  test('renders programmatic SEO comparison page for global alternative', async ({ page }) => {
    await page.goto('/alternatives/notion');
    await expect(page).toHaveTitle(/Indian Alternatives to Notion/);
    await expect(page.locator('h1').first()).toContainText('Indian Alternatives to');
    await expect(page.locator('text=Zero Forex Fees')).toBeVisible();
    await expect(page.locator('text=18% GST Input Credit')).toBeVisible();
    await expect(page.locator('text=India Data Residency')).toBeVisible();
  });
});
