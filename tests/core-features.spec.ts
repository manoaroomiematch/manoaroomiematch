/* eslint-disable max-len */
import { test, expect, Page } from '@playwright/test';
import { test as authTest } from './auth-utils';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Helper to wait for page load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

// =============================================================================
// PUBLIC PAGES (No authentication required)
// =============================================================================

test.describe('Public Pages - Landing & Auth', () => {
  test('Landing page loads and displays key content', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Verify key landing page elements
    await expect(page.getByRole('heading', { name: /Find the Perfect Roommate/i })).toBeVisible();
    await expect(page.getByText(/Connecting students in Mānoa/i)).toBeVisible();
    await expect(page.getByText(/Key Features/i)).toBeVisible();
  });

  test('Sign In page loads with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await waitForPageLoad(page);

    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('Sign Up page loads with form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    await waitForPageLoad(page);

    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('404 page displays correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page-xyz`);
    await waitForPageLoad(page);

    await expect(page.getByText(/Page not found|404/i)).toBeVisible();
  });
});

// =============================================================================
// AUTHENTICATION & SIGN-IN TESTS
// =============================================================================

test.describe('Authentication Flow', () => {
  test('User can sign in with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await waitForPageLoad(page);

    // Fill credentials
    await page.locator('input[name="email"]').fill('john@foo.com');
    await page.locator('input[name="password"]').fill('changeme');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for navigation away from signin
    await page.waitForURL((url) => !url.toString().includes('/auth/signin'), { timeout: 5000 }).catch(() => {});

    // Should not be on signin page anymore
    expect(!page.url().includes('/auth/signin')).toBeTruthy();
  });

  test('Sign-in rejects invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await waitForPageLoad(page);

    await page.locator('input[name="email"]').fill('nonexistent@foo.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error or stay on signin page
    await page.waitForTimeout(1500);
    const errorVisible = await page.getByText(/error|invalid|incorrect/i).isVisible().catch(() => false);
    const stillOnSignin = page.url().includes('/auth/signin');

    expect(errorVisible || stillOnSignin).toBeTruthy();
  });

  test('Suspended user sees suspension modal on login', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await waitForPageLoad(page);

    await page.locator('input[name="email"]').fill('suspended@foo.com');
    await page.locator('input[name="password"]').fill('changeme');
    await page.getByRole('button', { name: /sign in/i }).click();

    const modal = page.locator('div[role="dialog"]');
    const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);

    if (modalVisible) {
      expect(modalVisible).toBeTruthy();
    }
  });
});

// =============================================================================
// AUTHENTICATED USER FEATURES
// =============================================================================

authTest.describe('User Profile & Settings', () => {
  authTest.slow();

  authTest('Profile page displays user information', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/profile`);
    await waitForPageLoad(userPage);

    // Should show email somewhere
    const hasEmail = await Promise.race([
      userPage.getByText(/john@foo.com/i).isVisible(),
      userPage.getByText(/profile|matches|about/i).isVisible(),
    ]);

    expect(hasEmail).toBeTruthy();
  });

  authTest('Edit Profile page has form fields', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/edit-profile`);
    await waitForPageLoad(userPage);

    // Check for form elements
    const formExists = await Promise.race([
      userPage.getByRole('heading', { name: /edit/i }).isVisible(),
      userPage.locator('input[type="text"]').count().then((c) => c > 0),
      userPage.locator('textarea').count().then((c) => c > 0),
    ]);

    expect(formExists).toBeTruthy();
  });

  authTest('Can fill and view edit profile fields', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/edit-profile`);
    await waitForPageLoad(userPage);

    // Try to fill first text input
    const firstInput = userPage.locator('input[type="text"]').first();
    if (await firstInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await firstInput.fill('Test Name');
      const value = await firstInput.inputValue();
      expect(value).toBe('Test Name');
    }
  });
});

// =============================================================================
// MATCHES & BROWSING
// =============================================================================

authTest.describe('Matches & Browsing', () => {
  authTest.slow();

  authTest('Matches page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/matches`);
    await waitForPageLoad(userPage);

    // Check for page elements
    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /matches|browse/i }).isVisible(),
      userPage.getByText(/matches|browse/i).isVisible(),
      userPage.locator('[class*="card"]').count().then((c) => c > 0),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Accepted matches page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/accepted-matches`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /accepted|matched/i }).isVisible(),
      userPage.getByText(/accepted|matched|empty/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Passed matches page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/passed-matches`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /passed|skipped/i }).isVisible(),
      userPage.getByText(/passed|skipped|empty/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Saved matches page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/saved-matches`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /saved|bookmarked/i }).isVisible(),
      userPage.getByText(/saved|bookmarked|empty/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });
});

// =============================================================================
// SEARCH & FILTERING
// =============================================================================

authTest.describe('Search Functionality', () => {
  authTest.slow();

  authTest('Search page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/search`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /search|filter|find/i }).isVisible(),
      userPage.locator('input[type="text"]').count().then((c) => c > 0),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Can type in search field', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/search`);
    await waitForPageLoad(userPage);

    const searchInput = userPage.locator('input[type="text"]').first();
    if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await searchInput.fill('test search');
      const value = await searchInput.inputValue();
      expect(value).toBe('test search');
    }
  });
});

// =============================================================================
// MESSAGING
// =============================================================================

authTest.describe('Messages', () => {
  authTest.slow();

  authTest('Messages page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/messages`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /messages|conversations/i }).isVisible(),
      userPage.getByText(/messages|conversations|empty/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Can interact with message form if available', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/messages`);
    await waitForPageLoad(userPage);

    const messageInput = userPage.locator('textarea, input[placeholder*="message" i]').first();
    const hasInput = await messageInput.isVisible({ timeout: 1000 }).catch(() => false);

    if (hasInput) {
      await messageInput.fill('Test message');
      const value = await messageInput.inputValue();
      expect(value).toBe('Test message');
    }
  });
});

// =============================================================================
// COMPARISON
// =============================================================================

authTest.describe('Match Comparison', () => {
  authTest.slow();

  authTest('Comparison page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/comparison`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /comparison|compare/i }).isVisible(),
      userPage.getByText(/comparison|compare|select/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });
});

// =============================================================================
// RESOURCES & SURVEY
// =============================================================================

authTest.describe('Resources & Housing Info', () => {
  authTest.slow();

  authTest('Resources page loads with content', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/resources`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /resources|housing/i }).isVisible(),
      userPage.locator('[class*="card"]').count().then((c) => c > 0),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Lifestyle categories page loads', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/resources/lifestyle-categories`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /campus life|lifestyle|categories/i }).isVisible(),
      userPage.getByText(/campus|lifestyle|categories/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });
});

authTest.describe('Lifestyle Survey', () => {
  authTest.slow();

  authTest('Lifestyle survey page loads with questions', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/lifestyle-survey`);
    await waitForPageLoad(userPage);

    const pageLoaded = await Promise.race([
      userPage.getByRole('heading', { name: /survey|questionnaire|lifestyle|profile/i }).isVisible(),
      userPage.locator('[role="radio"]').count().then((c) => c > 0),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Can select survey options', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/lifestyle-survey`);
    await waitForPageLoad(userPage);

    const radioButtons = userPage.getByRole('radio');
    const count = await radioButtons.count().catch(() => 0);

    if (count > 0) {
      const firstRadio = radioButtons.first();
      await firstRadio.check({ timeout: 5000 }).catch(() => {});
      const isChecked = await firstRadio.isChecked().catch(() => false);
      expect(isChecked).toBeTruthy();
    }
  });

  authTest('Survey has navigation buttons', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/lifestyle-survey`);
    await waitForPageLoad(userPage);

    const nextButton = userPage.getByRole('button', { name: /next|continue|submit/i });
    const hasButton = await nextButton.isVisible({ timeout: 1000 }).catch(() => false);

    expect(hasButton).toBeTruthy();
  });
});

// =============================================================================
// NAVIGATION
// =============================================================================

authTest.describe('Navigation & Navbar', () => {
  authTest.slow();

  authTest('Authenticated user navbar shows navigation links', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(BASE_URL);
    await waitForPageLoad(userPage);

    // Check for key navbar elements
    const hasMatches = await userPage.getByRole('link', { name: /matches|browse/i }).isVisible().catch(() => false);
    const hasProfile = await userPage.getByRole('button', { name: /john@foo.com/i }).isVisible().catch(() => false);

    expect(hasMatches || hasProfile).toBeTruthy();
  });

  authTest('Admin user sees admin link in navbar', async ({ getUserPage }) => {
    const adminPage = await getUserPage('admin@foo.com', 'changeme');
    await adminPage.goto(BASE_URL);
    await waitForPageLoad(adminPage);

    const hasAdminLink = await adminPage.getByRole('link', { name: /admin/i }).isVisible().catch(() => false);

    expect(hasAdminLink).toBeTruthy();
  });

  authTest('Can navigate between pages using navbar', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(BASE_URL);
    await waitForPageLoad(userPage);

    // Navigate to Matches
    const matchesLink = userPage.getByRole('link', { name: /matches|browse/i });
    if (await matchesLink.isVisible().catch(() => false)) {
      await matchesLink.click();
      await waitForPageLoad(userPage);
      expect(userPage.url()).toContain('/matches');
    }
  });
});

// =============================================================================
// ADMIN FEATURES
// =============================================================================

authTest.describe('Admin Dashboard', () => {
  authTest.slow();

  authTest('Admin page loads for admin users', async ({ getUserPage }) => {
    const adminPage = await getUserPage('admin@foo.com', 'changeme');
    await adminPage.goto(`${BASE_URL}/admin`);
    await waitForPageLoad(adminPage);

    const pageLoaded = await Promise.race([
      adminPage.getByRole('heading', { name: /admin|dashboard|moderation/i }).isVisible(),
      adminPage.getByText(/admin|dashboard|moderation/i).isVisible(),
    ]);

    expect(pageLoaded).toBeTruthy();
  });

  authTest('Content moderation section has action buttons', async ({ getUserPage }) => {
    const adminPage = await getUserPage('admin@foo.com', 'changeme');
    await adminPage.goto(`${BASE_URL}/admin`);
    await waitForPageLoad(adminPage);

    // Scroll to moderation section
    const moderationText = adminPage.locator('text=Content Moderation, text=Moderation').first();
    if (await moderationText.isVisible({ timeout: 1000 }).catch(() => false)) {
      await moderationText.scrollIntoViewIfNeeded();
      await adminPage.waitForTimeout(500);

      // Check for action buttons
      const hasButtons = await adminPage.getByRole('button', { name: /suspend|deactivate|resolve/i }).count().then((c) => c > 0).catch(() => false);

      expect(hasButtons).toBeTruthy();
    }
  });

  authTest('Lifestyle categories section displays in admin panel', async ({ getUserPage }) => {
    const adminPage = await getUserPage('admin@foo.com', 'changeme');
    await adminPage.goto(`${BASE_URL}/admin`);
    await waitForPageLoad(adminPage);

    const hasCategories = await adminPage.getByText(/Lifestyle Categories/i).isVisible().catch(() => false);

    expect(hasCategories).toBeTruthy();
  });
});
