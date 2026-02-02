"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import type { Role } from "@/lib/auth/roles";

async function setSessionCookie(params: {
  idToken: string;
  requestedRole?: Role;
}) {
  const res = await fetch("/api/session/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Failed to create session.");
  }
}

export function AuthForm(props: { mode: "login" | "signup" }) {
  const router = useRouter();
  const next = useSearchParams().get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState<Role>("PROVIDER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (props.mode === "login" ? "Sign in" : "Create account"),
    [props.mode]
  );

  return (
    <form
      className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
          const cred =
            props.mode === "login"
              ? await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
              : await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

          const idToken = await cred.user.getIdToken(true);
          await setSessionCookie({
            idToken,
            requestedRole: props.mode === "signup" ? requestedRole : undefined,
          });

          router.replace(next || "/dashboard");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="mb-4">
        <div className="text-xl font-semibold text-zinc-900">{title}</div>
        <div className="mt-1 text-sm text-zinc-600">
          Environmental Data Governance System
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          autoComplete={props.mode === "login" ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {props.mode === "signup" ? (
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-800">
              Account type
            </div>
            <select
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value as Role)}
            >
              <option value="PROVIDER">Data Provider</option>
              <option value="PUBLIC">Public</option>
            </select>
            <div className="mt-1 text-xs text-zinc-500">
              Admin roles can only be granted by an existing Admin.
            </div>
          </label>
        ) : null}

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              <span>Working…</span>
            </span>
          ) : (
            <span>{props.mode === "login" ? "Sign in" : "Create account"}</span>
          )}
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-zinc-600">
        {props.mode === "login" ? (
          <a className="text-emerald-700 hover:underline" href="/signup">
            Need an account? Sign up
          </a>
        ) : (
          <a className="text-emerald-700 hover:underline" href="/login">
            Already have an account? Sign in
          </a>
        )}
      </div>
    </form>
  );
}


