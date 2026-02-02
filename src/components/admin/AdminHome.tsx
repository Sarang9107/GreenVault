"use client";

import { useEffect, useState } from "react";
import { OverviewCards } from "@/components/admin/OverviewCards";
import { EnvironmentalTrendsChart } from "@/components/admin/EnvironmentalTrendsChart";
import { DatasetsTable } from "@/components/admin/DatasetsTable";
import { Spinner } from "@/components/ui/Spinner";

interface DashboardData {
  totalRecords: number;
  dataClassification: { Public: number; Internal: number; Restricted: number };
  activeRetentionPolicies: number;
  complianceStatus: number;
  recentDatasets: Array<{
    id: string;
    name: string;
    type: string;
    classification: "Public" | "Internal" | "Restricted";
    source: string;
    retention: string;
    status: "Active" | "Archived" | "Review";
  }>;
}

export function AdminHome() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const data = (await res.json()) as DashboardData;
        if (!cancelled) {
          setDashboardData(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-zinc-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards
        totalRecords={dashboardData.totalRecords}
        dataClassification={dashboardData.dataClassification}
        activeRetentionPolicies={dashboardData.activeRetentionPolicies}
        complianceStatus={dashboardData.complianceStatus}
      />

      {/* Environmental Trends Chart */}
      <EnvironmentalTrendsChart />

      {/* Recent Datasets Table */}
      <DatasetsTable datasets={dashboardData.recentDatasets} />
    </div>
  );
}


