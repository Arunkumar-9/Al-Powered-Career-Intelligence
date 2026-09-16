# Admin Dashboard Setup

## 1. Configure environment

Copy `server/.env.example` to `server/.env` and provide your existing MongoDB, JWT, AI and Adzuna credentials. Never commit `.env`.

## 2. Create/promote the first admin

From `server/`:

```bash
node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPasswordHere"
```

This command creates the account if it does not exist, or promotes an existing account to `admin`.

## 3. Start the application

```bash
# server
npm install
npm run dev

# client
npm install
npm run dev
```

Open `/admin/login` for the dedicated admin sign-in.

## 4. Security model

- Admin authentication uses a separate `adminToken` browser key and a 12-hour JWT.
- Every admin API after login is protected by both the existing JWT middleware and a database-backed admin-role middleware.
- The backend re-checks `role` and `isActive` on every admin request.
- Normal user tokens cannot access `/api/admin/*`.
- Secrets, passwords and API keys are never returned by admin APIs.

## 5. New persistent admin-support data

The implementation adds only data that the original application did not already persist:

- `ActivityLog` — platform events used by Activity/usage analytics.
- `JobSearchLog` — external job-search/recommendation usage history.
- `Feedback` — user feedback records and admin workflow state.
- `Course` — admin-managed course/certification catalog.

Resume parsing status is stored directly on the existing `Resume` document so failures can be monitored without a duplicate resume collection.
