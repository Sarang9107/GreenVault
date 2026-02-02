"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function DatasetDetail(props: { id: string }) {
  const [dataset, setDataset] = useState<any | null>(null);
  const [raw, setRaw] = useState<any | null>(null);
  const [includeRaw, setIncludeRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    const res = await fetch(`/api/datasets/${props.id}?includeRaw=${includeRaw}`);
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) throw new Error(json?.error ?? "Failed to load dataset");
    setDataset(json.dataset);
    setRaw(json.raw);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, [includeRaw]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Dataset</h1>
          <p className="mt-1 text-sm text-zinc-600">ID: {props.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIncludeRaw((v) => !v)}>
            {includeRaw ? "Hide raw" : "Show raw"}
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const res = await fetch(`/api/datasets/${props.id}`, { method: "DELETE" });
                const json = (await res.json().catch(() => null)) as any;
                if (!res.ok) throw new Error(json?.error ?? "Delete failed");
                window.location.href = "/provider";
              } catch (e) {
                setError(e instanceof Error ? e.message : "Delete failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!dataset ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-zinc-900">Metadata</div>
            <pre className="max-h-[520px] overflow-auto rounded bg-zinc-50 p-3 text-xs">
              {JSON.stringify(dataset, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-2 text-sm font-semibold text-zinc-900">
              Raw payload (restricted)
            </div>
            {!includeRaw ? (
              <div className="text-sm text-zinc-600">
                Enable “Show raw” to decrypt/display raw data (owner/admin only).
              </div>
            ) : (
              <pre className="max-h-[520px] overflow-auto rounded bg-zinc-50 p-3 text-xs">
                {JSON.stringify(raw, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


