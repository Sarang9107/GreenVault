"use client";

interface OverviewCardsProps {
  totalRecords: number;
  dataClassification: { Public: number; Internal: number; Restricted: number };
  activeRetentionPolicies: number;
  complianceStatus: number;
}

export function OverviewCards(props: OverviewCardsProps) {
  const classificationData = [
    { name: "Public", value: props.dataClassification.Public, color: "#10b981" },
    { name: "Internal", value: props.dataClassification.Internal, color: "#f59e0b" },
    { name: "Restricted", value: props.dataClassification.Restricted, color: "#ef4444" },
  ];

  const total = classificationData.reduce((sum, item) => sum + item.value, 0);
  const percentages = classificationData.map((item) => ({
    ...item,
    percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Records */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-600">Total Records</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900">
              {props.totalRecords.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>+5.2% this week</span>
            </div>
          </div>
          <div className="rounded-lg bg-zinc-100 p-3">
            <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Data Classification */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-600">Data Classification</div>
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        {/* Horizontal bar chart */}
        <div className="space-y-3">
          {percentages.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-20 text-xs font-medium text-zinc-700">{item.name}</div>
              <div className="flex-1">
                <div className="h-6 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color === "#10b981" ? "#10b981" : item.color === "#f59e0b" ? "#f59e0b" : "#ef4444"
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-xs font-semibold text-zinc-700">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Retention Policies */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-600">Active Retention Policies</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900">
              {props.activeRetentionPolicies} Active
            </div>
            <div className="mt-2 text-sm text-emerald-600">
              All systems operational
            </div>
          </div>
          <div className="rounded-lg bg-zinc-100 p-3">
            <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-600">Compliance Status</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900">
              {props.complianceStatus}%
            </div>
            <div className="mt-2 text-sm text-zinc-600">
              Target: 99.9%
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${props.complianceStatus}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-emerald-100 p-3">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

