import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Environmental Data Governance System
        </h1>
        <p className="mt-3 text-zinc-700">
          A demo-ready platform for privacy, retention, and compliance controls
          around environmental datasets (air, water, emissions, noise).
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/public"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Explore public trends
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Go to dashboard
          </Link>
        </div>

        <div className="mt-6 text-sm text-zinc-600">
          For hackathon demos: upload a small CSV/JSON, tag sensitivity, and watch
          retention + audit logs update instantly.
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">
          What this demo enforces
        </div>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li>
            <span className="font-medium text-zinc-900">RBAC</span>: Admin,
            Provider, Public
          </li>
          <li>
            <span className="font-medium text-zinc-900">Privacy</span>: public
            access is aggregated/anonymized only
          </li>
          <li>
            <span className="font-medium text-zinc-900">Retention</span>:
            auto-archive/delete by policy
          </li>
          <li>
            <span className="font-medium text-zinc-900">Auditability</span>: every
            action is logged
          </li>
        </ul>
      </div>
    </div>
  );
}


