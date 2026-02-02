import crypto from "node:crypto";
import { getServerEnv } from "@/lib/env";

/**
 * AES-256-GCM encryption for sensitive dataset payloads.
 * - Stores result as base64( iv(12) || tag(16) || ciphertext )
 */
function getKey() {
  const serverEnv = getServerEnv();
  const key = Buffer.from(serverEnv.FIELD_ENCRYPTION_KEY_BASE64, "base64");
  if (key.length !== 32) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY_BASE64 must be a base64-encoded 32-byte key."
    );
  }
  return key;
}

export function encryptJson(value: unknown) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);

  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptJson<T = unknown>(ciphertextB64: string): T {
  const buf = Buffer.from(ciphertextB64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}


