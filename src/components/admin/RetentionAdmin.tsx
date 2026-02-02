"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Rule = {
  id: string;
  dataType: string;
  sensitivityLevel: string;
  daysToRetain: number;
  action: "DELETE" | "ARCHIVE";
};

export function RetentionAdmin() {
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [dataType, setDataType] = useState("any");
  const [sensitivityLevel, setSensitivityLevel] = useState("any");
  const [daysToRetain, setDaysToRetain] = useState(30);
  const [action, setAction] = useState<Rule["action"]>("ARCHIVE");

  async function refresh() {
    const res = await fetch("/api/admin/retentionRules");
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(json?.error ?? "Failed to load rules");
    setRules((json.rules ?? []) as Rule[]);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Retention policies</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Matching rules override provider-supplied retention periods for compliance.
          </p>
        </div>
        <Button variant="secondary" onClick={() => refresh()} disabled={!rules}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">Create rule</div>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-800">Data type</div>
            <select
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
            >
              <option value="any">Any</option>
              <option value="air">Air</option>
              <option value="water">Water</option>
              <option value="noise">Noise</option>
              <option value="emissions">Emissions</option>
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-800">
              Sensitivity
            </div>
            <select
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={sensitivityLevel}
              onChange={(e) => setSensitivityLevel(e.target.value)}
            >
              <option value="any">Any</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="SENSITIVE">SENSITIVE</option>
              <option value="RESTRICTED">RESTRICTED</option>
            </select>
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-800">Days</div>
            <input
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              type="number"
              min={1}
              max={3650}
              value={daysToRetain}
              onChange={(e) => setDaysToRetain(Number(e.target.value))}
            />
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-800">Action</div>
            <select
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
            >
              <option value="ARCHIVE">ARCHIVE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
        </div>

        <div className="mt-3">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const res = await fetch("/api/admin/retentionRules", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ dataType, sensitivityLevel, daysToRetain, action }),
                });
                const json = (await res.json().catch(() => null)) as any;
                if (!res.ok) throw new Error(json?.error ?? "Failed to create rule");
                await refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">Rules</div>
        {!rules ? (
          <div className="text-sm text-zinc-600">Loading…</div>
        ) : rules.length === 0 ? (
          <div className="text-sm text-zinc-600">No rules yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Data type</th>
                  <th className="py-2">Sensitivity</th>
                  <th className="py-2">Days</th>
                  <th className="py-2">Action</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-100">
                    <td className="py-2 font-medium text-zinc-900">{r.dataType}</td>
                    <td className="py-2 text-zinc-700">{r.sensitivityLevel}</td>
                    <td className="py-2 text-zinc-700">{r.daysToRetain}</td>
                    <td className="py-2 text-zinc-700">{r.action}</td>
                    <td className="py-2 text-right">
                      <button
                        className="text-red-700 hover:underline"
                        onClick={async () => {
                          setBusy(true);
                          setError(null);
                          try {
                            const res = await fetch(`/api/admin/retentionRules/${r.id}`, {
                              method: "DELETE",
                            });
                            const json = (await res.json().catch(() => null)) as any;
                            if (!res.ok) throw new Error(json?.error ?? "Failed to delete rule");
                            await refresh();
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Failed");
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Delete
                      </button>
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


