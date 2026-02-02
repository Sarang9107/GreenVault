import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";
import { nanoid } from "nanoid";
import { logAudit } from "@/lib/audit";
import { FieldValue } from "firebase-admin/firestore";

const BodySchema = z.object({
  dataType: z.enum(["air", "water", "noise", "emissions", "any"]),
  sensitivityLevel: z.enum(["PUBLIC", "SENSITIVE", "RESTRICTED", "any"]),
  daysToRetain: z.number().int().min(1).max(3650),
  action: z.enum(["DELETE", "ARCHIVE"]),
});

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const snap = await getAdminDb()
    .collection("retentionRules")
    .orderBy("createdAtMs", "desc")
    .limit(200)
    .get();

  const rules = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return jsonError(400, "INVALID_BODY");

  const id = nanoid();
  await getAdminDb().collection("retentionRules").doc(id).set({
    ...body.data,
    createdAtMs: Date.now(),
    createdAt: FieldValue.serverTimestamp(),
  });

  await logAudit({
    action: "SET_RETENTION_RULE",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "RETENTION_RULE",
    targetId: id,
    metadata: body.data,
  });

  return NextResponse.json({ ok: true, id });
}


