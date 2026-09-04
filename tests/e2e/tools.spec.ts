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

  test('serves llms.txt and llms-full.txt for generative AI crawlers', async ({ page }) => {
    // 1. llms.txt
    const res1 = await page.goto('/llms.txt');
    expect(res1?.status()).toBe(200);
    const text1 = await page.textContent('body');
    expect(text1).toContain('Desi Alternatives');
    expect(text1).toContain('Sovereign Indian Software Directory');

    // 2. llms-full.txt
    const res2 = await page.goto('/llms-full.txt');
    expect(res2?.status()).toBe(200);
    const text2 = await page.textContent('body');
    expect(text2).toContain('Technical Knowledge Base');

    // 3. IndexNow verification key file
    const res3 = await page.goto('/d351a17e89ab4c2f88e1029c45b78f61.txt');
    expect(res3?.status()).toBe(200);
    const text3 = await page.textContent('body');
    expect(text3).toContain('d351a17e89ab4c2f88e1029c45b78f61');
  });
});
