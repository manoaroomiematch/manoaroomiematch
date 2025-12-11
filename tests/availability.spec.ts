import { test, expect, Page } from '@playwright/test';
import { test as authTest } from './auth-utils';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Helper function to wait for page load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

// =============================================================================
// PUBLIC PAGES (No authentication required)
// =============================================================================

test.describe('Public Pages Availability', () => {
  test('Landing page loads and displays correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForPageLoad(page);

    // Check that the landing page displays correctly
    await expect(page.getByRole('heading', { name: /Find the Perfect Roommate/i })).toBeVisible();
    await expect(page.getByText(/Connecting students in Mānoa/i)).toBeVisible();

    // Check for CTA button (using first to avoid strict mode violation)
    await expect(page.getByRole('button', { name: /Start Matching/i }).first()).toBeVisible();

    // Check for key features section
    await expect(page.getByText(/What is Mānoa RoomieMatch/i)).toBeVisible();
    await expect(page.getByText(/Key Features/i)).toBeVisible();
  });

  test('Sign In page loads and form operates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await waitForPageLoad(page);

    // Check for sign in form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Test form with valid inputs
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('testpassword123');

    // Verify inputs are filled
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[name="password"]')).toHaveValue('testpassword123');
  });

  test('Sign Up page loads and form operates correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    await waitForPageLoad(page);

    // Check for sign up form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();

    // Test form with valid inputs
    await page.locator('input[name="email"]').fill('newuser@hawaii.edu');
    await page.locator('input[name="password"]').fill('SecurePassword123!');

    // Verify inputs are filled
    await expect(page.locator('input[name="email"]')).toHaveValue('newuser@hawaii.edu');
    await expect(page.locator('input[name="password"]')).toHaveValue('SecurePassword123!');
  });

  test('Not Found page displays correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    await waitForPageLoad(page);

    // Check for 404 message
    await expect(page.getByText(/Page not found/i)).toBeVisible();
  });

  test('Not Authorized page displays correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/not-authorized`);
    await waitForPageLoad(page);

    // Check for not authorized message
    await expect(page.getByText(/Not Authorized/i)).toBeVisible();
  });
});

// =============================================================================
// AUTHENTICATED USER PAGES
// =============================================================================

authTest.describe('Authenticated User Pages Availability', () => {
  authTest.slow();

  authTest('Profile page loads and displays user information', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/profile`);
    await waitForPageLoad(userPage);

    // Check for profile elements (using first to avoid strict mode with navbar dropdown)
    await expect(userPage.locator('p:has-text("john@foo.com")')).toBeVisible();

    // Check for profile sections - these might be headings or text
    const profileLoaded = await Promise.race([
      userPage.getByText(/about me/i).isVisible().catch(() => false),
      userPage.getByText(/profile/i).isVisible().catch(() => false),
      userPage.getByText(/matches/i).isVisible().catch(() => false),
    ]);
    expect(profileLoaded).toBeTruthy();
  });

  authTest('Edit Profile page loads and form operates correctly', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/edit-profile`);
    await waitForPageLoad(userPage);

    // Check for edit profile form (use heading role to be specific)
    await expect(userPage.getByRole('heading', { name: /edit profile/i })).toBeVisible();

    // Test form inputs with legal values
    const nameInput = userPage.getByLabel(/name|first name/i).first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('John Doe');
      await expect(nameInput).toHaveValue('John Doe');
    }

    const bioInput = userPage.getByLabel(/bio|about/i).first();
    if (await bioInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bioInput.fill('I am a computer science student looking for a roommate.');
      await expect(bioInput).toHaveValue('I am a computer science student looking for a roommate.');
    }
  });

  authTest('Lifestyle Survey page loads and form operates correctly', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/lifestyle-survey`);
    await waitForPageLoad(userPage);

    // Check for survey elements (use heading role to be specific)
    await expect(userPage.getByRole('heading', { name: /Profile Setup/i })).toBeVisible();

    // Check for survey question - should be on first step (Sleep Schedule)
    await expect(userPage.getByText(/What is your sleep schedule/i)).toBeVisible();

    // Test radio button selection
    const radioButtons = userPage.getByRole('radio');
    const firstRadio = radioButtons.first();
    if (await firstRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstRadio.check();
      await expect(firstRadio).toBeChecked();
    }

    // Check for navigation buttons
    await expect(userPage.getByRole('button', { name: /next|complete|submit/i })).toBeVisible();
  });

  authTest('Matches/Browse page loads and displays matches', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/matches`);
    await waitForPageLoad(userPage);

    // Check for matches page heading
    await expect(userPage.getByRole('heading', { name: /Browse Matches/i })).toBeVisible();

    // Check for view toggle buttons (grid/list view)
    await expect(userPage.getByRole('button', { name: /Grid/i })).toBeVisible();
    await expect(userPage.getByRole('button', { name: /List/i })).toBeVisible();
  });

  authTest('Messages page loads and displays conversations', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/messages`);
    await waitForPageLoad(userPage);

    // Check for messages page elements
    await expect(userPage.getByText(/messages|conversations/i)).toBeVisible();

    // Check for message input form (but don't try to fill if disabled)
    const messageInput = userPage.getByPlaceholder(/type.*message|write.*message/i);
    if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isEnabled = await messageInput.isEnabled().catch(() => false);
      if (isEnabled) {
        await messageInput.fill('Hello, this is a test message!');
        await expect(messageInput).toHaveValue('Hello, this is a test message!');
      }
    }
  });

  authTest('Home page loads for authenticated users', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/home`);
    await waitForPageLoad(userPage);

    // Check for home page elements - user profile overview and matches
    await expect(userPage.getByRole('heading', { name: /Your Matches/i })).toBeVisible();
  });

  authTest('Resources page loads and displays housing resources', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/resources`);
    await waitForPageLoad(userPage);

    // Check for resources page elements (use heading to be specific)
    await expect(userPage.getByRole('heading', { name: /Housing Resources/i })).toBeVisible();

    // Check for resource links/headings
    await expect(userPage.getByRole('heading', { name: /UH Student Housing/i })).toBeVisible();
  });

  authTest('Change Password page loads and form operates correctly', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/auth/change-password`);
    await waitForPageLoad(userPage);

    // Check for change password form
    await expect(userPage.getByText(/change password/i)).toBeVisible();

    // Test form inputs with legal values
    const oldPasswordInput = userPage.getByLabel(/old password|current password/i);
    if (await oldPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await oldPasswordInput.fill('changeme');
      await expect(oldPasswordInput).toHaveValue('changeme');
    }

    const newPasswordInput = userPage.getByLabel(/new password/i).first();
    if (await newPasswordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newPasswordInput.fill('NewSecurePassword123!');
      await expect(newPasswordInput).toHaveValue('NewSecurePassword123!');
    }
  });
});

// =============================================================================
// ADMIN PAGES
// =============================================================================

authTest.describe('Admin Pages Availability', () => {
  // Admin pages tests would go here
});

// =============================================================================
// NAVIGATION TESTS
// =============================================================================

authTest.describe('Navigation Availability', () => {
  authTest.slow();

  authTest('Navbar displays all navigation links for authenticated users', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(BASE_URL);
    await waitForPageLoad(userPage);

    // Check for main navigation links
    await expect(userPage.getByRole('link', { name: /matches|browse/i })).toBeVisible();
    await expect(userPage.getByRole('link', { name: /lifestyle survey/i })).toBeVisible();
    await expect(userPage.getByRole('link', { name: /resources/i })).toBeVisible();
    await expect(userPage.getByRole('link', { name: 'My Profile' })).toBeVisible();

    // Check for user dropdown
    await expect(userPage.getByRole('button', { name: /john@foo.com/i })).toBeVisible();
  });

  authTest('Navbar displays admin link for admin users', async ({ getUserPage }) => {
    const adminPage = await getUserPage('admin@foo.com', 'changeme');
    await adminPage.goto(BASE_URL);
    await waitForPageLoad(adminPage);

    // Check for admin link
    await expect(adminPage.getByRole('link', { name: /admin/i })).toBeVisible();
  });

  authTest('User can navigate between pages using navbar', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(BASE_URL);
    await waitForPageLoad(userPage);

    // Navigate to Matches
    await userPage.getByRole('link', { name: /matches|browse/i }).click();
    await waitForPageLoad(userPage);
    expect(userPage.url()).toContain('/matches');

    // Navigate to Profile (use exact name to avoid matching "Edit Profile")
    await userPage.getByRole('link', { name: 'My Profile' }).click();
    await waitForPageLoad(userPage);
    expect(userPage.url()).toContain('/profile');

    // Navigate to Resources
    await userPage.getByRole('link', { name: /resources/i }).click();
    await waitForPageLoad(userPage);
    expect(userPage.url()).toContain('/resources');
  });
});

// =============================================================================
// FORM VALIDATION TESTS
// =============================================================================

test.describe('Form Validation with Legal Inputs', () => {
  test('Sign in form accepts valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await waitForPageLoad(page);

    // Fill form with valid data
    await page.locator('input[name="email"]').fill('valid.user@hawaii.edu');
    await page.locator('input[name="password"]').fill('ValidPassword123!');

    // Check that inputs accept the values
    await expect(page.locator('input[name="email"]')).toHaveValue('valid.user@hawaii.edu');
    await expect(page.locator('input[name="password"]')).toHaveValue('ValidPassword123!');

    // Check that submit button is enabled
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeEnabled();
  });

  test('Sign up form accepts valid registration data', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    await waitForPageLoad(page);

    // Fill form with valid data
    await page.locator('input[name="email"]').fill('newstudent@hawaii.edu');
    await page.locator('input[name="password"]').fill('SecurePass123!');

    // Check that inputs accept the values
    await expect(page.locator('input[name="email"]')).toHaveValue('newstudent@hawaii.edu');
    await expect(page.locator('input[name="password"]')).toHaveValue('SecurePass123!');

    // Check that submit button is enabled
    const submitButton = page.getByRole('button', { name: /create account/i });
    await expect(submitButton).toBeEnabled();
  });
});

authTest.describe('Authenticated Form Validation', () => {
  authTest.slow();

  authTest('Edit profile form accepts valid profile data', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/edit-profile`);
    await waitForPageLoad(userPage);

    // Test various profile fields with valid data - test individually to avoid loop
    const nameInput = userPage.getByLabel(/first name|name/i).first();
    if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nameInput.fill('John');
      await expect(nameInput).toHaveValue('John');
    }

    const lastNameInput = userPage.getByLabel(/last name/i).first();
    if (await lastNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe');
    }

    const majorInput = userPage.getByLabel(/major|field of study/i).first();
    if (await majorInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await majorInput.fill('Computer Science');
      await expect(majorInput).toHaveValue('Computer Science');
    }

    const hometownInput = userPage.getByLabel(/hometown/i).first();
    if (await hometownInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await hometownInput.fill('Honolulu, HI');
      await expect(hometownInput).toHaveValue('Honolulu, HI');
    }

    const bioInput = userPage.getByLabel(/bio/i).first();
    if (await bioInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await bioInput.fill('Looking for a compatible roommate for the fall semester.');
      await expect(bioInput).toHaveValue('Looking for a compatible roommate for the fall semester.');
    }
  });

  authTest('Lifestyle survey form accepts valid responses', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/lifestyle-survey`);
    await waitForPageLoad(userPage);

    // Select first available option
    const firstRadio = userPage.getByRole('radio').first();
    if (await firstRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstRadio.check();
      await expect(firstRadio).toBeChecked();

      // Try to click Next button
      const nextButton = userPage.getByRole('button', { name: /next/i });
      if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(nextButton).toBeEnabled();
      }
    }
  });

  authTest('Message form accepts valid message text', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');
    await userPage.goto(`${BASE_URL}/messages`);
    await waitForPageLoad(userPage);

    // Test message input (only if enabled)
    const messageInput = userPage.getByPlaceholder(/type.*message|write.*message/i);
    if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isEnabled = await messageInput.isEnabled().catch(() => false);
      if (isEnabled) {
        const testMessage = 'Hi! I would like to discuss potential roommate arrangements.';
        await messageInput.fill(testMessage);
        await expect(messageInput).toHaveValue(testMessage);

        // Check if send button is enabled
        const sendButton = userPage.getByRole('button', { name: /send/i });
        if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(sendButton).toBeEnabled();
        }
      }
    }
  });
});
