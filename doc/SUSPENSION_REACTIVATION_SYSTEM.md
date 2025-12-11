# Automatic Suspension Reactivation System

## Overview
This system automatically reactivates suspended users after their suspension period expires. There are multiple ways the system ensures suspended users are reactivated:

## Implementation Methods

### 1. Middleware-Based Cleanup (Active)
- **Location**: `middleware.ts`
- **Trigger**: Every HTTP request to the application
- **How it works**: The `clearExpiredSuspensions()` function runs on each request and clears any suspensions that have expired
- **Pros**: Simple, no external dependencies needed
- **Cons**: Only runs when requests come in (not ideal for overnight periods)

### 2. Cron Endpoint (Manual)
- **Location**: `/api/admin/clear-expired-suspensions`
- **How it uses**: Call this endpoint from an external cron service (e.g., GitHub Actions, cron.is, AWS EventBridge)
- **Authentication**: Requires `CRON_SECRET_KEY` environment variable to be set as Bearer token
- **Example curl**:
  ```bash
  curl -X GET https://your-app.com/api/admin/clear-expired-suspensions \
    -H "Authorization: Bearer YOUR_CRON_SECRET_KEY"
  ```

### 3. Per-User Check on Login
- **Location**: `lib/suspensionUtils.ts` - `checkUserSuspensionStatus()`
- **Trigger**: When user attempts to login or access protected resources
- **How it works**: Checks user's suspension status and clears it if expired
- **Integration point**: Can be integrated in authentication callbacks

## Database Schema
The suspension system uses these fields on the `User` model:
- `suspendedUntil`: DateTime field storing when suspension expires
- `suspensionCount`: Integer tracking total number of times user was suspended
- `active`: Boolean indicating if user account is active (deactivated = false)

## Flag Status Values
When a suspension occurs, the flag status is updated to:
- `'suspended'` - User was suspended
- `'user_deactivated'` - User account was deactivated
- `'resolved'` - Flag was resolved (normal closing)

## Moderation Actions Logged
Each suspension action is logged in `ModerationAction`:
- `suspend` - User suspended for X hours
- `unsuspend` - User suspension removed
- `deactivate` - User account deactivated
- `reactivate` - User account reactivated
- `resolve` - Flag resolved

## Setup Instructions

### Option A: Use Middleware (Recommended for small apps)
The middleware is already configured and will automatically clear expired suspensions on each request. No additional setup needed.

### Option B: Use External Cron Service
1. Set `CRON_SECRET_KEY` in your `.env.local`:
   ```
   CRON_SECRET_KEY=your-secret-key-here
   ```

2. Configure a cron service to call the endpoint periodically:
   - **GitHub Actions**: Create a workflow that runs on schedule
   - **cron-job.org**: Free cron service
   - **AWS EventBridge**: AWS Lambda-based scheduling
   - **Vercel Cron**: Built-in cron support for Vercel deployments

3. Example GitHub Actions workflow (`.github/workflows/clear-suspensions.yml`):
   ```yaml
   name: Clear Expired Suspensions
   on:
     schedule:
       - cron: '*/5 * * * *'  # Every 5 minutes
   jobs:
     clear:
       runs-on: ubuntu-latest
       steps:
         - name: Call suspension cleanup endpoint
           run: |
             curl -X GET ${{ secrets.APP_URL }}/api/admin/clear-expired-suspensions \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET_KEY }}"
   ```

## Suspension Workflow

1. **Admin suspends user**:
   - User's `suspendedUntil` set to current time + duration
   - Flag status set to `'suspended'`
   - ModerationAction logged

2. **Suspension period expires**:
   - Middleware clears `suspendedUntil` field
   - User can login and use application normally
   - UI no longer shows "Suspended" badge

3. **Admin unsuspends user manually**:
   - Admin clicks "Unsuspend" button
   - `suspendedUntil` cleared immediately
   - Flag status set to `'resolved'`
   - ModerationAction logged

## UI Behavior

### Status Badges
- `'Pending'` - Flag not yet resolved
- `'Suspended'` - User is currently suspended
- `'Deactivated'` - User account is deactivated
- `'Resolved'` - Flag resolved

### Action Buttons
- **Resolve**: Close flag without action
- **Suspend**: Temporarily suspend user (shows modal for duration)
- **Unsuspend**: Remove active suspension
- **Deactivate**: Permanently deactivate user
- **Reactivate**: Restore deactivated user
- **View**: See user's profile

## Testing

To test suspension auto-reactivation:

1. Suspend a user with short duration (e.g., 1 minute)
2. Wait for suspension period to expire
3. Make a request to the app (triggers middleware cleanup)
4. Check the user's suspension status:
   ```sql
   SELECT id, email, suspendedUntil, suspensionCount FROM "User" WHERE id = ?;
   ```
5. `suspendedUntil` should be NULL after expiration

## Performance Considerations

- **Middleware approach**: Lightweight, runs on every request
- **Cron approach**: More predictable, doesn't block requests
- For high-traffic apps, consider running cleanup in a background job service separate from the main app

## Future Enhancements

- Implement dedicated cron service (node-cron, bull-mq)
- Add metrics/logging for suspension clearing
- Implement email notification when user is unsuspended
- Add suspension appeal system
