"use client";

import { useActionState } from "react";
import {
  createResource,
  deactivateResource,
  updateResource,
  type ResourceActionState,
} from "./actions";

type Resource = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "AVAILABLE" | "MAINTENANCE";
};

const emptyState: ResourceActionState = {};

function Feedback({ state }: { state: ResourceActionState }) {
  if (state.error) return <p role="alert" className="mt-3 text-sm text-rose-600 dark:text-rose-400">{state.error}</p>;
  if (state.success) return <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">{state.success}</p>;
  return null;
}

const inputClass = "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500";

function ResourceEditor({ resource }: { resource: Resource }) {
  const [state, action, pending] = useActionState(updateResource, emptyState);

  return (
    <form action={action} className="grid gap-4 border-t border-zinc-200 p-5 dark:border-zinc-800 sm:grid-cols-2">
      <input type="hidden" name="id" value={resource.id} />
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Name
        <input className={inputClass} name="name" defaultValue={resource.name} required minLength={2} maxLength={100} />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Category
        <input className={inputClass} name="category" defaultValue={resource.category} required minLength={2} maxLength={80} />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
        Description
        <textarea className={`${inputClass} min-h-24 resize-y`} name="description" defaultValue={resource.description} required minLength={5} maxLength={1000} />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Availability
        <select className={inputClass} name="status" defaultValue={resource.status}>
          <option value="AVAILABLE">Available</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </label>
      <div className="flex flex-wrap items-end gap-2">
        <button disabled={pending} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {resource.status !== "MAINTENANCE" && (
          <DeactivateButton id={resource.id} />
        )}
      </div>
      <div className="sm:col-span-2"><Feedback state={state} /></div>
    </form>
  );
}

function DeactivateButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deactivateResource, emptyState);
  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40">
        {pending ? "Updating…" : "Deactivate"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

function AddResourceForm() {
  const [state, action, pending] = useActionState(createResource, emptyState);
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Add a resource</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Add a room, device, or other reservable item.</p>
      </div>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Name
        <input className={inputClass} name="name" placeholder="e.g. Conference Room A" required minLength={2} maxLength={100} />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Category
        <input className={inputClass} name="category" placeholder="e.g. Meeting room" required minLength={2} maxLength={80} />
      </label>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
        Description
        <textarea className={`${inputClass} min-h-24 resize-y`} name="description" placeholder="Describe the resource and any useful details" required minLength={5} maxLength={1000} />
      </label>
      <div className="sm:col-span-2">
        <button disabled={pending} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60">
          {pending ? "Adding…" : "Add resource"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function ResourceManager({ resources }: { resources: Resource[] }) {
  return (
    <div className="space-y-8">
      <AddResourceForm />

      <section aria-labelledby="resource-list-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="resource-list-heading" className="text-lg font-semibold text-zinc-950 dark:text-white">All resources</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{resources.length} {resources.length === 1 ? "resource" : "resources"}</p>
          </div>
        </div>
        {resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">No resources yet</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Use the form above to add the first one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <article key={resource.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <h3 className="font-semibold text-zinc-950 dark:text-white">{resource.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{resource.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resource.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                    {resource.status === "AVAILABLE" ? "Available" : "Maintenance"}
                  </span>
                </div>
                <ResourceEditor resource={resource} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
