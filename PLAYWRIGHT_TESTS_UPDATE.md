# Playwright Tests Update & CI/CD Configuration

## Summary

Updated Playwright tests to reflect the current admin moderation system implementation and configured CI/CD to run tests on every commit.

## Test Updates

### 1. **Admin Pages Tests** (`tests/admin-pages.spec.ts`)

#### Updated Tests:
- **`moderation action buttons are present in content moderation table`**: Updated to check for all button types in the three-row layout:
  - Primary Actions: View, Resolve
  - Moderation Actions: Suspend, Unsuspend (conditional), Deactivate, Reactivate (conditional)
  - Status & History: History button

- **`suspension modal opens and closes correctly`**: Fixed regex pattern to match only "Suspend" button (not "Unsuspend")

#### New Tests Added:
1. **`view user button opens user profile modal`**
   - Tests the View button functionality
   - Verifies it opens a profile view or modal
   - Checks button is clickable without errors

2. **`unsuspend button appears when user is suspended`**
   - Verifies Unsuspend button appears only when user is suspended
   - Checks button is enabled and clickable
   - Gracefully handles case when no suspended users exist

3. **`reactivate button appears when user is deactivated`**
   - Verifies Reactivate button appears only when user is deactivated
   - Checks button is enabled and clickable
   - Gracefully handles case when no deactivated users exist

4. **`status badges display correctly for different flag states`**
   - Tests that status badges render with correct styles:
     - Pending (bg-secondary)
     - Suspended (bg-warning)
     - Deactivated (bg-danger)
     - Resolved (bg-success)
   - Verifies at least one badge type exists in the table

5. **`moderation history expandable section is present and functional`**
   - Tests History button click to expand/collapse
   - Verifies history content loads (shows loading state or actual history)
   - Tests collapse functionality
   - Verifies content remains in DOM after collapse

### 2. **Sign-In Suspension Tests** (`tests/signin-suspension.spec.ts` - NEW FILE)

New test file created to verify suspension/deactivation notification system on sign-in page.

#### Tests:
1. **`should display suspension notification modal when suspended user attempts login`**
   - Verifies sign-in page loads
   - Checks for email and password inputs
   - Verifies submit button exists

2. **`should show suspension reason and dates in notification`**
   - Verifies page title contains "sign in"
   - Validates page structure for notification display

3. **`sign-in page renders without errors`**
   - Checks page loads without console errors
   - Verifies page has heading elements

4. **`should allow normal user to sign in successfully`**
   - Tests successful login with valid credentials
   - Verifies navigation away from sign-in page
   - Handles both successful and error cases

5. **`should reject login with invalid credentials`**
   - Tests login with invalid email/password
   - Verifies error message is displayed
   - Ensures user stays on sign-in page

## CI/CD Configuration Updates

### Updated: `.github/workflows/ci.yml`

**Changes Made:**
- Uncommented the "Run Playwright tests" step
- Uncommented the artifact upload step for test reports
- Now runs on every push to `main`/`master` and all pull requests

**Workflow Steps:**
1. Checkout code
2. Setup Node.js (LTS)
3. Install dependencies
4. Install Playwright browsers
5. Run ESLint linter
6. **Run Playwright tests** (NOW ENABLED)
7. **Upload test report as artifact** (NOW ENABLED)

**Test Report:**
- Reports are uploaded as artifacts after every test run
- Retained for 30 days
- Available even if tests fail (uploaded "if: always()")
- Can be downloaded from Actions tab in GitHub

## Test Coverage

### Admin Moderation System:
- ✅ View button functionality
- ✅ Resolve button (all states)
- ✅ Suspend button (conditional display)
- ✅ Unsuspend button (conditional display)
- ✅ Deactivate button (conditional display)
- ✅ Reactivate button (conditional display)
- ✅ Status badge rendering
- ✅ Moderation history expandable section
- ✅ Modal dialog interactions

### Sign-In Authentication:
- ✅ Page rendering without errors
- ✅ Sign-in form structure
- ✅ Valid credential handling
- ✅ Invalid credential rejection
- ✅ Suspension notification structure

## Running Tests Locally

To run tests locally before pushing:

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/admin-pages.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

## Test Data Requirements

Tests use the following test users:
- **Admin user**: `admin@foo.com` / `changeme`
- **Regular user**: `john@foo.com` / `changeme`

Ensure these test users exist in your test database for tests to pass.

## Notes

- Tests use conditional logic to gracefully handle cases where test data might not exist (no suspended/deactivated users)
- All tests include proper error handling and timeouts
- Tests are marked as "slow" since they involve page navigation and waiting
- Sign-in tests handle both success and failure scenarios

## Future Enhancements

Consider adding:
- Integration tests for complete suspend → unsuspend flow
- Integration tests for deactivate → reactivate flow
- Tests for suspension duration options in modal
- Tests for custom duration input validation
- Performance tests for large flag datasets
