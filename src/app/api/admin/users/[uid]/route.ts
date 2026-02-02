import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";

const BodySchema = z.object({
  role: z.enum(["ADMIN", "PROVIDER", "PUBLIC"]),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ uid: string }> }
) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const { uid } = await ctx.params;
  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return jsonError(400, "INVALID_BODY");

  await getAdminDb()
    .collection("users")
    .doc(uid)
    .set({ role: body.data.role }, { merge: true });

  await logAudit({
    action: "SET_ROLE",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "USER",
    targetId: uid,
    metadata: { role: body.data.role },
  });

  return NextResponse.json({ ok: true });
}


