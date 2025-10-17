# Google OAuth Sign-In Troubleshooting

## Issue: Nothing happens when clicking "Continue with Google"

### Step 1: Check Browser Console

Open browser console (F12 → Console tab) and look for these logs:

**Expected logs**:

```
Google script loaded
Initializing Google Sign-In with client ID: 997380030162-2ad4lccj6edsqblb1gouuujckjbu2d7t.apps.googleusercontent.com
Google Sign-In initialized
```

When clicking button:

```
Sign-in button clicked
Showing Google One Tap prompt
```

### Step 2: Check for Errors

#### Error: "idpiframe_initialization_failed"

**Cause**: Your domain is not authorized in Google Cloud Console

**Fix**:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:5173`
   - `http://localhost:3000`
6. Under "Authorized redirect URIs", add:
   - `http://localhost:5173`
   - `http://localhost:5173/auth/callback`
7. Click **Save**
8. Wait 5 minutes for changes to propagate
9. Clear browser cache and try again

#### Error: "popup_closed_by_user" or popup blocked

**Cause**: Browser is blocking popups

**Fix**:

1. Look for popup blocked icon in address bar
2. Click and allow popups from localhost:5173
3. Try again

#### Error: "Failed to load Google Sign-In script"

**Cause**: Network issue or ad blocker

**Fix**:

1. Check if you have an ad blocker (uBlock Origin, AdBlock, etc.)
2. Disable ad blocker for localhost
3. Check internet connection
4. Try in incognito mode

### Step 3: Verify Google Client ID Configuration

#### Check Frontend .env file

```bash
cd client
cat .env
```

Should show:

```properties
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=997380030162-2ad4lccj6edsqblb1gouuujckjbu2d7t.apps.googleusercontent.com
```

#### Check Backend .env file

```bash
cd server
cat .env
```

Should have:

```properties
GOOGLE_CLIENT_ID=997380030162-2ad4lccj6edsqblb1gouuujckjbu2d7t.apps.googleusercontent.com
```

### Step 4: Test with Alternative Method

If One Tap doesn't work, let's add a button-based flow:

**Option 1: Render Google Button**

```javascript
// In handleGoogleSignIn function
window.google.accounts.id.renderButton(
  document.getElementById('google-signin-button'),
  { theme: 'outline', size: 'large' }
);
```

**Option 2: Use prompt with notification**

```javascript
window.google.accounts.id.prompt((notification) => {
  console.log('Prompt notification:', notification);
  if (notification.isNotDisplayed()) {
    console.error(
      'Prompt not displayed:',
      notification.getNotDisplayedReason()
    );
  } else if (notification.isSkippedMoment()) {
    console.error('Prompt skipped:', notification.getSkippedReason());
  } else if (notification.isDismissedMoment()) {
    console.error('Prompt dismissed:', notification.getDismissedReason());
  }
});
```

### Step 5: Common Google OAuth Errors

| Error Code                        | Meaning                                   | Solution                         |
| --------------------------------- | ----------------------------------------- | -------------------------------- |
| `access_denied`                   | User cancelled                            | Normal behavior                  |
| `redirect_uri_mismatch`           | Redirect URI not authorized               | Add URI to Google Console        |
| `invalid_client`                  | Client ID wrong or deleted                | Check client ID                  |
| `unauthorized_client`             | Client not authorized for this grant type | Enable OAuth in console          |
| `idpiframe_initialization_failed` | Domain not authorized                     | Add domain to authorized origins |

### Step 6: Test Google OAuth Configuration

Use Google's OAuth Playground to test:

1. Go to https://developers.google.com/oauthplayground
2. Configure OAuth client ID
3. Test authorization flow
4. Check if credentials work

### Step 7: Alternative - Use Google's One Tap Debug Mode

Add this to test:

```javascript
window.google.accounts.id.initialize({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  callback: handleGoogleResponse,
  auto_select: false,
  cancel_on_tap_outside: false,
  use_fedcm_for_prompt: true, // Use newer FedCM API
});
```

### Step 8: Check Network Tab

1. Open DevTools → Network tab
2. Click "Continue with Google"
3. Look for requests to:
   - `https://accounts.google.com/gsi/client`
   - `https://accounts.google.com/gsi/iframe/select`
4. Check if any are failing (red status)

### Step 9: Test in Different Browser

Sometimes browser extensions or settings interfere:

- ✅ Try Chrome Incognito
- ✅ Try Firefox Private Window
- ✅ Try Safari
- ✅ Try Edge

### Quick Fix: Use Mock Auth for Testing

If Google OAuth is too problematic for local dev, temporarily use mock auth:

```javascript
const handleMockSignIn = async () => {
  const mockUser = {
    id: 'test_user_' + Date.now(),
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://via.placeholder.com/150',
    profileCompleted: false,
  };

  const mockToken = 'mock_jwt_token_' + Date.now();

  setUser(mockUser);
  setToken(mockToken);
  navigate('/onboarding/gender');
};
```

## Still Not Working?

### Create a minimal test page:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body>
    <div
      id="g_id_onload"
      data-client_id="YOUR_CLIENT_ID"
      data-callback="handleCredentialResponse"></div>
    <div class="g_id_signin" data-type="standard"></div>

    <script>
      function handleCredentialResponse(response) {
        console.log('Encoded JWT ID token: ' + response.credential);
      }
    </script>
  </body>
</html>
```

Save as `test.html` and open in browser. If this works, issue is in React code. If this doesn't work, issue is with Google OAuth setup.

## Need Help?

1. Check browser console for exact error
2. Check backend logs for API errors
3. Verify Google Cloud Console settings
4. Test with curl to backend auth endpoint
5. Enable verbose logging in both frontend and backend

## Contact Google Support

If all else fails:

- [Google Identity Services Help](https://developers.google.com/identity/gsi/web/guides/overview)
- [Stack Overflow - google-oauth](https://stackoverflow.com/questions/tagged/google-oauth)
