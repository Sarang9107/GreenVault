"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type DatasetRow = {
  id: string;
  dataType: string;
  sensitivityLevel: "PUBLIC" | "SENSITIVE" | "RESTRICTED";
  createdAtMs: number;
  recordCount: number;
  retentionPeriodDays: number;
  expiresAtMs: number;
};

export function ProviderDashboard() {
  const [datasets, setDatasets] = useState<DatasetRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/datasets");
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(json?.error ?? "Failed to load datasets");
    setDatasets((json?.datasets ?? []) as DatasetRow[]);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Data Provider Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage your uploaded datasets and retention settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/provider/upload">
            <Button>Upload</Button>
          </Link>
          <Button variant="secondary" onClick={() => refresh()} disabled={!datasets}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">
          Your datasets
        </div>
        {!datasets ? (
          <div className="text-sm text-zinc-600">Loading…</div>
        ) : datasets.length === 0 ? (
          <div className="text-sm text-zinc-600">
            No datasets yet. Upload a CSV/JSON to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Type</th>
                  <th className="py-2">Sensitivity</th>
                  <th className="py-2">Rows</th>
                  <th className="py-2">Expires</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.id} className="border-t border-zinc-100">
                    <td className="py-2 font-medium text-zinc-900">{d.dataType}</td>
                    <td className="py-2 text-zinc-700">{d.sensitivityLevel}</td>
                    <td className="py-2 text-zinc-700">{d.recordCount}</td>
                    <td className="py-2 text-zinc-700">
                      {new Date(d.expiresAtMs).toLocaleDateString()} ({d.retentionPeriodDays}d)
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        className="text-emerald-700 hover:underline"
                        href={`/provider/datasets/${d.id}`}
                      >
                        View
                      </Link>
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


