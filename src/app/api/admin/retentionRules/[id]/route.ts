import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";

const PatchSchema = z
  .object({
    daysToRetain: z.number().int().min(1).max(3650).optional(),
    action: z.enum(["DELETE", "ARCHIVE"]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "empty" });

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const { id } = await ctx.params;
  const body = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return jsonError(400, "INVALID_BODY");

  await getAdminDb()
    .collection("retentionRules")
    .doc(id)
    .set(body.data, { merge: true });

  await logAudit({
    action: "SET_RETENTION_RULE",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "RETENTION_RULE",
    targetId: id,
    metadata: body.data,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const { id } = await ctx.params;
  await getAdminDb().collection("retentionRules").doc(id).delete();

  await logAudit({
    action: "SET_RETENTION_RULE",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "RETENTION_RULE",
    targetId: id,
    metadata: { deleted: true },
  });

  void req;
  return NextResponse.json({ ok: true });
}


