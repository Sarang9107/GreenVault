import { Suspense } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <Suspense fallback={<div className="text-sm text-zinc-600">Loading…</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}


