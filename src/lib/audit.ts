import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Role } from "@/lib/auth/roles";

export type AuditAction =
  | "SIGNUP"
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD_DATASET"
  | "VIEW_DATASET"
  | "DELETE_DATASET"
  | "SET_ROLE"
  | "SET_RETENTION_RULE"
  | "RUN_RETENTION";

export async function logAudit(input: {
  action: AuditAction;
  actorUid: string;
  actorEmail: string;
  actorRole: Role;
  targetType?: "USER" | "DATASET" | "RETENTION_RULE";
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await getAdminDb().collection("auditLogs").add({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
  });
}


