export type RetentionRule = {
  id: string;
  dataType: string; // "air" | "water" | "noise" | "emissions" | "any"
  sensitivityLevel: string; // "PUBLIC" | "SENSITIVE" | "RESTRICTED" | "any"
  daysToRetain: number;
  action: "DELETE" | "ARCHIVE";
};

export function pickBestRetentionRule(
  rules: RetentionRule[],
  input: { dataType: string; sensitivityLevel: string }
) {
  let best: { rule: RetentionRule; score: number } | null = null;
  for (const r of rules) {
    if (!(r.dataType === "any" || r.dataType === input.dataType)) continue;
    if (
      !(
        r.sensitivityLevel === "any" ||
        r.sensitivityLevel === input.sensitivityLevel
      )
    )
      continue;

    const score =
      (r.dataType === input.dataType ? 1 : 0) +
      (r.sensitivityLevel === input.sensitivityLevel ? 1 : 0);
    if (!best || score > best.score) best = { rule: r, score };
  }
  return best?.rule ?? null;
}


