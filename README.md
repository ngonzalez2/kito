# Kito Marketplace (Next.js)

This branch migrates the Kito marketplace to the Next.js App Router and introduces dynamic listings backed by Vercel Postgres, Blob storage uploads, and an admin moderation workflow that runs entirely on Vercel.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and set the required secrets:

- `DATABASE_URL` – Vercel Postgres connection string
- `BLOB_READ_WRITE_TOKEN` – Vercel Blob read/write token
- `ADMIN_KEY` – password for the `/admin` dashboard

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

Set `ADMIN_KEY` locally and in Vercel. The `/admin` dashboard prompts for the key, caches it in `localStorage`, and includes it in moderation requests via the `x-admin-key` header.

### Local image uploads

When running locally, ensure the Blob token has read/write access and that `DATABASE_URL` points to a Vercel Postgres database (or a compatible local Postgres instance).

## Tech stack

- Next.js 14 App Router
- Vercel Postgres & `@vercel/postgres`
- Vercel Blob storage
- Tailwind CSS & Framer Motion
- React context for bilingual (ES/EN) UI
