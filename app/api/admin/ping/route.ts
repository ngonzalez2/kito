import { NextResponse } from 'next/server';
import { assertAdminAccessFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const ok = assertAdminAccessFromRequest(request);
  return NextResponse.json({ ok });
}
