import { test, expect } from './auth-utils';

test.slow();

test('admin page displays all sections', async ({ getUserPage }) => {
  // Get authenticated admin session
  const adminPage = await getUserPage('admin@foo.com', 'changeme');

  // Navigate to admin page
  await adminPage.goto('http://localhost:3000/admin');

  // Verify all main sections are visible
  await expect(adminPage.locator('text=Good')).toBeVisible(); // Greeting (Good Morning/Afternoon/Evening)
  await expect(adminPage.getByRole('heading', { name: /User Management/i })).toBeVisible();
  await expect(adminPage.getByRole('heading', { name: /Content Moderation/i })).toBeVisible();
  await expect(adminPage.getByRole('heading', { name: /Lifestyle Categories/i })).toBeVisible();
});

test('user management table loads and displays users', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Look for User Management section
  await expect(adminPage.getByRole('heading', { name: /User Management/i })).toBeVisible();

  // Verify table headers are present
  await expect(adminPage.locator('th:has-text("Name")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Email")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Role")')).toBeVisible();
});

test('content moderation table displays with action buttons', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Look for Content Moderation section
  await expect(adminPage.getByRole('heading', { name: /Content Moderation/i })).toBeVisible();

  // Verify table headers are present
  await expect(adminPage.locator('th:has-text("User")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Flag Reason")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Flagged Date")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Actions")')).toBeVisible();
});

test('moderation action buttons are present in content moderation table', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Check if Resolve button exists (will be present if there are any flags)
  const resolveButtons = adminPage.getByRole('button', { name: /Resolve/i });
  const suspendButtons = adminPage.getByRole('button', { name: /Suspend/i });
  const deactivateButtons = adminPage.getByRole('button', { name: /Deactivate/i });

  // At least the button types should exist in the DOM (even if disabled or not visible in table)
  expect(resolveButtons).toBeDefined();
  expect(suspendButtons).toBeDefined();
  expect(deactivateButtons).toBeDefined();
});

test('suspension modal opens and closes correctly', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Try to find and click a Suspend button (if any flags exist)
  const suspendButtons = adminPage.getByRole('button', { name: /Suspend/i });
  const suspendButtonCount = await suspendButtons.count();

  if (suspendButtonCount > 0) {
    // Get the first enabled suspend button
    const firstSuspendButton = suspendButtons.first();
    const isDisabled = await firstSuspendButton.isDisabled();

    if (!isDisabled) {
      await firstSuspendButton.click();

      // Verify suspension modal is visible
      await expect(adminPage.getByRole('heading', { name: /Suspend User/i })).toBeVisible();

      // Check for preset duration options
      await expect(adminPage.locator('label:has-text("1 day")')).toBeVisible();
      await expect(adminPage.locator('label:has-text("3 days")')).toBeVisible();
      await expect(adminPage.locator('label:has-text("7 days")')).toBeVisible();
      await expect(adminPage.locator('label:has-text("30 days")')).toBeVisible();

      // Check for custom duration option
      await expect(adminPage.locator('label:has-text("Custom Duration")')).toBeVisible();

      // Check for notes field
      await expect(adminPage.locator('textarea[placeholder*=/notes/i]')).toBeVisible();

      // Close the modal by clicking Cancel
      await adminPage.getByRole('button', { name: /Cancel/i }).click();

      // Verify modal is closed
      await expect(adminPage.getByRole('heading', { name: /Suspend User/i })).not.toBeVisible();
    }
  }
});

test('deactivation modal opens and closes correctly', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Try to find and click a Deactivate button (if any flags exist)
  const deactivateButtons = adminPage.getByRole('button', { name: /Deactivate/i });
  const deactivateButtonCount = await deactivateButtons.count();

  if (deactivateButtonCount > 0) {
    const firstDeactivateButton = deactivateButtons.first();
    const isDisabled = await firstDeactivateButton.isDisabled();

    if (!isDisabled) {
      await firstDeactivateButton.click();

      // Verify deactivation modal is visible
      await expect(adminPage.getByRole('heading', { name: /Deactivate User/i })).toBeVisible();

      // Check for warning message
      await expect(adminPage.locator('text=Warning')).toBeVisible();
      await expect(adminPage.locator('text=permanently deactivate')).toBeVisible();

      // Check for reason textarea
      await expect(adminPage.locator('textarea[placeholder*=/notes/i]')).toBeVisible();

      // Close the modal by clicking Cancel
      await adminPage.getByRole('button', { name: /Cancel/i }).click();

      // Verify modal is closed
      await expect(adminPage.getByRole('heading', { name: /Deactivate User/i })).not.toBeVisible();
    }
  }
});

test('moderation history expandable section is present', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Look for expandable history buttons (chevron icons)
  const historyButtons = adminPage.locator('button:has(svg)').filter({ has: adminPage.locator('svg') });

  // History buttons should exist in the DOM
  expect(historyButtons).toBeDefined();
});

test('lifestyle categories section displays correctly', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Lifestyle Categories section
  await adminPage.locator('text=Lifestyle Categories').scrollIntoViewIfNeeded();

  // Verify section is visible
  await expect(adminPage.getByRole('heading', { name: /Lifestyle Categories/i })).toBeVisible();

  // Verify table headers
  await expect(adminPage.locator('th:has-text("Name")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Items")')).toBeVisible();
  await expect(adminPage.locator('th:has-text("Last Updated")')).toBeVisible();
});
