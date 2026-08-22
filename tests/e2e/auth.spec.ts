import { test, expect } from '@playwright/test';

test.describe('Auth Pages E2E', () => {
  test('renders passwordless login page with email input and send code button', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#send-code-btn')).toContainText('Send 6-Digit Code');
  });

  test('redirects register page to passwordless login flow', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('#email-input')).toBeVisible();
  });
});
