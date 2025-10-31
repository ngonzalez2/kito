export function assertAdminAccess(request) {
  const expectedKey = process.env.ADMIN_KEY;
  if (!expectedKey) {
    throw new Error('Missing ADMIN_KEY environment variable.');
  }
  const providedKey = request.headers.get('x-admin-key');
  return providedKey && providedKey === expectedKey;
}
