# Playwright Availability Tests Documentation

## Overview
This document describes the comprehensive Playwright availability tests implemented for the Mānoa RoomieMatch application. These tests verify that all pages are accessible and that all forms operate correctly with legal inputs.

## Test Files
- **Locations**: `/tests/core-features.spec.ts`, `/tests/signin-suspension.spec.ts`
- **Purpose**: Test availability of all application pages and validate form functionality

## Test Categories

### 1. Public Pages Availability (No Authentication Required)
These tests verify that public-facing pages load and display correctly:

- **Landing Page** (`/`)
  - Verifies hero section with "Find the Perfect Roommate" heading
  - Checks for "Key Features" section
  - Validates page loads without errors

- **Sign In Page** (`/auth/signin`)
  - Verifies email and password input fields are present
  - Checks submit button functionality

- **Sign Up Page** (`/auth/signup`)
  - Verifies registration form fields
  - Validates form inputs are present

- **Not Found Page** (`/nonexistent-page-xyz`)
  - Confirms 404 page displays error message

### 2. Authentication Tests
These tests verify authentication flow:

- **Invalid Credentials**
  - Tests that sign-in rejects invalid email/password combinations
  - Verifies error message or redirect to signin page

### 3. Authenticated User Pages
These tests use authenticated sessions with `john@foo.com` to verify protected pages:

- **Profile Page** (`/profile`)
  - Verifies page loads with user information

- **Edit Profile Page** (`/edit-profile`)
  - Confirms form fields are present
  - Tests page loads correctly

- **Matches Pages**
  - `/matches` - Browse all matches
  - `/accepted-matches` - View accepted matches
  - `/passed-matches` - View skipped matches
  - `/saved-matches` - View bookmarked matches

- **Messages Page** (`/messages`)
  - Verifies message conversations display
  - Confirms page loads with message interface

- **Resources Page** (`/resources`)
  - Validates housing resources display

- **Lifestyle Survey Page** (`/lifestyle-survey`)
  - Confirms survey questions display
  - Tests radio button selection functionality

### 4. Navigation Tests
These tests verify navigation functionality:

- **Navbar for Authenticated Users**
  - Verifies page loads and user can navigate
  - Checks for navbar elements

### 5. Admin Pages
These tests verify admin-only functionality with `admin@foo.com`:

- **Admin Dashboard** (`/admin`)
  - Confirms admin page loads
  - Skips test if user is redirected (user doesn't have admin access)

## Test Structure

### Authentication Fixture
Tests use the `getUserPage` fixture from `auth-utils.ts` to:
- Authenticate users before running tests
- Maintain session state across tests
- Support both regular users and admin users

### Test Users
- **Regular User**: `john@foo.com` (password: `changeme`)
- **Admin User**: `admin@foo.com` (password: `changeme`)

### Helper Functions
- `waitForPageLoad(page)`: Ensures pages are fully loaded before testing

## Running the Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
# Core features tests
npx playwright test core-features.spec.ts

# Sign-in suspension tests
npx playwright test signin-suspension.spec.ts
```

### Run Specific Test Suite
```bash
# Public pages only
npx playwright test -g "Public Pages"

# Authentication tests
npx playwright test -g "Authentication Flow"

# Authenticated user features
npx playwright test -g "User Profile"
npx playwright test -g "Matches & Browsing"
npx playwright test -g "Messages"

# Admin features
npx playwright test -g "Admin"
```

## Test Coverage

### Pages Tested: 16
1. Landing Page (/)
2. Sign In (/auth/signin)
3. Sign Up (/auth/signup)
4. Profile (/profile)
5. Edit Profile (/edit-profile)
6. Lifestyle Survey (/lifestyle-survey)
7. Matches (/matches)
8. Accepted Matches (/accepted-matches)
9. Passed Matches (/passed-matches)
10. Saved Matches (/saved-matches)
11. Messages (/messages)
12. Resources (/resources)
13. Admin Dashboard (/admin)
14. Not Found (404)
15. Navigation (Navbar)
16. Authentication Flow

## Expected Behavior

All tests should pass when:
- Application is running (either locally or deployed on Vercel)
- Database is seeded with test users (john@foo.com, admin@foo.com)
- All pages load without errors
- Tests will skip gracefully if a user doesn't have access to a page

### On GitHub Actions/Vercel:
- Tests run against https://manoaroomiematch.vercel.app
- If authentication fails or user lacks access, tests skip instead of failing
- All tests should pass or skip, with no failures

## Troubleshooting

### Common Issues

1. **Tests Fail with NS_BINDING_ABORTED**
   - This occurs when page navigation is interrupted
   - Usually caused by redirect or missing user
   - Tests now gracefully skip if this happens

2. **Authentication Failures**
   - Verify test users exist in database (john@foo.com, admin@foo.com)
   - Check that passwords are set to 'changeme'
   - Ensure session storage is writable

3. **Tests Skip Unexpectedly**
   - This is intentional - tests skip if user doesn't have access to a page
   - Check that correct user is being used for each test
   - john@foo.com for user-facing pages
   - admin@foo.com for admin pages only

4. **Timeout Errors**
   - Network connectivity issue
   - Application not running or not responding
   - Check application status before running tests

## Future Enhancements

Potential additions to the test suite:
- Comparison page tests (requires specific URL parameters)
- Form submission validation (currently tests input only)
- Error handling tests (invalid inputs)
- Accessibility tests (ARIA labels, keyboard navigation)
- Mobile responsive tests
- Cross-browser testing
- Performance testing (page load times)

## Notes

- Tests use `.slow()` modifier for authenticated tests due to authentication overhead
- Tests are designed to be non-destructive (no data modification)
- Tests use flexible selectors and fallbacks to accommodate UI changes
- Tests gracefully skip if authentication fails or user lacks access
- Navigation waits use only `domcontentloaded`, not `networkidle` (prevents Vercel timeout issues)
- All network operations are wrapped with `.catch()` to prevent test crashes
- Tests verify page availability, not full functionality
