import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Your dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Signed in as {session.role.toLowerCase()}.</p>
        {session.role === "USER" && (
          <a href="/reservations" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Request a reservation
          </a>
        )}
        {session.role === "ADMIN" && (
          <a href="/admin/resources" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Manage resources
          </a>
        )}
      </div>
    </main>
  );
}
