# 🔑 Environment Variables Setup Guide

This guide explains where to find each environment variable needed for the Environmental Data Governance System.

## 📋 Quick Setup

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in the missing values (see sections below)

3. Generate secrets:
   ```bash
   node scripts/generate-secrets.js
   ```

---

## 🔍 Where to Find Each Key

### ✅ Already Filled (from your Firebase config)

These are already extracted from your Firebase config:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

---

### 🔐 Firebase Admin SDK Keys (Server-Side)

**Location:** Firebase Console → Project Settings → Service Accounts

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **greenvault-93857**
3. Click the ⚙️ **Settings** icon → **Project settings**
4. Go to the **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (e.g., `greenvault-93857-firebase-adminsdk-xxxxx.json`)

**Extract from the JSON file:**
```json
{
  "project_id": "greenvault-93857",           // → FIREBASE_PROJECT_ID
  "client_email": "firebase-adminsdk-...",     // → FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\n..."  // → FIREBASE_PRIVATE_KEY
}
```

**Important for `FIREBASE_PRIVATE_KEY`:**
- Copy the **entire** `private_key` value including:
  - The quotes: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
  - All the `\n` sequences (they will be converted automatically)
- Example format in `.env.local`:
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
  ```

---

### 🔒 App Security Secrets

These need to be **generated** (don't use the same values in production):

#### `SESSION_SECRET`
- **Purpose:** Signs/verifies JWT session cookies
- **Requirements:** 32+ random characters
- **Generate:** Run `node scripts/generate-secrets.js` or use any secure random string generator

#### `FIELD_ENCRYPTION_KEY_BASE64`
- **Purpose:** Encrypts sensitive dataset fields at rest (AES-256-GCM)
- **Requirements:** 32-byte key, base64 encoded
- **Generate:** Run `node scripts/generate-secrets.js` or:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

**Quick Generate:**
```bash
node scripts/generate-secrets.js
```

This will output:
```
SESSION_SECRET=abc123...
FIELD_ENCRYPTION_KEY_BASE64=xyz789...
```

Copy these into your `.env.local` file.

---

### 👤 Bootstrap Admin Emails (Optional)

**`BOOTSTRAP_ADMIN_EMAILS`**
- **Purpose:** Automatically grant ADMIN role to these emails on first signup
- **Format:** Comma-separated list: `admin@example.com,another@example.com`
- **Default:** `admin@example.com`
- **Note:** Useful for demos. Remove or change in production.

---

## 📝 Complete `.env.local` Example

```env
## Public (client) Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDnGYe3Yse46kc1_ZgpcT3aEAAVigZt_D4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=greenvault-93857.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=greenvault-93857
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=greenvault-93857.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=511787525500
NEXT_PUBLIC_FIREBASE_APP_ID=1:511787525500:web:6f7237742c6378b41270f9

## Server (Admin SDK) config
FIREBASE_PROJECT_ID=greenvault-93857
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@greenvault-93857.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

## App security
SESSION_SECRET=your-generated-32-char-secret-here
FIELD_ENCRYPTION_KEY_BASE64=your-generated-base64-key-here

## Bootstrap admin
BOOTSTRAP_ADMIN_EMAILS=admin@example.com
```

---

## ✅ Verification

After setting up `.env.local`, verify it works:

```bash
npm run dev
```

If you see errors about missing env vars, double-check:
1. File is named `.env.local` (not `.env`)
2. No extra spaces around `=` signs
3. `FIREBASE_PRIVATE_KEY` is wrapped in quotes if it contains special characters
4. All required fields are filled

---

## 🔒 Security Notes

- **Never commit `.env.local` to git** (it's already in `.gitignore`)
- **Regenerate secrets** for production deployments
- **Rotate secrets** periodically in production
- **Use different secrets** for dev/staging/production environments

