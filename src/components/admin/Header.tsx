"use client";

import { UserMenu } from "@/components/UserMenu";
import type { Role } from "@/lib/auth/roles";

export function Header(props: {
  title: string;
  session: { email: string; role: Role } | null;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-zinc-900">{props.title}</h1>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search datasets..."
              className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 pl-10 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          {props.session && (
            <span className="text-sm font-medium text-zinc-700">
              {props.session.role === "ADMIN" ? "Admin" : props.session.role}
            </span>
          )}

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Menu */}
          {props.session && (
            <UserMenu email={props.session.email} role={props.session.role} showProfile />
          )}
        </div>
      </div>
    </header>
  );
}

