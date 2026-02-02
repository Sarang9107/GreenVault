import { NavBar } from "@/components/NavBar";
import { getSession } from "@/lib/auth/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <div className="min-h-screen bg-zinc-50">
      <NavBar session={session} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}


