import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";
import { logAudit } from "@/lib/audit";
import { nanoid } from "nanoid";

export async function POST() {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const now = Date.now();
  const adminDb = getAdminDb();
  const snap = await adminDb
    .collection("datasets")
    .where("expiresAtMs", "<=", now)
    .orderBy("expiresAtMs", "asc")
    .limit(50)
    .get();

  let archived = 0;
  let deleted = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as any;
    const action = (data.retentionAction ?? "ARCHIVE") as "ARCHIVE" | "DELETE";

    if (action === "ARCHIVE") {
      const archiveId = nanoid();
      await adminDb.collection("archivedDatasets").doc(archiveId).set({
        archiveId,
        datasetId: doc.id,
        ownerUid: data.ownerUid ?? null,
        ownerEmail: data.ownerEmail ?? null,
        dataType: data.dataType ?? null,
        sensitivityLevel: data.sensitivityLevel ?? null,
        createdAtMs: data.createdAtMs ?? null,
        expiredAtMs: now,
        aggregates: data.aggregates ?? {},
      });
      await adminDb.collection("datasets").doc(doc.id).delete();
      await adminDb
        .collection("publicDatasets")
        .doc(doc.id)
        .set({ archivedAtMs: now }, { merge: true })
        .catch(() => null);
      archived += 1;
    } else {
      await adminDb.collection("datasets").doc(doc.id).delete();
      await adminDb.collection("publicDatasets").doc(doc.id).delete().catch(() => null);
      deleted += 1;
    }
  }

  await logAudit({
    action: "RUN_RETENTION",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    metadata: { expiredFound: snap.size, archived, deleted },
  });

  return NextResponse.json({ ok: true, expiredFound: snap.size, archived, deleted });
}


