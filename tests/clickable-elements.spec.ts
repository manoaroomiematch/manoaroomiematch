import { test, expect } from './auth-utils';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3000';
const HOME_PAGE = new RegExp(`^${BASE_URL}/?$`);
const RUN_CLICKABLE_NAV_TESTS = process.env.RUN_CLICKABLE_NAV_TESTS === 'true';

const clickableSuite = RUN_CLICKABLE_NAV_TESTS ? test.describe : test.describe.skip;

clickableSuite('Clickable elements navigation', () => {
  test('Guest call-to-action buttons and auth links route correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Start Matching' }).first().click();
    await expect(page).toHaveURL(/\/auth\/signin/);

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Start Matching Now' }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);

    await page.getByRole('link', { name: /Manoa RoomieMatch/i }).click();
    await expect(page).toHaveURL(HOME_PAGE);

    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('#login-dropdown-sign-in').click();
    await expect(page).toHaveURL(/\/auth\/signin/);

    await page.getByRole('link', { name: /Manoa RoomieMatch/i }).click();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.locator('#login-dropdown-sign-up').click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('Authenticated user navbar links navigate to the correct pages', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');

    await userPage.goto(BASE_URL);
    await userPage.waitForLoadState('networkidle');

    await userPage.locator('#browse-matches-nav').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(/\/matches/);

    await userPage.locator('#lifestyle-survey-nav').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(/\/lifestyle-survey/);

    await userPage.locator('#resources-nav').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(/\/resources/);

    await userPage.getByRole('link', { name: /Manoa RoomieMatch/i }).click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(HOME_PAGE);

    await userPage.locator('#profile-nav').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(/\/profile/);

    await userPage.locator('#edit-profile-nav').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(/\/edit-profile/);

    await userPage.locator('#messages-nav').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage).toHaveURL(/\/messages/);
  });

  test('User dropdown actions function as navigational controls', async ({ getUserPage }) => {
    const userPage = await getUserPage('john@foo.com', 'changeme');

    await userPage.goto(BASE_URL);
    await userPage.waitForLoadState('networkidle');

    await userPage.getByRole('button', { name: /john@foo.com/i }).click();
    await userPage.locator('#login-dropdown-edit-profile').click();
    await expect(userPage).toHaveURL(/\/edit-profile/);

    await userPage.getByRole('button', { name: /john@foo.com/i }).click();
    await userPage.locator('#login-dropdown-change-password').click();
    await expect(userPage).toHaveURL(/\/auth\/change-password/);

    await userPage.getByRole('button', { name: /john@foo.com/i }).click();
    await userPage.locator('#login-dropdown-sign-out').click();
    await userPage.waitForLoadState('networkidle');
    await expect(userPage.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('Admin navigation links and sidebar buttons open destinations and modals', async ({ getUserPage }) => {
    const adminPage = await getUserPage('admin@foo.com', 'changeme');

    await adminPage.goto(`${BASE_URL}/admin`);
    await adminPage.waitForLoadState('networkidle');

    await adminPage.locator('#admin-dashboard-nav').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/admin/);

    await adminPage.getByRole('link', { name: /Manoa RoomieMatch/i }).click();
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/admin/);

    await adminPage.locator('#resources-nav').click();
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage).toHaveURL(/\/resources/);

    await adminPage.goto(`${BASE_URL}/admin`);
    await adminPage.waitForLoadState('networkidle');

    await adminPage.getByRole('button', { name: /Change Theme/i }).click();
    await expect(adminPage.getByText(/Choose Background Color/i)).toBeVisible();
    await adminPage.getByRole('button', { name: /Close/i }).click();

    await adminPage.getByRole('button', { name: /Edit Profile/i }).first().click();
    await expect(adminPage.getByRole('heading', { name: /Edit Profile/i })).toBeVisible();
    await adminPage.getByRole('button', { name: /Cancel/i }).click();
  });
});
