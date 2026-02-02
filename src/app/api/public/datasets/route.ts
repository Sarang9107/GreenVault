import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  const snap = await getAdminDb()
    .collection("publicDatasets")
    .orderBy("createdAtMs", "desc")
    .limit(200)
    .get();

  const datasets = snap.docs.map((d) => {
    const data = d.data() as {
      dataType?: string;
      createdAtMs?: number;
      aggregates?: Record<string, unknown>;
    };
    return {
      id: d.id,
      dataType: data.dataType ?? "unknown",
      createdAtMs: data.createdAtMs ?? Date.now(),
      aggregates: data.aggregates ?? {},
    };
  });

  return NextResponse.json({ datasets });
}


