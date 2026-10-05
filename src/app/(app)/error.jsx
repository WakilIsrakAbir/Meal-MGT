"use client";

import { Icon, buttonClass } from "@/components/ui";

export default function AppError({ error, reset }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
        <Icon name="info" className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-zinc-600">{error.message || "Please try again."}</p>
      <button type="button" onClick={() => reset()} className={`${buttonClass.secondary} mt-6`}>
        Try again
      </button>
    </div>
  );
}
