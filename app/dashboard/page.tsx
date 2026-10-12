import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationList } from "./reservation-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "ADMIN") redirect("/admin/reservations");

  let reservations;
  try {
    reservations = await prisma.reservation.findMany({
      where: { userId: session.id },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        purpose: true,
        resource: { select: { name: true, category: true } },
      },
    });
  } catch {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Could not load your reservations</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Check that Prisma Client has been generated and your Supabase database connection is configured.</p>
        </div>
      </main>
    );
  }

  const now = Date.now();
  const upcoming = reservations.filter((item) => item.endTime.getTime() >= now && item.status !== "CANCELLED" && item.status !== "REJECTED");
  const past = reservations.filter((item) => item.endTime.getTime() < now || item.status === "CANCELLED" || item.status === "REJECTED");
  const serialize = (items: typeof reservations) => items.map((item) => ({ ...item, startTime: item.startTime.toISOString(), endTime: item.endTime.toISOString() }));

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your dashboard</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Your upcoming and past reservations.</p>
          </div>
          <a href="/reservations" className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">Request a reservation</a>
        </div>
        <section className="mt-10 space-y-4">
          <div><h2 className="text-xl font-semibold">Upcoming</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Active reservations and requests.</p></div>
          <ReservationList reservations={serialize(upcoming)} />
        </section>
        <section className="mt-10 space-y-4">
          <div><h2 className="text-xl font-semibold">Past and closed</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Completed, rejected, and cancelled reservations.</p></div>
          <ReservationList reservations={serialize(past)} />
        </section>
      </div>
    </main>
  );
}
