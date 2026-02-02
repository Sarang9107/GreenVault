import { jwtVerify, SignJWT } from "jose";
import type { Role } from "./roles";

export const SESSION_COOKIE_NAME = "envds_session";

export type SessionPayload = {
  uid: string;
  email: string;
  role: Role;
};

function secretKey() {
  // Edge-compatible secret key for HS256
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Missing SESSION_SECRET (32+ chars). Add it to your environment variables."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  // 7 days for demo/dev convenience.
  const expiresInSeconds = 60 * 60 * 24 * 7;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });

  // Minimal runtime checking (roles are constrained by server issuance)
  return payload as unknown as SessionPayload & { exp: number; iat: number };
}


