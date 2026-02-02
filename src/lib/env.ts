import { z } from "zod";

const boolFromString = (v: string | undefined) => v === "1" || v === "true";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

const ServerEnvSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  FIELD_ENCRYPTION_KEY_BASE64: z.string().min(1),
  BOOTSTRAP_ADMIN_EMAILS: z.string().optional(),
  // Optional toggles
  ALLOW_PUBLIC_SIGNUP: z.boolean().optional(),
});

let _publicEnv: z.infer<typeof PublicEnvSchema> | null = null;
export function getPublicEnv() {
  if (_publicEnv) return _publicEnv;
  _publicEnv = PublicEnvSchema.parse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  return _publicEnv;
}

let _serverEnv: z.infer<typeof ServerEnvSchema> | null = null;
export function getServerEnv() {
  if (_serverEnv) return _serverEnv;
  _serverEnv = ServerEnvSchema.parse({
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
    FIELD_ENCRYPTION_KEY_BASE64: process.env.FIELD_ENCRYPTION_KEY_BASE64,
    BOOTSTRAP_ADMIN_EMAILS: process.env.BOOTSTRAP_ADMIN_EMAILS,
    ALLOW_PUBLIC_SIGNUP: boolFromString(process.env.ALLOW_PUBLIC_SIGNUP),
  });
  return _serverEnv;
}


