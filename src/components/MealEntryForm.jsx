"use client";

import { useState } from "react";
import { Avatar, Icon, buttonClass } from "./ui";
import { useToastAction } from "./useToastAction";

function Stepper({ label, value, onChange, disabled }) {
  const stepClass =
    "grid h-8 w-8 place-items-center rounded-lg text-zinc-600 transition hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none";
  return (
    <div className={`inline-flex items-center gap-1 rounded-xl p-1 ${disabled ? "bg-transparent" : "bg-zinc-100"}`}>
      {!disabled && (
        <button type="button" aria-label={`Less ${label}`} disabled={value <= 0} onClick={() => onChange(value - 1)} className={stepClass}>
          <span className="text-lg leading-none">−</span>
        </button>
      )}
      <span className={`w-8 text-center text-base font-semibold tabular-nums ${value > 0 ? "text-zinc-900" : "text-zinc-400"}`}>
        {value}
      </span>
      {!disabled && (
        <button type="button" aria-label={`More ${label}`} disabled={value >= 10} onClick={() => onChange(value + 1)} className={stepClass}>
          <Icon name="plus" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// rows: [{ memberId, name, lunch, dinner, defaultLunch, defaultDinner, canEdit }]
export default function MealEntryForm({ date, rows, action }) {
  const [, formAction, pending] = useToastAction(action);
  const [values, setValues] = useState(() =>
    Object.fromEntries(rows.map((r) => [r.memberId, { lunch: r.lunch, dinner: r.dinner }]))
  );

  const editable = rows.filter((r) => r.canEdit);
  const setMeal = (memberId, slot, value) =>
    setValues((prev) => ({ ...prev, [memberId]: { ...prev[memberId], [slot]: value } }));

  const fillDefaults = () =>
    setValues((prev) => {
      const next = { ...prev };
      for (const r of editable) next[r.memberId] = { lunch: r.defaultLunch, dinner: r.defaultDinner };
      return next;
    });

  const totalLunch = rows.reduce((sum, r) => sum + values[r.memberId].lunch, 0);
  const totalDinner = rows.reduce((sum, r) => sum + values[r.memberId].dinner, 0);

  return (
    <form action={formAction}>
      <input type="hidden" name="date" value={date} />
      <div className="-mx-5 overflow-x-auto sm:-mx-6">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th className="py-2.5 pl-5 pr-3 text-left sm:pl-6">Member</th>
              <th className="px-3 py-2.5 text-center">Lunch</th>
              <th className="py-2.5 pl-3 pr-5 text-center sm:pr-6">Dinner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.memberId} className="border-t border-zinc-100">
                <td className="py-3 pl-5 pr-3 sm:pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} size="sm" />
                    <span className="font-medium text-zinc-900">{r.name}</span>
                  </div>
                </td>
                {["lunch", "dinner"].map((slot) => (
                  <td key={slot} className="px-3 py-3 text-center last:pr-5 sm:last:pr-6">
                    <Stepper
                      label={`${slot} for ${r.name}`}
                      value={values[r.memberId][slot]}
                      disabled={!r.canEdit}
                      onChange={(v) => setMeal(r.memberId, slot, v)}
                    />
                    {r.canEdit && <input type="hidden" name={`${slot}:${r.memberId}`} value={values[r.memberId][slot]} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 bg-emerald-50/50">
              <td className="py-3 pl-5 pr-3 font-medium text-emerald-900 sm:pl-6">Plates to cook</td>
              <td className="px-3 py-3 text-center text-lg font-semibold tabular-nums text-emerald-700">{totalLunch}</td>
              <td className="py-3 pl-3 pr-5 text-center text-lg font-semibold tabular-nums text-emerald-700 sm:pr-6">{totalDinner}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {editable.length > 0 && (
          <>
            <button type="submit" disabled={pending} className={buttonClass.primary}>
              <Icon name="check" className="h-4 w-4" />
              {pending ? "Saving…" : "Save meals"}
            </button>
            <button type="button" onClick={fillDefaults} className={buttonClass.secondary}>
              Fill usual meals
            </button>
          </>
        )}
      </div>
    </form>
  );
}
