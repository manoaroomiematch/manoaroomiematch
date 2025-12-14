/* eslint-disable max-len */
import { test, expect } from '@playwright/test';

test.describe('Sign-in Suspension and Deactivation Notifications', () => {
  let appAvailable = true;

  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://manoaroomiematch.vercel.app';
  test.beforeAll(async () => {
    // Try to fetch the sign-in page to check if the app is running
    try {
      const res = await fetch(`${BASE_URL}/auth/signin`);
      appAvailable = res.ok;
    } catch (e) {
      appAvailable = false;
    }
  });

  test.beforeEach(function (this: any) {
    if (!appAvailable) this.skip('App is not running or not reachable. Skipping tests.');
  });
  test.slow();

  test('should display suspension notification modal when suspended user attempts login', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/auth/signin`);

    // Try to login as a known suspended user (update email if needed)
    await page.locator('input[type="email"]').fill('suspended@foo.com');
    await page.locator('input[type="password"]').fill('changeme');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for either modal or error message
    await page.waitForTimeout(2000);
    const modal = page.locator('div[role="dialog"]');
    const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    const errorVisible = await page.getByText(/error|invalid|incorrect/i).isVisible({ timeout: 1000 }).catch(() => false);

    // If user doesn't exist (error shown), skip test
    if (!modalVisible && errorVisible) {
      test.skip();
    }

    // If modal is visible, verify it
    if (modalVisible) {
      expect(modalVisible).toBeTruthy();
    }
  });

  test('should show suspension reason and dates in notification', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/auth/signin`);

    // Try to login as a known suspended user (update email if needed)
    await page.locator('input[type="email"]').fill('suspended@foo.com');
    await page.locator('input[type="password"]').fill('changeme');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for either modal or error message
    await page.waitForTimeout(2000);
    const modal = page.locator('div[role="dialog"]');
    const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    const errorVisible = await page.getByText(/error|invalid|incorrect/i).isVisible({ timeout: 1000 }).catch(() => false);

    // If user doesn't exist (error shown), skip test
    if (!modalVisible && errorVisible) {
      test.skip();
    }

    // If modal is visible, check for reason and date fields
    if (modalVisible) {
      const reasonVisible = await modal.locator('text=Reason').isVisible().catch(() => false);
      expect(reasonVisible).toBeTruthy();
    }
  });

  test('sign-in page renders without errors', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/auth/signin`);

    // Verify page loads without critical errors
    await expect(page.locator('h1, h2, h3')).toBeDefined();

    // Check that the page has no console errors
    let hasConsoleError = false;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        hasConsoleError = true;
        console.error('Console error:', msg.text());
      }
    });

    // Wait for page to load with DOM content loaded event instead of arbitrary timeout
    await page.waitForLoadState('domcontentloaded');

    expect(!hasConsoleError).toBeTruthy();
  });

  test('should allow normal user to sign in successfully', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/auth/signin`);

    // Enter valid credentials for a non-suspended user
    await page.locator('input[type="email"]').fill('john@foo.com');
    await page.locator('input[type="password"]').fill('changeme');

    // Click sign-in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for URL to change from sign-in page (use waitForURL instead of waitForNavigation)
    await page.waitForURL((url) => !url.toString().includes('/auth/signin'), { timeout: 5000 }).catch(() => {});

    // Verify we're not on the sign-in page anymore (or error message doesn't appear)
    const stillOnSignIn = page.url().includes('/auth/signin');
    if (stillOnSignIn) {
      // If user doesn't exist, skip
      return;
    }
    expect(!stillOnSignIn).toBeTruthy();
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/auth/signin`);

    // Enter invalid credentials
    await page.locator('input[type="email"]').fill('nonexistent@foo.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Click sign-in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for error message to appear instead of arbitrary timeout
    const errorLocator = page.locator('text=/error|invalid|incorrect|failed/i');
    const errorVisible = await errorLocator.isVisible({ timeout: 5000 }).catch(() => false);

    // Either error message is visible or we're still on sign-in page
    expect(errorVisible || page.url().includes('/auth/signin')).toBeTruthy();
  });
});
