import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";
import { decryptJson } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");

  const { id } = await ctx.params;
  const adminDb = getAdminDb();
  const doc = await adminDb.collection("datasets").doc(id).get();
  if (!doc.exists) return jsonError(404, "NOT_FOUND");

  const data = doc.data() as any;
  const isOwner = data.ownerUid === session.uid;
  if (!(session.role === "ADMIN" || isOwner)) return jsonError(403, "FORBIDDEN");

  const url = new URL(req.url);
  const includeRaw = url.searchParams.get("includeRaw") === "true";

  let raw: unknown = null;
  if (includeRaw) {
    if (data.rawEncrypted) raw = decryptJson(data.rawEncrypted);
    else raw = { rows: data.rawSample ?? [] };
  }

  await logAudit({
    action: "VIEW_DATASET",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "DATASET",
    targetId: id,
    metadata: { includeRaw },
  });

  return NextResponse.json({ id, dataset: data, raw });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");

  const { id } = await ctx.params;
  const adminDb = getAdminDb();
  const ref = adminDb.collection("datasets").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return jsonError(404, "NOT_FOUND");

  const data = doc.data() as any;
  const isOwner = data.ownerUid === session.uid;
  if (!(session.role === "ADMIN" || isOwner)) return jsonError(403, "FORBIDDEN");

  await ref.delete();
  await adminDb.collection("publicDatasets").doc(id).delete().catch(() => null);

  await logAudit({
    action: "DELETE_DATASET",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "DATASET",
    targetId: id,
  });

  void req;
  return NextResponse.json({ ok: true });
}


