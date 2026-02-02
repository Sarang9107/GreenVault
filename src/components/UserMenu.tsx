"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/lib/auth/roles";

export function UserMenu(props: { email: string; role: Role; showProfile?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (props.showProfile) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
            {props.email.charAt(0).toUpperCase()}
          </div>
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg">
            <div className="p-3 border-b border-zinc-200">
              <div className="text-sm font-medium text-zinc-900">{props.email}</div>
              <div className="text-xs text-zinc-600">{props.role}</div>
            </div>
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  await fetch("/api/session/logout", { method: "POST" });
                } finally {
                  setBusy(false);
                  router.replace("/login");
                  router.refresh();
                }
              }}
              disabled={busy}
              className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <div className="text-sm font-medium text-zinc-900">{props.email}</div>
        <div className="text-xs text-zinc-600">{props.role}</div>
      </div>
      <Button
        variant="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await fetch("/api/session/logout", { method: "POST" });
          } finally {
            setBusy(false);
            router.replace("/login");
            router.refresh();
          }
        }}
      >
        Sign out
      </Button>
    </div>
  );
}


