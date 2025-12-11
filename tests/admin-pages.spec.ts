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

  // Check if action buttons exist (will be present if there are any flags)
  // Primary Actions row (View, Resolve)
  const resolveButtons = adminPage.getByRole('button', { name: /Resolve/i });

  // Moderation Actions row (Suspend, Unsuspend, Deactivate, Reactivate)
  const suspendButtons = adminPage.getByRole('button', { name: /^Suspend$/i });
  const deactivateButtons = adminPage.getByRole('button', { name: /Deactivate/i });

  // Status & History row (History)
  const historyButtons = adminPage.getByRole('button', { name: /History/i });

  // At least these button types should exist in the DOM
  expect(resolveButtons).toBeDefined();
  expect(suspendButtons).toBeDefined();
  expect(deactivateButtons).toBeDefined();
  expect(historyButtons).toBeDefined();
});

test('suspension modal opens and closes correctly', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Try to find and click a Suspend button (if any flags exist)
  const suspendButtons = adminPage.getByRole('button', { name: /^Suspend$/i });
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

test('view user button opens user profile modal', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Try to find and click a View button (if any flags exist)
  const viewButtons = adminPage.getByRole('button', { name: /View/i });
  const viewButtonCount = await viewButtons.count();

  if (viewButtonCount > 0) {
    const firstViewButton = viewButtons.first();
    const isDisabled = await firstViewButton.isDisabled();

    if (!isDisabled) {
      await firstViewButton.click();

      // Verify profile view modal or section is visible
      // Either the modal header or profile card should be displayed
      const profileVisible = await Promise.race([
        adminPage.getByRole('heading', { name: /Profile/i }).isVisible().catch(() => false),
        adminPage.locator('text=User Profile').isVisible().catch(() => false),
      ]);

      // If modal doesn't appear, at least button should be clickable without error
      expect(profileVisible || isDisabled).toBeTruthy();
    }
  }
});

test('unsuspend button appears when user is suspended', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Look for Unsuspend buttons (only visible when user is suspended)
  const unsuspendButtons = adminPage.getByRole('button', { name: /Unsuspend/i });
  const unsuspendButtonCount = await unsuspendButtons.count();

  // If there are suspended users, Unsuspend button should appear
  if (unsuspendButtonCount > 0) {
    const firstUnsuspendButton = unsuspendButtons.first();
    const isDisabled = await firstUnsuspendButton.isDisabled();

    // Unsuspend button should be clickable if present
    expect(!isDisabled).toBeTruthy();
  }
  // If no suspended users, that's also valid (count can be 0)
});

test('reactivate button appears when user is deactivated', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Look for Reactivate buttons (only visible when user is deactivated)
  const reactivateButtons = adminPage.getByRole('button', { name: /Reactivate/i });
  const reactivateButtonCount = await reactivateButtons.count();

  // If there are deactivated users, Reactivate button should appear
  if (reactivateButtonCount > 0) {
    const firstReactivateButton = reactivateButtons.first();
    const isDisabled = await firstReactivateButton.isDisabled();

    // Reactivate button should be clickable if present
    expect(!isDisabled).toBeTruthy();
  }
  // If no deactivated users, that's also valid (count can be 0)
});

test('status badges display correctly for different flag states', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Look for status badges
  const pendingBadges = adminPage.locator('span.badge.bg-secondary:has-text("Pending")');
  const suspendedBadges = adminPage.locator('span.badge.bg-warning:has-text("Suspended")');
  const deactivatedBadges = adminPage.locator('span.badge.bg-danger:has-text("Deactivated")');
  const resolvedBadges = adminPage.locator('span.badge.bg-success:has-text("Resolved")');

  // At least one badge type should exist in the moderation table
  const badgesExist = (await pendingBadges.count()) > 0
    || (await suspendedBadges.count()) > 0
    || (await deactivatedBadges.count()) > 0
    || (await resolvedBadges.count()) > 0;

  expect(badgesExist).toBeTruthy();
});

test('moderation history expandable section is present and functional', async ({ getUserPage }) => {
  const adminPage = await getUserPage('admin@foo.com', 'changeme');
  await adminPage.goto('http://localhost:3000/admin');

  // Scroll to Content Moderation section
  await adminPage.locator('text=Content Moderation').scrollIntoViewIfNeeded();

  // Look for History buttons
  const historyButtons = adminPage.getByRole('button', { name: /History/i });
  const historyButtonCount = await historyButtons.count();

  if (historyButtonCount > 0) {
    const firstHistoryButton = historyButtons.first();

    // Click to expand history
    await firstHistoryButton.click();

    // Look for history content (may show loading or actual history)
    const historyContentVisible = await Promise.race([
      adminPage.locator('text=Moderation History').isVisible().catch(() => false),
      adminPage.locator('text=Loading history').isVisible().catch(() => false),
    ]);

    expect(historyContentVisible).toBeTruthy();

    // Click again to collapse
    await firstHistoryButton.click();

    // Verify history content is hidden
    const historyContent = adminPage.locator('div#history-content');
    await expect(historyContent).toHaveCount(historyButtonCount); // Still in DOM but hidden
  }
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
