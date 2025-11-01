import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
  return NextResponse.json({ ok: true, env });
}
