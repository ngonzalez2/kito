import jwt from 'jsonwebtoken';

export function hasAdminSession(req: Request): boolean {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  try {
    const secret = process.env.ADMIN_SESSION_SECRET!;
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}
