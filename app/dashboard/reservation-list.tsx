"use client";

import { useActionState } from "react";
import { cancelReservation, type DashboardActionState } from "./actions";

type Reservation = {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  purpose: string;
  resource: { name: string; category: string };
};

const initial: DashboardActionState = {};
const badge: Record<Reservation["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  CANCELLED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const [state, action, pending] = useActionState(cancelReservation, initial);
  const canCancel = reservation.status === "PENDING" || reservation.status === "APPROVED";

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-zinc-950 dark:text-white">{reservation.resource.name}</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{reservation.resource.category}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[reservation.status]}`}>
          {reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Starts</dt><dd className="mt-1 text-zinc-800 dark:text-zinc-200">{new Date(reservation.startTime).toLocaleString()}</dd></div>
        <div><dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ends</dt><dd className="mt-1 text-zinc-800 dark:text-zinc-200">{new Date(reservation.endTime).toLocaleString()}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Purpose</dt><dd className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{reservation.purpose}</dd></div>
      </dl>
      {canCancel && (
        <form action={action} className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <input type="hidden" name="reservationId" value={reservation.id} />
          <button disabled={pending} className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40">
            {pending ? "Cancelling…" : "Cancel reservation"}
          </button>
          {state.error && <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">{state.error}</p>}
          {state.success && <p role="status" className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{state.success}</p>}
        </form>
      )}
    </article>
  );
}

export function ReservationList({ reservations }: { reservations: Reservation[] }) {
  if (reservations.length === 0) {
    return <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">No reservations in this section.</div>;
  }
  return <div className="space-y-4">{reservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}</div>;
}
