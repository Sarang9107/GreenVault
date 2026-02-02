"use client";

import Papa from "papaparse";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Row = Record<string, string | number | boolean | null>;

function coerceValue(v: unknown) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" || typeof v === "boolean") return v;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isNaN(n) && Number.isFinite(n)) return n;
  if (s.toLowerCase() === "true") return true;
  if (s.toLowerCase() === "false") return false;
  return s;
}

export function UploadDatasetForm() {
  const [dataType, setDataType] = useState<"air" | "water" | "noise" | "emissions">(
    "air"
  );
  const [sensitivityLevel, setSensitivityLevel] = useState<
    "PUBLIC" | "SENSITIVE" | "RESTRICTED"
  >("PUBLIC");
  const [retentionPeriodDays, setRetentionPeriodDays] = useState<number>(30);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const preview = useMemo(() => rows.slice(0, 10), [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Upload dataset</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Upload a small CSV or JSON file for demo purposes. Sensitive payloads
          are encrypted at rest; public access is aggregated/anonymized only.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <label className="block">
          <div className="mb-1 text-sm font-medium text-zinc-800">Data type</div>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as any)}
          >
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
            onChange={(e) => setSensitivityLevel(e.target.value as any)}
          >
            <option value="PUBLIC">Public</option>
            <option value="SENSITIVE">Sensitive</option>
            <option value="RESTRICTED">Restricted</option>
          </select>
        </label>

        <Input
          label="Retention (days)"
          type="number"
          min={1}
          max={3650}
          value={retentionPeriodDays}
          onChange={(e) => setRetentionPeriodDays(Number(e.target.value))}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-zinc-900">File</div>
        <input
          type="file"
          accept=".csv,application/json"
          onChange={async (e) => {
            setError(null);
            setOk(null);
            const file = e.target.files?.[0];
            if (!file) return;

            const text = await file.text();
            if (file.name.toLowerCase().endsWith(".json")) {
              const parsed = JSON.parse(text);
              if (!Array.isArray(parsed)) {
                setError("JSON must be an array of objects.");
                return;
              }
              setRows(
                (parsed as any[]).slice(0, 2000).map((r) => {
                  const out: Row = {};
                  for (const [k, v] of Object.entries(r ?? {})) out[k] = coerceValue(v);
                  return out;
                })
              );
              return;
            }

            const result = Papa.parse<Record<string, string>>(text, {
              header: true,
              skipEmptyLines: true,
            });
            if (result.errors?.length) {
              setError(result.errors[0]?.message ?? "Failed to parse CSV.");
              return;
            }
            setRows(
              (result.data ?? []).slice(0, 2000).map((r) => {
                const out: Row = {};
                for (const [k, v] of Object.entries(r)) out[k] = coerceValue(v);
                return out;
              })
            );
          }}
        />

        <div className="mt-3 text-sm text-zinc-600">
          Parsed rows: <span className="font-medium text-zinc-900">{rows.length}</span>
        </div>

        {preview.length ? (
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-zinc-50 p-3 text-xs">
            {JSON.stringify(preview, null, 2)}
          </pre>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {ok}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button
          disabled={busy || rows.length === 0}
          onClick={async () => {
            setBusy(true);
            setError(null);
            setOk(null);
            try {
              const res = await fetch("/api/datasets", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  dataType,
                  sensitivityLevel,
                  retentionPeriodDays,
                  rows,
                }),
              });
              const json = (await res.json().catch(() => null)) as
                | { ok: true; datasetId: string }
                | { error?: string }
                | null;
              if (!res.ok) throw new Error((json as any)?.error ?? "Upload failed.");
              setOk(`Uploaded dataset ${((json as any)?.datasetId as string) ?? ""}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Upload failed.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Uploading…" : "Upload"}
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setRows([]);
            setOk(null);
            setError(null);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}


