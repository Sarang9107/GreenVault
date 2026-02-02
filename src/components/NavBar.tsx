import Link from "next/link";
import type { Role } from "@/lib/auth/roles";
import { canAccessAdmin, canAccessProvider } from "@/lib/auth/roles";
import { UserMenu } from "@/components/UserMenu";

export function NavBar(props: { session: { email: string; role: Role } | null }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-zinc-900">
            Environmental Data Governance System
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-zinc-700 sm:flex">
            <Link className="hover:text-zinc-900" href="/public">
              Public
            </Link>
            {props.session ? (
              <Link className="hover:text-zinc-900" href="/dashboard">
                Dashboard
              </Link>
            ) : null}
            {props.session && canAccessProvider(props.session.role) ? (
              <Link className="hover:text-zinc-900" href="/provider">
                Provider
              </Link>
            ) : null}
            {props.session && canAccessAdmin(props.session.role) ? (
              <Link className="hover:text-zinc-900" href="/admin">
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {props.session ? (
            <UserMenu email={props.session.email} role={props.session.role} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                href="/signup"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


