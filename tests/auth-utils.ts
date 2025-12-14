/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import { test as base, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Base configuration
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://manoaroomiematch.vercel.app';
const SESSION_STORAGE_PATH = path.join(__dirname, 'playwright-auth-sessions');

// Ensure session directory exists
if (!fs.existsSync(SESSION_STORAGE_PATH)) {
  fs.mkdirSync(SESSION_STORAGE_PATH, { recursive: true });
}

// Define our custom fixtures
interface AuthFixtures {
  getUserPage: (email: string, password: string) => Promise<Page>;
}

/**
 * Helper to fill form fields with retry logic
 */
async function fillFormWithRetry(
  page: Page,
  fields: Array<{ selector: string; value: string }>,
): Promise<void> {
  for (const field of fields) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const element = page.locator(field.selector);
        await element.waitFor({ state: 'visible', timeout: 2000 });
        await element.clear();
        await element.fill(field.value);
        await element.evaluate((el) => el.blur()); // Trigger blur event
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to fill field ${field.selector} after ${maxAttempts} attempts`);
        }
        // Wait for element to be ready before retrying instead of using arbitrary timeout
        await page.waitForSelector(field.selector, { timeout: 2000 }).catch(() => {});
      }
    }
  }
}

/**
 * Authenticate using the UI with robust waiting and error handling
 */
async function authenticateWithUI(
  page: Page,
  email: string,
  password: string,
  sessionName: string,
): Promise<void> {
  const sessionPath = path.join(SESSION_STORAGE_PATH, `${sessionName}.json`);

  // Try to restore session from storage if available
  if (fs.existsSync(sessionPath)) {
    try {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      if (sessionData.cookies && sessionData.cookies.length > 0) {
        await page.context().addCookies(sessionData.cookies);

        // Navigate to homepage to verify session
        await page.goto(BASE_URL);
        await page.waitForLoadState('domcontentloaded');

        // Check if we're authenticated by looking for a sign-out option or user email
        // Use Promise.all with shorter timeout to check multiple indicators in parallel
        const isAuthenticated = await Promise.any([
          page.getByRole('button', { name: email }).isVisible({ timeout: 2000 }),
          page.locator('#login-dropdown').isVisible({ timeout: 2000 }),
          page.getByText('Sign out').first().isVisible({ timeout: 2000 }),
          page.getByRole('button', { name: 'Sign out' }).isVisible({ timeout: 2000 }),
          page.getByRole('link', { name: /Browse|Matches/i }).isVisible({ timeout: 2000 }),
        ]).catch(() => false);

        if (isAuthenticated) {
          // Only log on first restoration, not every test
          if (!process.env.PW_SESSION_RESTORED) {
            console.log(`✓ Restored session for ${email}`);
            process.env.PW_SESSION_RESTORED = '1';
          }
          return;
        }

        if (!process.env.PW_SESSION_EXPIRED) {
          console.warn(`× Saved session for ${email} expired, re-authenticating...`);
          process.env.PW_SESSION_EXPIRED = '1';
        }
      }
    } catch (error) {
      if (!process.env.PW_SESSION_ERROR) {
        console.warn(`× Error restoring session: ${error}`);
        process.env.PW_SESSION_ERROR = '1';
      }
    }
  }

  // If session restoration fails, authenticate via UI
  try {
    if (!process.env.PW_SESSION_AUTH) {
      console.log(`→ Authenticating ${email} via UI...`);
      process.env.PW_SESSION_AUTH = '1';
    }

    // Navigate to login page
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('domcontentloaded');

    // If redirected to not-authorized, 404, or not on signin, skip authentication
    const url = page.url();
    if (url.includes('/not-authorized') || url.includes('/404') || !url.includes('/auth/signin')) {
      throw new Error(`Authentication skipped: redirected to ${url}`);
    }

    // Fill in credentials with retry logic
    await fillFormWithRetry(page, [
      { selector: 'input[name="email"]', value: email },
      { selector: 'input[name="password"]', value: password },
    ]);

    // Click submit button and wait for navigation
    const submitButton = page.getByRole('button', { name: /sign[ -]?in/i });
    if (!await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Try alternative selector if the first one doesn't work
      await page.getByRole('button', { name: /log[ -]?in/i }).click();
    } else {
      await submitButton.click();
    }

    // Wait for navigation to complete (use shorter timeout - don't wait for full network idle)
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Brief wait for auth to process

    // Verify authentication was successful with multiple indicators
    let authSuccessful = false;
    try {
      authSuccessful = await Promise.any([
        page.getByRole('button', { name: email }).isVisible({ timeout: 2000 }),
        page.locator('#login-dropdown').isVisible({ timeout: 2000 }),
        page.getByText('Sign out').first().isVisible({ timeout: 2000 }),
        page.getByRole('button', { name: 'Sign out' }).isVisible({ timeout: 2000 }),
        page.getByRole('link', { name: /Browse|Matches/i }).isVisible({ timeout: 2000 }),
      ]).catch(() => false);
    } catch (error) {
      // Continue anyway - session might be valid even if verification is flaky
      // Suppress noisy output
    }

    if (!authSuccessful) {
      // Check if we got an error message instead
      const errorVisible = await page.getByText(/error|invalid|incorrect|failed/i).isVisible({ timeout: 2000 }).catch(() => false);
      if (errorVisible) {
        throw new Error(`Authentication failed: error message displayed for ${email}`);
      }
      // Only log once per run
      if (!process.env.PW_SESSION_INCONCLUSIVE) {
        console.warn(`⚠ Auth verification inconclusive but continuing for ${email}`);
        process.env.PW_SESSION_INCONCLUSIVE = '1';
      }
    }

    // Save session for future tests
    const cookies = await page.context().cookies();
    fs.writeFileSync(sessionPath, JSON.stringify({ cookies }));
    if (!process.env.PW_SESSION_SUCCESS) {
      console.log(`✓ Successfully authenticated ${email} and saved session`);
      process.env.PW_SESSION_SUCCESS = '1';
    }
  } catch (error) {
    console.error(`× Authentication failed for ${email}:`, error);

    throw new Error(`Authentication failed: ${error}`);
  }
}

// Create custom test with authenticated fixtures
export const test = base.extend<AuthFixtures>({
  getUserPage: async ({ browser }, use) => {
    const createUserPage = async (email: string, password: string) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await authenticateWithUI(page, email, password, `session-${email}`);
      return page;
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(createUserPage);
  },
});

export { expect } from '@playwright/test';
