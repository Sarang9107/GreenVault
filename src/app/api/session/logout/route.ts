import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);

  if (session) {
    await logAudit({
      action: "LOGOUT",
      actorUid: session.uid,
      actorEmail: session.email,
      actorRole: session.role,
    });
  }

  // Avoid unused param lint
  void req;
  return res;
}


