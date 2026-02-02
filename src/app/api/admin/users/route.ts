import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession, jsonError } from "@/lib/auth/server";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return jsonError(401, "UNAUTHENTICATED");
  if (session.role !== "ADMIN") return jsonError(403, "FORBIDDEN");

  const snap = await getAdminDb()
    .collection("users")
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();

  const users = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      uid: d.id,
      email: data.email ?? "",
      role: data.role ?? "PUBLIC",
      createdAt: data.createdAt ?? null,
      lastLoginAt: data.lastLoginAt ?? null,
    };
  });

  return NextResponse.json({ users });
}


