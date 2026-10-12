import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationReview } from "./reservation-review";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  let reservations;
  try {
    reservations = await prisma.reservation.findMany({
      orderBy: [{ status: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        purpose: true,
        user: { select: { name: true, email: true } },
        resource: { select: { name: true, category: true } },
      },
    });
  } catch {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Could not load reservations</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Check that Prisma Client has been generated and your Supabase database connection is configured.</p>
        </div>
      </main>
    );
  }

  const serialized = reservations.map((reservation) => ({
    ...reservation,
    startTime: reservation.startTime.toISOString(),
    endTime: reservation.endTime.toISOString(),
  }));
  const pendingCount = reservations.filter((reservation) => reservation.status === "PENDING").length;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Reservation requests</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Review requests and see organization-wide reservation status.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="font-semibold">{pendingCount}</span><span className="ml-2 text-zinc-500 dark:text-zinc-400">pending review</span>
          </div>
        </header>
        <ReservationReview reservations={serialized} />
      </div>
    </main>
  );
}
