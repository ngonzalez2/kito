export function assertAdminAccess(request: Request): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) throw new Error('Missing ADMIN_KEY env var');
  const provided = request.headers.get('x-admin-key');
  return !!provided && provided === expected;
}
