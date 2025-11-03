export function isAdminAuthDisabled(): boolean {
  return process.env.DISABLE_ADMIN_AUTH?.toLowerCase() === 'true';
}

export function assertAdminAccessFromRequest(request: Request): boolean {
  if (isAdminAuthDisabled()) {
    return true;
  }

  const requiredKey = process.env.ADMIN_KEY?.trim();
  if (!requiredKey) {
    console.warn('[auth] ADMIN_KEY not set but auth enabled. Denying access.');
    return false;
  }

  const providedKey =
    request.headers.get('x-admin-key')?.trim() ?? request.headers.get('X-Admin-Key')?.trim() ?? '';

  const isAuthorized = providedKey.length > 0 && providedKey === requiredKey;
  if (!isAuthorized) {
    console.warn('[auth] Invalid or missing x-admin-key.');
  }

  return isAuthorized;
}
