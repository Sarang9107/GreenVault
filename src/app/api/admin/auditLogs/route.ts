import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";

export async function GET(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const actorUid = url.searchParams.get("actorUid");

  let query = getAdminDb().collection("auditLogs").orderBy("createdAt", "desc").limit(200);
  if (action) query = query.where("action", "==", action);
  if (actorUid) query = query.where("actorUid", "==", actorUid);

  const snap = await query.get();
  const logs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));

  return NextResponse.json({ logs });
}


