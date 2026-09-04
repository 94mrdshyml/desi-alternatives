import { test, expect } from '@playwright/test';

test.describe('Auth Pages E2E', () => {
  test('renders passwordless login page with email input, send code button, and get started link', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#send-code-btn')).toContainText('Send 6-Digit Code');
    await expect(page.locator('a[href="/register"]')).toContainText('Get started');
  });

  test('renders register page with name, email input, send code button, and sign in link', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/Get Started/);
    await expect(page.locator('#name-input')).toBeVisible();
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#send-code-btn')).toContainText('Send 6-Digit Code');
    await expect(page.locator('a[href="/login"]')).toContainText('Sign in');
  });

  test('navbar Submit a Tool button links to /submit and Sign In button links to /login', async ({ page }) => {
    await page.goto('/');
    const submitBtn = page.locator('header a[href="/submit"]');
    const signInBtn = page.locator('header a[href="/login"]');
    await expect(submitBtn).toBeVisible();
    await expect(signInBtn).toBeVisible();
  });
});
