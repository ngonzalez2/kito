import { NextResponse } from 'next/server';
import { assertAdminAccess } from '@/lib/auth';

export async function GET(request: Request) {
  const ok = assertAdminAccess(request);
  return NextResponse.json({ ok });
}
