# Kito Marketplace (Next.js)

This branch migrates the Kito marketplace to the Next.js App Router and introduces dynamic listings backed by Neon Postgres, Blob storage uploads, and an admin moderation workflow that runs entirely on Vercel.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and set the required secrets:

- `DATABASE_URL` – Postgres connection string (Neon recommended)
- `BLOB_READ_WRITE_TOKEN` – Vercel Blob read/write token
- `DISABLE_ADMIN_AUTH` – set to `true` to bypass admin auth (ideal for development)
- `ADMIN_KEY` – optional password for the `/admin` dashboard when auth is enabled

## Database schema

```sql
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  condition TEXT,
  location TEXT,
  category TEXT,
  image_url TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

The schema is created automatically on first access by the API routes, so no manual migrations are required.

## Deployment notes

- `/api/upload` stores public images in Vercel Blob after validating MIME type (`jpeg`, `png`, `webp`) and size (≤5 MB).
- `/api/listings` exposes GET + POST for public listing creation. POST submissions default to `pending` status and trigger ISR revalidation.
- `/api/listings/[id]` enables admin-only moderation (approve/reject/delete). Status changes log to the server as placeholders for email notifications.
- `/api/reports` accepts anonymous abuse reports for approved listings.

### Admin access

Set `DISABLE_ADMIN_AUTH="true"` locally (and in Vercel if you want to temporarily bypass authentication). When the flag is not enabled, configure `ADMIN_KEY` and include it with admin API requests using the `x-admin-key` header.

#### Troubleshooting notes

- Environment variables: `DISABLE_ADMIN_AUTH` and `ADMIN_KEY` (only required when auth is enabled).
- Test with curl: `curl -v -H "x-admin-key: <your key>" https://<your-deploy>/api/admin/ping`
- After diagnosing access issues, you can disable the health check routes or admin debug logging if not needed.

### Local image uploads

When running locally, ensure the Blob token has read/write access and that `DATABASE_URL` points to your Neon Postgres database (or a compatible local Postgres instance).

## Tech stack

- Next.js 14 App Router
- Neon Postgres & `@vercel/postgres`
- Vercel Blob storage
- Tailwind CSS & Framer Motion
- React context for bilingual (ES/EN) UI
