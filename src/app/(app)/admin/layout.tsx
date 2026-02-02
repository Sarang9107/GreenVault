import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { getSession } from "@/lib/auth/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header title="Overview" session={session} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

