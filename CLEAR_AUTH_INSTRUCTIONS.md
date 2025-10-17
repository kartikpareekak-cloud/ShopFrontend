# Fix 401 Unauthorized Error

## The Problem
After recreating the admin user with the correct password, your browser still has the old authentication token stored in localStorage. This old token is no longer valid, causing 401 (Unauthorized) errors.

## Quick Fix - Option 1: Logout and Login Again

1. **Open the application** in your browser: `http://localhost:5173`
2. **Click "Logout"** (if you're logged in)
3. **Login again** with:
   - Email: `admin@mahalaxmi.com`
   - Password: `admin123`
4. **Navigate to Admin Panel**

## Quick Fix - Option 2: Clear Browser Storage Manually

If logout doesn't work, manually clear the storage:

1. **Open Developer Tools** (Press `F12` or `Ctrl+Shift+I`)
2. **Go to "Application" tab** (or "Storage" in Firefox)
3. **Click "Local Storage"** → `http://localhost:5173`
4. **Delete these keys:**
   - `accessToken`
   - `token`
   - `user`
5. **Refresh the page** (`Ctrl+R`)
6. **Login again** with the credentials above

## Quick Fix - Option 3: Run in Console

1. **Open Developer Tools** (Press `F12`)
2. **Go to "Console" tab**
3. **Paste and run:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. **Login again** with the credentials above

## Verify It's Working

After logging in, you should see:
- ✅ No 401 errors in the console
- ✅ Admin Dashboard loads with stats
- ✅ Products, Orders, Users tables load data

## Technical Details

**What happened:**
- We fixed the double password hashing bug in `seedAdmin.js`
- We recreated the admin user with the correct password
- Your browser still had the old JWT token from the old user
- The old token doesn't match the new user, causing authentication failures

**What we fixed:**
- ✅ Updated `apiClient.js` to look for `accessToken` in localStorage
- ✅ Added `/api/orders/all` route as an alias
- ✅ Backend is working correctly with the new admin user

**Now you just need to get a fresh token by logging in again!**
