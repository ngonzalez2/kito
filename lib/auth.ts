function resolveAdminKey(): string {
  const expected = process.env.ADMIN_KEY;
  if (typeof expected !== 'string' || expected.trim().length === 0) {
    throw new Error(
      '[auth] ADMIN_KEY environment variable is not set. Provide ADMIN_KEY to enable admin operations.',
    );
  }
  return expected;
}

function maskValue(secret: string) {
  const trimmed = secret.trim();
  if (!trimmed) {
    return '';
  }
  const length = trimmed.length;
  const lastFour = trimmed.slice(-4);
  return `***${lastFour} (len:${length})`;
}

export function assertAdminAccess(request: Request): boolean {
  const expected = resolveAdminKey().trim();
  const providedRaw =
    request.headers.get('x-admin-key') ?? request.headers.get('X-Admin-Key') ?? '';
  const provided = providedRaw.trim();

  if (process.env.ADMIN_DEBUG === 'true') {
    console.log('[auth] Admin header received:', maskValue(providedRaw));
  }

  return Boolean(provided) && provided === expected;
}
