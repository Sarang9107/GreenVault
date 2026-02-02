"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type UserRow = {
  uid: string;
  email: string;
  role: "ADMIN" | "PROVIDER" | "PUBLIC";
};

export function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/users");
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(json?.error ?? "Failed to load users");
    setUsers((json.users ?? []) as UserRow[]);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Users & roles</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Admins can grant/revoke roles. Users cannot self-escalate roles.
          </p>
        </div>
        <Button variant="secondary" onClick={() => refresh()} disabled={!users}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        {!users ? (
          <div className="text-sm text-zinc-600">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Email</th>
                  <th className="py-2">UID</th>
                  <th className="py-2">Role</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-t border-zinc-100">
                    <td className="py-2 font-medium text-zinc-900">{u.email}</td>
                    <td className="py-2 font-mono text-xs text-zinc-700">{u.uid}</td>
                    <td className="py-2">
                      <select
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm"
                        value={u.role}
                        disabled={busyUid === u.uid}
                        onChange={async (e) => {
                          const role = e.target.value as UserRow["role"];
                          setBusyUid(u.uid);
                          setError(null);
                          try {
                            const res = await fetch(`/api/admin/users/${u.uid}`, {
                              method: "PATCH",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({ role }),
                            });
                            const json = (await res.json().catch(() => null)) as any;
                            if (!res.ok) throw new Error(json?.error ?? "Failed to update role");
                            setUsers((prev) =>
                              (prev ?? []).map((p) => (p.uid === u.uid ? { ...p, role } : p))
                            );
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed");
                          } finally {
                            setBusyUid(null);
                          }
                        }}
                      >
                        <option value="PUBLIC">PUBLIC</option>
                        <option value="PROVIDER">PROVIDER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-2 text-right text-xs text-zinc-500">
                      {busyUid === u.uid ? "Saving…" : ""}
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


