import { NextResponse } from 'next/server';
import { assertAdminAccessFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const ok = assertAdminAccessFromRequest(request);
  return NextResponse.json({ ok });
}
