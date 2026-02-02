# 🔧 Troubleshooting Guide

## Error: "Firebase: Error (auth/network-request-failed)"

This error means Firebase can't reach the authentication service. Here's how to fix it:

### ✅ Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **greenvault-93857**
3. Click **Authentication** in the left sidebar
4. Click **Get started** (if you haven't enabled it yet)
5. Go to the **Sign-in method** tab
6. Click on **Email/Password**
7. **Enable** the first toggle (Email/Password)
8. Click **Save**

### ✅ Step 2: Verify Authorized Domains

1. In Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure `localhost` is listed (it should be by default)
4. If not, click **Add domain** and add `localhost`

### ✅ Step 3: Check API Key Restrictions (if any)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **greenvault-93857**
3. Go to **APIs & Services** → **Credentials**
4. Find your API key (starts with `AIzaSy...`)
5. If there are restrictions, make sure:
   - **Application restrictions**: None (or includes your domain)
   - **API restrictions**: Firebase Authentication API is allowed

### ✅ Step 4: Verify Environment Variables

Make sure your `.env.local` file has all the correct values:

```bash
# Check if file exists
cd env-data-governance-system
dir .env.local
```

If the file doesn't exist, create it from `env.example`:
```bash
copy env.example .env.local
```

Then fill in the values (especially the Firebase Admin SDK keys).

### ✅ Step 5: Restart Dev Server

After making changes:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

---

## Other Common Errors

### "auth/configuration-not-found"
- **Cause**: Missing or incorrect Firebase config in `.env.local`
- **Fix**: Create `.env.local` with all `NEXT_PUBLIC_FIREBASE_*` values

### "auth/invalid-api-key"
- **Cause**: Wrong API key or API key restrictions
- **Fix**: Verify API key in Firebase Console → Project Settings → General

### "auth/unauthorized-domain"
- **Cause**: Domain not authorized in Firebase
- **Fix**: Add your domain in Authentication → Settings → Authorized domains

### "auth/operation-not-allowed"
- **Cause**: Email/Password sign-in method not enabled
- **Fix**: Enable Email/Password in Authentication → Sign-in method

---

## Quick Checklist

- [ ] `.env.local` file exists with all Firebase config values
- [ ] Email/Password authentication is enabled in Firebase Console
- [ ] `localhost` is in authorized domains
- [ ] Dev server restarted after adding `.env.local`
- [ ] No typos in environment variable names
- [ ] Firebase project ID matches in all config values

---

## Still Having Issues?

1. **Check browser console** for more detailed error messages
2. **Check terminal** where `npm run dev` is running for server errors
3. **Verify Firebase project** is active and billing is enabled (if required)
4. **Try incognito mode** to rule out browser cache issues

