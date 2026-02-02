import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  if (session.role === "ADMIN") redirect("/admin");
  if (session.role === "PROVIDER") redirect("/provider");

  redirect("/public");
}


