"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type AuditRow = {
  id: string;
  action: string;
  actorEmail: string;
  actorRole: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export function AuditAdmin() {
  const [logs, setLogs] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState("");
  const [actorUid, setActorUid] = useState("");

  async function refresh() {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (actorUid) params.set("actorUid", actorUid);
    const res = await fetch(`/api/admin/auditLogs?${params.toString()}`);
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(json?.error ?? "Failed to load audit logs");
    setLogs((json.logs ?? []) as AuditRow[]);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Audit logs</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Every significant action is logged for compliance and traceability.
          </p>
        </div>
        <Button variant="secondary" onClick={() => refresh()} disabled={!logs}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <Input
          label="Filter by action"
          placeholder="UPLOAD_DATASET"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <Input
          label="Filter by actor UID"
          placeholder="uid..."
          value={actorUid}
          onChange={(e) => setActorUid(e.target.value)}
        />
        <div className="flex items-end">
          <Button
            className="w-full"
            onClick={() => {
              setError(null);
              refresh().catch((e) =>
                setError(e instanceof Error ? e.message : "Failed")
              );
            }}
          >
            Apply filters
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        {!logs ? (
          <div className="text-sm text-zinc-600">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="text-sm text-zinc-600">No logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Action</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Target</th>
                  <th className="py-2">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-zinc-100 align-top">
                    <td className="py-2 font-medium text-zinc-900">{l.action}</td>
                    <td className="py-2 text-zinc-700">{l.actorEmail}</td>
                    <td className="py-2 text-zinc-700">{l.actorRole}</td>
                    <td className="py-2 text-zinc-700">
                      {l.targetType ? `${l.targetType}:${l.targetId}` : "—"}
                    </td>
                    <td className="py-2 text-zinc-700">
                      <pre className="max-w-xl overflow-x-auto rounded bg-zinc-50 p-2 text-xs">
                        {JSON.stringify(l.metadata ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


