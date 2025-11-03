// app/api/debug/admin-env/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const adminKey = process.env.ADMIN_KEY ?? "";
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";
  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown";
  return NextResponse.json({
    hasAdminKey: Boolean(adminKey),
    adminKeyLen: adminKey.length,
    hasAdminSessionSecret: Boolean(adminSessionSecret),
    vercelEnv,
  });
}
