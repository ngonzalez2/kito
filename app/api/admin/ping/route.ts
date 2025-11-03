import { NextResponse } from 'next/server';
import { assertAdminAccess } from '@/lib/auth';

// Diagnostic endpoint – remove after use.
// Test with curl:
//   curl -v -H "x-admin-key: kitokiteNgl!0407" https://<your-deploy>/api/admin/ping

const ADMIN_HEADER_KEYS = ['x-admin-key', 'X-Admin-Key'];

function maskValue(secret: string) {
  const trimmed = secret.trim();
  if (!trimmed) {
    return '';
  }
  const length = trimmed.length;
  const lastFour = trimmed.slice(-4);
  return `***${lastFour} (len:${length})`;
}

export async function GET(request: Request) {
  const expectedRaw = process.env.ADMIN_KEY ?? '';
  const expectedPresent = expectedRaw.trim().length > 0;

  const providedRaw =
    ADMIN_HEADER_KEYS.map((key) => request.headers.get(key))
      .find((value): value is string => typeof value === 'string' && value !== null) ?? '';
  const providedTrimmed = providedRaw.trim();
  const headerProvided = providedTrimmed.length > 0;
  const providedMasked = headerProvided ? maskValue(providedTrimmed) : '';

  let ok = false;
  try {
    ok = assertAdminAccess(request);
  } catch (error) {
    if (process.env.ADMIN_DEBUG === 'true') {
      console.warn('[admin/ping] Admin access check failed:', (error as Error).message);
    }
  }

  return NextResponse.json({ ok, expectedPresent, headerProvided, providedMasked });
}
