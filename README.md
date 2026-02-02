# Environmental Data Governance System (Next.js + Firebase)

Full-stack demo app for **privacy**, **retention**, and **compliance/auditability** of environmental datasets.

## Roles

- **Admin**: manage users/roles, define retention rules, run retention, view audit logs
- **Data Provider**: upload datasets (CSV/JSON), tag sensitivity, manage own datasets
- **Public**: view **anonymized + aggregated** datasets only

## Firestore collections

- `users`: `{ uid, email, role, createdAt, lastLoginAt }`
- `datasets` (private): raw/encrypted payload + metadata
- `publicDatasets` (public): anonymized samples + aggregates only
- `retentionRules`: admin-defined policies (match by dataType + sensitivity)
- `archivedDatasets`: summarized archive output (no raw payload)
- `auditLogs`: immutable action logs

## Security model (important)

- **Auth**: Firebase Auth (email/password) on the client.
- **Session**: after login, the client exchanges the Firebase ID token for an **httpOnly JWT cookie** (`envds_session`).
- **RBAC**: Next.js `middleware.ts` verifies the session cookie (Edge-safe) and protects `/admin/*`, `/provider/*`, and `/api/admin/*`.
- **Data privacy**:
  - Raw datasets are stored only in `datasets`
  - Public access reads only `publicDatasets` (aggregated/anonymized)
  - `SENSITIVE` / `RESTRICTED` uploads store raw payload **encrypted at rest** (AES-256-GCM)

## Firestore Security Rules

Rules live in `firestore.rules` and enforce:

- Admin: full access
- Provider: access only to own `datasets`
- Public: read only `publicDatasets`

## Setup

1. Create a Firebase project + Firestore.
2. Enable **Authentication → Email/Password**.
3. Create a **service account** and copy:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep literal `\n` newlines)
4. Create `env-data-governance-system/.env.local` (not committed) using `env.example`.
5. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Bootstrap an Admin (demo)

Set `BOOTSTRAP_ADMIN_EMAILS=you@example.com` in `.env.local`. The first login with that email becomes **ADMIN**.

## Demo retention

Admins can create retention rules in `/admin/retention`.

For hackathon demos, run retention manually from `/admin`:

- Expired datasets are **archived** (summary only) or **deleted** based on rule action.

## Project structure (high-level)

- `src/app/(auth)/*`: login/signup
- `src/app/(app)/*`: role dashboards (`/admin`, `/provider`, `/public`)
- `src/app/api/*`: route handlers (CRUD + retention + audit)
- `src/lib/*`: firebase client/admin, auth session, encryption, retention matching
- `firestore.rules`: Firestore security rules

## Notes

- This project focuses on **governance logic** over data volume. For production, store large files in object storage and keep metadata/aggregates in Firestore.
