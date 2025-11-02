function resolveAdminKey(): string | null {
  const envKey = process.env.ADMIN_KEY ?? process.env.KITO_SUPER_ADMIN_2025 ?? null;
  if (!envKey) {
    console.error('[auth] Admin key missing. Set ADMIN_KEY or KITO_SUPER_ADMIN_2025.');
    return null;
  }

  console.log('[auth] Admin key in env:', envKey);
  return envKey;
}

export function assertAdminAccess(request: Request): boolean {
  const expected = resolveAdminKey();
  if (!expected) {
    return false;
  }

  const provided = request.headers.get('x-admin-key') ?? '';
  console.log('[auth] Admin key provided:', provided);

  return !!provided && provided === expected;
}
