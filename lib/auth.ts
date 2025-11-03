import { hasAdminSession } from '@/lib/adminSession';

export function isAdminAuthDisabled(): boolean {
  return (process.env.DISABLE_ADMIN_AUTH || '').toLowerCase() === 'true';
}

export function headerKeyMatches(req: Request): boolean {
  const required = (process.env.ADMIN_KEY || '').trim();
  if (!required) return false;
  const provided =
    req.headers.get('x-admin-key')?.trim() || req.headers.get('X-Admin-Key')?.trim() || '';
  return provided.length > 0 && provided === required;
}

export function assertAdminAccessFromRequest(request: Request): boolean {
  if (isAdminAuthDisabled()) {
    return true;
  }

  if (hasAdminSession(request)) {
    return true;
  }

  if (headerKeyMatches(request)) {
    return true;
  }

  console.warn('[auth] Missing valid admin authentication.');
  return false;
}
