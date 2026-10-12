import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResourceManager } from "./resource-manager";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  let resources;
  try {
    resources = await prisma.resource.findMany({
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        status: true,
      },
    });
  } catch {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Could not load resources</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            The database request failed. Check that Prisma Client has been generated and that your Supabase database connection is configured.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Resource management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Add resources, update their details, and manage whether they can be reserved.
          </p>
        </header>
        <ResourceManager resources={resources} />
      </div>
    </main>
  );
}
