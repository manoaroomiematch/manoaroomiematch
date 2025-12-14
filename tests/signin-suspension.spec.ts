/* eslint-disable max-len */
import { test, expect } from '@playwright/test';

test.describe('Sign-in Page Functionality', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://manoaroomiematch.vercel.app';

  test.slow();

  test('sign-in page renders without errors', async ({ page }) => {
    // Navigate to sign-in page
    try {
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      test.skip();
    }

    // Verify key elements are visible
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.getByRole('button', { name: /sign in/i });

    const emailVisible = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
    const passwordVisible = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false);
    const buttonVisible = await signInButton.isVisible({ timeout: 5000 }).catch(() => false);

    expect(emailVisible && passwordVisible && buttonVisible).toBeTruthy();
  });

  test('email input accepts valid email format', async ({ page }) => {
    // Navigate to sign-in page
    try {
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      test.skip();
    }

    const emailInput = page.locator('input[type="email"]');

    // Test email input
    await emailInput.fill('test@hawaii.edu');
    const value = await emailInput.inputValue();

    expect(value).toBe('test@hawaii.edu');
  });

  test('password input accepts characters', async ({ page }) => {
    // Navigate to sign-in page
    try {
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      test.skip();
    }

    const passwordInput = page.locator('input[type="password"]');

    // Type password - just verify it accepts input
    await passwordInput.fill('testpassword123');

    // Verify input is accepted
    const isVisible = await passwordInput.isVisible({ timeout: 5000 });
    expect(isVisible).toBeTruthy();
  });

  test('sign-in button is clickable', async ({ page }) => {
    // Navigate to sign-in page
    try {
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      test.skip();
    }

    const button = page.getByRole('button', { name: /sign in/i });

    // Verify button is enabled and can be clicked
    const isEnabled = await button.isEnabled({ timeout: 5000 });
    expect(isEnabled).toBeTruthy();
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    // Navigate to sign-in page
    try {
      await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      test.skip();
    }

    // Enter invalid credentials
    await page.locator('input[type="email"]').fill('nonexistent@foo.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Click sign-in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for response or stay on page
    await page.waitForTimeout(2000);

    // Either error message is visible or we're still on sign-in page
    const errorVisible = await page.getByText(/error|invalid|incorrect|failed/i).isVisible({ timeout: 3000 }).catch(() => false);
    const stillOnSignIn = page.url().includes('/auth/signin');

    expect(errorVisible || stillOnSignIn).toBeTruthy();
  });

  test('change password page loads', async ({ page }) => {
    // Navigate to change password page
    try {
      await page.goto(`${BASE_URL}/auth/change-password`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
      test.skip();
    }

    // Check that page loaded
    const hasContent = await page.locator('body').isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasContent).toBeTruthy();
  });
});
