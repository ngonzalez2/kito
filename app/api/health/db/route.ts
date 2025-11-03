import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await sql`SELECT 1 AS ok`;
    const ok = Array.isArray(result?.rows) && result.rows[0]?.ok === 1;
    return NextResponse.json({ ok });
  } catch (e: unknown) {
    console.error('[health/db] ERROR', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
