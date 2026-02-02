"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type PublicDataset = {
  id: string;
  dataType: string;
  createdAtMs: number;
  aggregates: Record<string, unknown>;
};

export function PublicDashboard() {
  const [data, setData] = useState<PublicDataset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/datasets");
        const json = (await res.json()) as { datasets: PublicDataset[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed to load public datasets");
        if (!cancelled) setData(json.datasets);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    // Demo trend: count uploads per day (by createdAtMs).
    const byDay = new Map<string, number>();
    for (const d of data) {
      const day = new Date(d.createdAtMs).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count }));
  }, [data]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }
  if (!data) {
    return <div className="text-sm text-zinc-600">Loading public trends…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Public Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Only anonymized and aggregated data is shown here.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">
          Upload activity (demo trend)
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">Datasets</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Created</th>
                <th className="py-2">Aggregates</th>
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => b.createdAtMs - a.createdAtMs)
                .slice(0, 25)
                .map((d) => (
                  <tr key={d.id} className="border-t border-zinc-100">
                    <td className="py-2 font-medium text-zinc-900">{d.dataType}</td>
                    <td className="py-2 text-zinc-700">
                      {new Date(d.createdAtMs).toLocaleString()}
                    </td>
                    <td className="py-2 text-zinc-700">
                      <pre className="max-w-xl overflow-x-auto rounded bg-zinc-50 p-2 text-xs">
                        {JSON.stringify(d.aggregates, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


