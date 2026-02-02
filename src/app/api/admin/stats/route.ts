import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const snap = await getAdminDb()
    .collection("datasets")
    .orderBy("createdAtMs", "desc")
    .limit(200)
    .get();

  const bySensitivity: Record<string, number> = { PUBLIC: 0, SENSITIVE: 0, RESTRICTED: 0 };
  const byType: Record<string, number> = { air: 0, water: 0, noise: 0, emissions: 0 };

  for (const d of snap.docs) {
    const data = d.data() as any;
    const s = String(data.sensitivityLevel ?? "PUBLIC");
    const t = String(data.dataType ?? "air");
    bySensitivity[s] = (bySensitivity[s] ?? 0) + 1;
    byType[t] = (byType[t] ?? 0) + 1;
  }

  return NextResponse.json({
    totals: { datasetsSampled: snap.size },
    bySensitivity,
    byType,
  });
}


