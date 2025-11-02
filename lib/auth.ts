function resolveAdminKey(): string | null {
  console.log('🔐 Checking admin key (ADMIN_KEY set?):', !!process.env.ADMIN_KEY);
  console.log('🔐 Checking admin key (KITO_SUPER_ADMIN_2025 set?):', !!process.env.KITO_SUPER_ADMIN_2025);
  const envKey = process.env.ADMIN_KEY ?? process.env.KITO_SUPER_ADMIN_2025 ?? null;
  if (!envKey) {
    console.error('[auth] Admin key missing. Set ADMIN_KEY or KITO_SUPER_ADMIN_2025.');
    return null;
  }
  return envKey;
}

export function assertAdminAccess(request: Request): boolean {
  const expected = resolveAdminKey();
  if (!expected) {
    return false;
  }

  const provided = request.headers.get('x-admin-key') ?? '';
  console.log('[auth] Admin key provided header present:', Boolean(provided));

  return !!provided && provided === expected;
}
