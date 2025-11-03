// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const providedRaw = typeof body?.key === "string" ? body.key : "";

    // Read env at runtime (do not trim the env; respect exact value)
    const ADMIN_KEY = process.env.ADMIN_KEY ?? "";
    if (!ADMIN_KEY) {
      console.warn("[/api/admin/login] ADMIN_KEY missing in env.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Tolerate copy/paste spaces on user input only
    const provided = providedRaw.trim();
    const ok =
      provided.length > 0 &&
      ADMIN_KEY.length > 0 &&
      safeEqual(provided, ADMIN_KEY);

    if (!ok) {
      console.warn("[/api/admin/login] Invalid key.", {
        providedLen: provided.length,
        adminKeyLen: ADMIN_KEY.length,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = jwt.sign({ role: "admin" }, process.env.ADMIN_SESSION_SECRET!, {
      expiresIn: "2h",
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 2 * 60 * 60, // 2h
    });
    return res;
  } catch (e) {
    console.error("[/api/admin/login] ERROR", e);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
