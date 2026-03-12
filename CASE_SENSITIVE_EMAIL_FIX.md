# Case-Sensitive Email Fix

This document outlines the changes made to fix case-sensitive email handling in the Mushaf Platform backend.

## Problem

The backend was storing and querying emails in a case-sensitive manner, causing issues when:
- Users register with `User@Example.com` but try to login with `user@example.com`
- Direct API calls via Postman use different email cases
- Frontend normalizes emails to lowercase but backend doesn't

## Solution

### 1. Database Schema Changes
- Added `unique: true` constraint to the email column in `User` entity
- This prevents duplicate accounts with different email cases

### 2. Backend Code Changes

#### User Entity (`src/users/entities/user.entity.ts`)
- Added unique constraint to email field

#### Users Service (`src/users/users.service.ts`)
- `findByEmail()`: Now normalizes email to lowercase before querying
- `create()`: Now normalizes email to lowercase before saving

#### Auth Controller (`src/auth/auth.controller.ts`)
- `register()`: Now normalizes email to lowercase before checking existence and creating user

#### Auth Service (`src/auth/auth.service.ts`)
- `login()`: Now normalizes email to lowercase before finding user

### 3. Database Migration
- Created migration `1741756486987-NormalizeEmailCase.ts` to normalize existing email data
- Updates all existing emails to lowercase

## How to Apply Changes

### 1. For Production (Database-backed apps):
```bash
cd mushaf-platform-BE
npm run migration:run
```

### 2. For Development/AsyncStorage apps:
No migration needed! Just restart the backend server.

### 3. Restart Backend Server
```bash
npm run start:dev
```

## Testing

### Test Case 1: Registration with Mixed Case
1. Register user with email `Test@Example.Com`
2. Verify user is created with email stored as `test@example.com`

### Test Case 2: Login with Different Case
1. Register user with email `User@Example.com`
2. Login with email `user@example.com` - should succeed
3. Login with email `USER@EXAMPLE.COM` - should succeed

### Test Case 3: Duplicate Prevention
1. Register user with email `Test@Example.com`
2. Try to register again with `test@example.com` - should fail with "Email already in use"

### Test Case 4: Direct API Access
1. Use Postman to register user with `API@Example.com`
2. Use Postman to login with `api@example.com` - should succeed

## Frontend Compatibility

The frontend changes (already implemented) normalize emails to lowercase before sending to the backend. These backend changes ensure:
- Consistent behavior between frontend and direct API calls
- No duplicate accounts due to case differences
- Seamless user experience regardless of email case used

## Notes

- The migration is not reversible as original email case is lost
- All email comparisons are now case-insensitive
- Email storage is now normalized to lowercase
- Unique constraint prevents duplicate accounts with different cases