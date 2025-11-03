import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { key } = (await req.json()) as { key?: string };
    const ADMIN_KEY = (process.env.ADMIN_KEY || '').trim();
    if (!key || !ADMIN_KEY || key.trim() !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_SESSION_SECRET!, {
      expiresIn: '2h',
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
