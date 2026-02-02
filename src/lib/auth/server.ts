import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";
import type { Role } from "./roles";

export type Session = {
  uid: string;
  email: string;
  role: Role;
};

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token);
    return { uid: payload.uid, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}


