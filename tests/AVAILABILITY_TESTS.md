# Playwright Availability Tests Documentation

## Overview
This document describes the comprehensive Playwright availability tests implemented for the Mānoa RoomieMatch application. These tests verify that all pages are accessible and that all forms operate correctly with legal inputs.

## Test File
- **Location**: `/tests/availability.spec.ts`
- **Purpose**: Test availability of all application pages and validate form functionality

## Test Categories

### 1. Public Pages Availability (No Authentication Required)
These tests verify that public-facing pages load and display correctly:

- **Landing Page** (`/`)
  - Verifies hero section with "Find the Perfect Roommate" heading
  - Checks for "Start Matching" CTA button
  - Validates "What is Mānoa RoomieMatch?" section
  - Confirms "Key Features" section is present

- **Sign In Page** (`/auth/signin`)
  - Verifies email and password input fields are present
  - Tests form accepts valid email and password inputs
  - Checks submit button functionality

- **Sign Up Page** (`/auth/signup`)
  - Verifies registration form fields
  - Tests form accepts valid Hawaii.edu email addresses
  - Validates password input functionality

- **Not Found Page** (`/nonexistent-page`)
  - Confirms 404 page displays "Page not found" message

- **Not Authorized Page** (`/not-authorized`)
  - Validates "Not Authorized" message is displayed

### 2. Authenticated User Pages
These tests use authenticated sessions to verify protected pages:

- **Profile Page** (`/profile`)
  - Verifies user email is displayed
  - Checks for profile sections (About Me, Matches, etc.)
  - Validates page loads with user information

- **Edit Profile Page** (`/edit-profile`)
  - Tests form accepts valid inputs for:
    - First Name
    - Last Name
    - Major/Field of Study
    - Hometown
    - Bio
  - Verifies all input fields function correctly

- **Lifestyle Survey Page** (`/lifestyle-survey`)
  - Checks survey question display
  - Tests radio button selection functionality
  - Validates Next/Complete button functionality
  - Verifies progress tracking

- **Matches/Browse Page** (`/matches`)
  - Confirms matches display
  - Checks view toggle functionality (grid/list)
  - Validates page loads with match data

- **Messages Page** (`/messages`)
  - Verifies message conversations display
  - Tests message input form
  - Validates message composition functionality

- **Home Page** (`/home`)
  - Checks dashboard elements
  - Verifies user-specific content

- **Resources Page** (`/resources`)
  - Validates housing resources display
  - Checks for UH Student Housing links
  - Verifies Off-Campus Housing information

- **Change Password Page** (`/auth/change-password`)
  - Tests old password input
  - Validates new password input
  - Checks form functionality

### 3. Admin Pages
These tests verify admin-only functionality:

- **Admin Dashboard** (`/admin`)
  - Confirms admin sections are visible
  - Checks for User Management section
  - Validates admin controls

### 4. Navigation Tests
These tests verify navigation functionality:

- **Navbar for Authenticated Users**
  - Verifies all main navigation links:
    - Matches/Browse
    - Lifestyle Survey
    - Resources
    - My Profile
  - Checks user dropdown menu

- **Navbar for Admin Users**
  - Confirms Admin link is visible for admin users

- **Page Navigation**
  - Tests navigation between pages using navbar links
  - Validates URL changes correctly

### 5. Form Validation Tests
These tests specifically validate that forms accept legal inputs:

- **Sign In Form**
  - Tests with valid email format
  - Tests with valid password format
  - Verifies submit button is enabled with valid inputs

- **Sign Up Form**
  - Tests with valid Hawaii.edu email
  - Tests with strong password
  - Verifies registration button is enabled

- **Edit Profile Form**
  - Tests all profile fields accept appropriate data types
  - Validates text inputs for names, major, hometown, bio

- **Lifestyle Survey Form**
  - Tests radio button selection
  - Validates Next button is enabled after selection

- **Message Form**
  - Tests message text input
  - Validates Send button functionality

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

### Run All Availability Tests
```bash
npx playwright test availability.spec.ts
```

### Run Specific Test Suite
```bash
# Public pages only
npx playwright test availability.spec.ts -g "Public Pages"

# Authenticated pages only
npx playwright test availability.spec.ts -g "Authenticated User Pages"

# Admin pages only
npx playwright test availability.spec.ts -g "Admin Pages"

# Navigation tests only
npx playwright test availability.spec.ts -g "Navigation"

# Form validation only
npx playwright test availability.spec.ts -g "Form Validation"
```

### Run with UI
```bash
npx playwright test availability.spec.ts --ui
```

### Run in Debug Mode
```bash
npx playwright test availability.spec.ts --debug
```

## Test Coverage

### Pages Tested: 15
1. Landing Page (/)
2. Sign In (/auth/signin)
3. Sign Up (/auth/signup)
4. Profile (/profile)
5. Edit Profile (/edit-profile)
6. Lifestyle Survey (/lifestyle-survey)
7. Matches (/matches)
8. Messages (/messages)
9. Home (/home)
10. Resources (/resources)
11. Change Password (/auth/change-password)
12. Admin (/admin)
13. Not Found (404)
14. Not Authorized
15. Navigation (Navbar)

### Forms Tested: 6
1. Sign In Form
2. Sign Up Form
3. Edit Profile Form
4. Lifestyle Survey Form
5. Message Composition Form
6. Change Password Form

## Expected Behavior

All tests should pass when:
- Application is running on localhost:3000
- Database is seeded with test users (john@foo.com, admin@foo.com)
- All pages load without errors
- All forms accept legal inputs correctly

## Troubleshooting

### Common Issues

1. **Tests Fail Due to Missing Elements**
   - Ensure the application is running (`npm run dev`)
   - Verify database is seeded with test users
   - Check that all pages are accessible

2. **Authentication Failures**
   - Verify test users exist in database
   - Check that passwords match expected values
   - Ensure session storage is writable

3. **Timeout Errors**
   - Increase timeout values in test configuration
   - Check network connectivity
   - Verify pages load within reasonable time

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
- Tests use flexible selectors to accommodate UI changes
- Race conditions are handled with timeout fallbacks
- Tests verify availability, not full functionality
