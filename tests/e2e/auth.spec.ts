import { test, expect } from '@playwright/test';

test.describe('Auth Pages E2E', () => {
  test('renders login page with email and password inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
  });

  test('renders register page with first name, last name, email and password inputs', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/Register/);
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
  });
});
