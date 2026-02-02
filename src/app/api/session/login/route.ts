import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";
import { logAudit } from "@/lib/audit";
import { getServerEnv } from "@/lib/env";
import { FieldValue } from "firebase-admin/firestore";

const BodySchema = z.object({
  idToken: z.string().min(1),
  requestedRole: z.enum(["PROVIDER", "PUBLIC"]).optional(),
});

function bootstrapAdminEmails() {
  const raw = getServerEnv().BOOTSTRAP_ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function POST(req: Request) {
  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const decoded = await getAdminAuth().verifyIdToken(body.data.idToken);
  const uid = decoded.uid;
  const email = decoded.email ?? "";
  if (!email) {
    return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });
  }

  const usersRef = getAdminDb().collection("users").doc(uid);
  const existing = await usersRef.get();

  const isBootstrapAdmin = bootstrapAdminEmails().has(email.toLowerCase());
  const role: Role = existing.exists
    ? (existing.data()?.role as Role) ?? "PUBLIC"
    : isBootstrapAdmin
      ? "ADMIN"
      : (body.data.requestedRole ?? "PUBLIC");

  if (!existing.exists) {
    await usersRef.set({
      uid,
      email,
      role,
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });
    await logAudit({
      action: "SIGNUP",
      actorUid: uid,
      actorEmail: email,
      actorRole: role,
      metadata: { requestedRole: body.data.requestedRole ?? null },
    });
  } else {
    // Keep existing role; only Admin can change roles via admin UI.
    await usersRef.set(
      { lastLoginAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }

  await logAudit({
    action: "LOGIN",
    actorUid: uid,
    actorEmail: email,
    actorRole: role,
  });

  const sessionToken = await createSessionToken({ uid, email, role });

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res;
}


