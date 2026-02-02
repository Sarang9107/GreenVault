import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";
import { encryptJson } from "@/lib/crypto";
import { anonymizeRows, computeAggregates } from "@/lib/datasets/privacy";
import { logAudit } from "@/lib/audit";
import { nanoid } from "nanoid";
import { FieldValue } from "firebase-admin/firestore";
import { pickBestRetentionRule } from "@/lib/retention/matchRule";

const DatasetTypeSchema = z.enum(["air", "water", "noise", "emissions"]);
const SensitivitySchema = z.enum(["PUBLIC", "SENSITIVE", "RESTRICTED"]);

const UploadSchema = z.object({
  dataType: DatasetTypeSchema,
  sensitivityLevel: SensitivitySchema,
  retentionPeriodDays: z.number().int().min(1).max(3650),
  rows: z
    .array(
      z.record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean(), z.null()])
      )
    )
    .max(2000),
});

export async function GET(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");

  const url = new URL(req.url);
  const ownerUid = url.searchParams.get("ownerUid");

  const adminDb = getAdminDb();
  let query = adminDb.collection("datasets").orderBy("createdAtMs", "desc").limit(50);
  if (session.role === "ADMIN" && ownerUid) {
    query = query.where("ownerUid", "==", ownerUid);
  } else if (session.role !== "ADMIN") {
    query = query.where("ownerUid", "==", session.uid);
  }

  const snap = await query.get();
  const datasets = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }));
  return NextResponse.json({ datasets });
}

export async function POST(req: Request) {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (!(session.role === "ADMIN" || session.role === "PROVIDER")) {
    return jsonError(403, "FORBIDDEN");
  }

  const body = UploadSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return jsonError(400, "INVALID_BODY");

  // Apply admin-defined retention rules (if any). If a rule matches, it overrides
  // the user-provided retentionPeriodDays for compliance.
  const adminDb = getAdminDb();
  const rulesSnap = await adminDb.collection("retentionRules").limit(200).get();
  const rules = rulesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as any[];
  const matched = pickBestRetentionRule(rules as any, {
    dataType: body.data.dataType,
    sensitivityLevel: body.data.sensitivityLevel,
  });

  const retentionRuleId = matched?.id ?? null;
  const retentionEnforced = Boolean(matched);
  const retentionPeriodDays = matched?.daysToRetain ?? body.data.retentionPeriodDays;
  const retentionAction = matched?.action ?? "ARCHIVE";

  const createdAtMs = Date.now();
  const expiresAtMs = createdAtMs + retentionPeriodDays * 24 * 60 * 60 * 1000;

  const rawRows = body.data.rows;
  const anonymized = anonymizeRows(rawRows);
  const aggregates = computeAggregates(anonymized);

  const datasetId = nanoid();

  const baseDoc = {
    dataType: body.data.dataType,
    sensitivityLevel: body.data.sensitivityLevel,
    ownerUid: session.uid,
    ownerEmail: session.email,
    createdAtMs,
    createdAt: FieldValue.serverTimestamp(),
    retentionPeriodDays,
    retentionAction,
    retentionRuleId,
    retentionEnforced,
    expiresAtMs,
    recordCount: aggregates.recordCount,
    fields: aggregates.fields,
    aggregates,
  };

  // For demo: store small sample in plaintext if PUBLIC, else store encrypted payload.
  const rawSample = anonymized.slice(0, 50);
  const datasetDoc =
    body.data.sensitivityLevel === "PUBLIC"
      ? {
          ...baseDoc,
          rawSample,
        }
      : {
          ...baseDoc,
          rawEncrypted: encryptJson({ rows: rawRows }),
          rawSample, // anonymized sample only
        };

  await adminDb.collection("datasets").doc(datasetId).set(datasetDoc);

  // Public copy contains only anonymized/aggregated data.
  await adminDb.collection("publicDatasets").doc(datasetId).set({
    datasetId,
    dataType: body.data.dataType,
    createdAtMs,
    aggregates,
    sample: rawSample,
  });

  await logAudit({
    action: "UPLOAD_DATASET",
    actorUid: session.uid,
    actorEmail: session.email,
    actorRole: session.role,
    targetType: "DATASET",
    targetId: datasetId,
    metadata: {
      dataType: body.data.dataType,
      sensitivityLevel: body.data.sensitivityLevel,
        retentionPeriodDays,
        retentionAction,
        retentionRuleId,
      recordCount: aggregates.recordCount,
    },
  });

  return NextResponse.json({ ok: true, datasetId });
}


