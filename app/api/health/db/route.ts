import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET() {
  try {
    const sql = getSql();
    const result = await sql`SELECT 1 AS ok;`;
    const ok = Array.isArray(result?.rows) && result.rows[0]?.ok === 1;
    return NextResponse.json({ ok }, { status: 200 });
  } catch (error) {
    console.error('[health/db] ERROR', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
