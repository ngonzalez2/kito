import { sql } from '@vercel/postgres';

const databaseUrlEnvCandidates = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
];

function resolveDatabaseUrl() {
  for (const name of databaseUrlEnvCandidates) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) {
      if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = value;
      }
      return value;
    }
  }

  throw new Error(
    'Missing required environment variable: DATABASE_URL (or a compatible Vercel Postgres URL).',
  );
}

function validateEnv() {
  resolveDatabaseUrl();
}

let schemaPromise;

async function ensureSchema() {
  validateEnv();
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS listings (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          price INTEGER NOT NULL,
          condition TEXT,
          location TEXT,
          category TEXT,
          brand TEXT,
          model TEXT,
          year INTEGER,
          image_url TEXT,
          description TEXT,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
          reason TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS listing_images (
          id SERIAL PRIMARY KEY,
          listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;

      await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT;`;
      await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS brand TEXT;`;
      await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS model TEXT;`;
      await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS year INTEGER;`;
      await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';`;
      await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();`;
      await sql`ALTER TABLE listing_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;`;
      await sql`ALTER TABLE listing_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();`;
    })();
  }
  await schemaPromise;
}

export async function withDb(callback) {
  await ensureSchema();
  return callback(sql);
}

export { sql };
