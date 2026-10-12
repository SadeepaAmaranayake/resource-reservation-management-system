import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "USER") redirect("/admin/resources");

  let resources;
  try {
    resources = await prisma.resource.findMany({
      where: { status: "AVAILABLE" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: { id: true, name: true, category: true },
    });
  } catch {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6">
        <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Could not load available resources</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Check that Prisma Client has been generated and your Supabase database connection is configured.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">Resource booking</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Request a reservation</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Choose an available resource and a time slot. The server checks for conflicting pending and approved reservations before saving your request.</p>
        </header>
        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="font-medium">No resources are currently available.</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Please check again later.</p>
          </div>
        ) : <BookingForm resources={resources} />}
      </div>
    </main>
  );
}
