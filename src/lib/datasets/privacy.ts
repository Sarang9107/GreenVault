type Primitive = string | number | boolean | null;
export type RecordRow = Record<string, Primitive>;

const SUSPICIOUS_KEYS = new Set(
  [
    "name",
    "fullName",
    "email",
    "phone",
    "address",
    "street",
    "zipcode",
    "postalCode",
    "ip",
    "deviceId",
    "userId",
    "uid",
  ].map((k) => k.toLowerCase())
);

export function anonymizeRows(rows: RecordRow[]) {
  return rows.map((row) => {
    const out: RecordRow = {};
    for (const [k, v] of Object.entries(row)) {
      if (SUSPICIOUS_KEYS.has(k.toLowerCase())) continue;
      out[k] = v;
    }
    return out;
  });
}

export function computeAggregates(rows: RecordRow[]) {
  const recordCount = rows.length;
  const fieldSet = new Set<string>();

  const numericStats: Record<
    string,
    { min: number; max: number; sum: number; count: number }
  > = {};

  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      fieldSet.add(k);
      if (typeof v === "number" && Number.isFinite(v)) {
        const s = numericStats[k] ?? {
          min: v,
          max: v,
          sum: 0,
          count: 0,
        };
        s.min = Math.min(s.min, v);
        s.max = Math.max(s.max, v);
        s.sum += v;
        s.count += 1;
        numericStats[k] = s;
      }
    }
  }

  const numeric: Record<string, { min: number; max: number; avg: number }> = {};
  for (const [k, s] of Object.entries(numericStats)) {
    numeric[k] = {
      min: s.min,
      max: s.max,
      avg: s.count ? s.sum / s.count : 0,
    };
  }

  return {
    recordCount,
    fields: Array.from(fieldSet).sort(),
    numeric,
  };
}


