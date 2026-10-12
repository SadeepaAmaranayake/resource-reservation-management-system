"use client";

import { useActionState } from "react";
import { createReservation, type ReservationActionState } from "./actions";

type ResourceOption = { id: string; name: string; category: string };
const initialState: ReservationActionState = {};
const fieldClass = "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export function BookingForm({ resources }: { resources: ResourceOption[] }) {
  const [state, action, pending] = useActionState(createReservation, initialState);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Resource
        <select className={fieldClass} name="resourceId" required defaultValue="">
          <option value="" disabled>Select a resource</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.name} · {resource.category}</option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Starts
          <input className={fieldClass} type="datetime-local" name="startTime" required />
        </label>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Ends
          <input className={fieldClass} type="datetime-local" name="endTime" required />
        </label>
      </div>

      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Purpose
        <textarea className={`${fieldClass} min-h-28 resize-y`} name="purpose" required minLength={3} maxLength={500} placeholder="What do you need this resource for?" />
      </label>

      <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        Times are interpreted in your browser’s local time zone. Your request will be pending until an administrator reviews it.
      </p>

      {state.error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">{state.success}</p>}

      <button disabled={pending || resources.length === 0} className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {pending ? "Checking availability…" : "Request reservation"}
      </button>
    </form>
  );
}
