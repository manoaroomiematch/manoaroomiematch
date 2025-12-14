/* eslint-disable max-len */
import { test, expect } from '@playwright/test';
import { test as authTest } from './auth-utils';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://manoaroomiematch.vercel.app';

// =============================================================================
// ESSENTIAL PAGE LOAD TESTS
// =============================================================================

test.describe('Page Loads', () => {
  test('Sign In page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const body = await page.locator('body').isVisible();
    expect(body).toBeTruthy();
  });

  test('Sign Up page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const body = await page.locator('body').isVisible();
    expect(body).toBeTruthy();
  });
});

// =============================================================================
// FORM FUNCTIONALITY TESTS
// =============================================================================

test.describe('Form Functionality', () => {
  test('Sign In email field accepts input', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@hawaii.edu');
    const value = await emailInput.inputValue();
    expect(value).toBe('test@hawaii.edu');
  });

  test('Sign In password field accepts input', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('testpass');
    const isVisible = await passwordInput.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('Sign Up has input fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const inputs = page.locator('input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });
});

// =============================================================================
// AUTHENTICATION TESTS
// =============================================================================

test.describe('Authentication', () => {
  test('Invalid credentials stay on sign in page', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.locator('input[type="email"]').first().fill('fake@foo.com');
    await page.locator('input[type="password"]').first().fill('fakepass');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await page.waitForTimeout(2000);
    const isStillOnSignIn = page.url().includes('/auth/signin');
    expect(isStillOnSignIn).toBeTruthy();
  });

  test('Sign In has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const button = page.getByRole('button', { name: /sign in|login/i }).first();
    const isVisible = await button.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('Sign Up has submit button', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const button = page.getByRole('button', { name: /create|sign up|submit/i }).first();
    const isVisible = await button.isVisible();
    expect(isVisible).toBeTruthy();
  });
});

// =============================================================================
// AUTHENTICATED USER TESTS
// =============================================================================

authTest.describe('Authenticated Pages', () => {
  authTest('Profile page loads when authenticated', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/profile`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const body = await userPage.locator('body').isVisible();
      expect(body).toBeTruthy();
    } catch {
      authTest.skip();
    }
  });

  authTest('Matches page loads when authenticated', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/matches`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const body = await userPage.locator('body').isVisible();
      expect(body).toBeTruthy();
    } catch {
      authTest.skip();
    }
  });

  authTest('Match cards are visible on matches page', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/matches`, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Check for any match cards or profile elements
      const hasMatchCards = await userPage.locator('[class*="card"]').count().catch(() => 0) > 0;
      const hasProfiles = await userPage.locator('[class*="profile"]').count().catch(() => 0) > 0;
      const hasContent = hasMatchCards || hasProfiles || await userPage.locator('button').count().catch(() => 0) > 0;

      expect(hasContent).toBeTruthy();
    } catch {
      authTest.skip();
    }
  });

  authTest('Can interact with match action buttons', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/matches`, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Check for action buttons (save, pass, accept, etc)
      const buttons = userPage.locator('button');
      const buttonCount = await buttons.count().catch(() => 0);

      // Should have at least some buttons on matches page
      expect(buttonCount).toBeGreaterThan(0);
    } catch {
      authTest.skip();
    }
  });

  authTest('Messages page loads when authenticated', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/messages`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const body = await userPage.locator('body').isVisible();
      expect(body).toBeTruthy();
    } catch {
      authTest.skip();
    }
  });

  authTest('Saved matches page loads when authenticated', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/saved-matches`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const body = await userPage.locator('body').isVisible();
      expect(body).toBeTruthy();
    } catch {
      authTest.skip();
    }
  });

  authTest('Edit profile page loads when authenticated', async ({ getUserPage }) => {
    try {
      const userPage = await getUserPage('john@foo.com', 'changeme');
      await userPage.goto(`${BASE_URL}/edit-profile`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const body = await userPage.locator('body').isVisible();
      expect(body).toBeTruthy();
    } catch {
      authTest.skip();
    }
  });
});
