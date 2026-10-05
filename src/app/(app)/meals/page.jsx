import Link from "next/link";
import MealEntryForm from "@/components/MealEntryForm";
import MonthPicker from "@/components/MonthPicker";
import { Badge, Card, Icon, Notice, PageHeader, buttonClass, inputClass } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { addDays, daysInMonth, formatDate, formatMonth, isValidDate, isValidMonth, monthOf, todayISO } from "@/lib/dates";
import { getMealsForDate, getMealsForMonth } from "@/services/meals";
import { listMembers } from "@/services/members";
import { getMonthStatus } from "@/services/months";
import { saveMealsAction } from "./actions";

export const metadata = { title: "Meals · Meal Manager" };

export default async function MealsPage({ searchParams }) {
  const me = await requireMember();
  const params = await searchParams;
  const today = todayISO();
  const date = isValidDate(params.date) ? params.date : today;
  const month = isValidMonth(params.month) ? params.month : monthOf(date);
  const isAdmin = me.role === "admin";

  const [members, dayEntries, monthEntries, dayStatus, sheetStatus] = await Promise.all([
    listMembers(),
    getMealsForDate(date),
    getMealsForMonth(month),
    getMonthStatus(monthOf(date)),
    getMonthStatus(month),
  ]);

  const dayByMember = new Map(dayEntries.map((e) => [e.member, e]));
  const dayRows = members
    .filter((m) => m.active || dayByMember.has(m.id))
    .map((m) => ({
      memberId: m.id,
      name: m.name,
      lunch: dayByMember.get(m.id)?.lunch ?? 0,
      dinner: dayByMember.get(m.id)?.dinner ?? 0,
      defaultLunch: m.defaultMeals.lunch,
      defaultDinner: m.defaultMeals.dinner,
      canEdit: dayStatus === "open" && (isAdmin || (m.id === me.id && date >= today)),
    }));

  const sheet = new Map(monthEntries.map((e) => [`${e.member}|${e.date}`, e]));
  const sheetMembers = members.filter((m) => m.active || monthEntries.some((e) => e.member === m.id));
  const memberTotal = (id) =>
    monthEntries.filter((e) => e.member === id).reduce((sum, e) => sum + e.lunch + e.dinner, 0);
  const days = daysInMonth(month);
  const monthTotal = monthEntries.reduce((sum, e) => sum + e.lunch + e.dinner, 0);

  return (
    <>
      <PageHeader title="Meals" subtitle="Each lunch or dinner counts as 1 meal. Add guests as extra meals for the host." />

      <Card
        title={
          <span className="flex items-center gap-2">
            {formatDate(date)}
            {date === today && <Badge tone="green">Today</Badge>}
          </span>
        }
        description={isAdmin ? "You can change meals for everyone." : "You can change your own meals for today and future days."}
        className="mb-8"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/meals?date=${addDays(date, -1)}`} className={buttonClass.icon} aria-label="Previous day">
              <Icon name="left" className="h-4 w-4" />
            </Link>
            <form method="get" className="flex items-center gap-2">
              <input type="date" name="date" defaultValue={date} className={`${inputClass} w-auto`} aria-label="Pick a date" />
              <button type="submit" className={buttonClass.secondary}>
                Go
              </button>
            </form>
            <Link href={`/meals?date=${addDays(date, 1)}`} className={buttonClass.icon} aria-label="Next day">
              <Icon name="right" className="h-4 w-4" />
            </Link>
            {date !== today && (
              <Link href="/meals" className={buttonClass.ghost}>
                Today
              </Link>
            )}
          </div>
        }
      >
        {dayStatus === "closed" && <Notice>{formatMonth(monthOf(date))} is closed, so meals can&apos;t be changed.</Notice>}
        {dayStatus === "open" && !isAdmin && date < today && (
          <Notice tone="gray">Past days can only be changed by the admin.</Notice>
        )}
        <MealEntryForm key={date} date={date} rows={dayRows} action={saveMealsAction} />
      </Card>

      <Card
        title="Monthly sheet"
        description={`Lunch / dinner for each day · ${monthTotal} meals in total`}
        action={<MonthPicker basePath="/meals" month={month} />}
      >
        {sheetStatus === "closed" && <Notice tone="gray">This month is closed.</Notice>}
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-max text-sm tabular-nums">
            <thead>
              <tr className="bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="sticky left-0 bg-zinc-50 py-2.5 pl-5 pr-3 text-left sm:pl-6">Day</th>
                {sheetMembers.map((m) => (
                  <th key={m.id} className="whitespace-nowrap px-3 py-2.5 text-center last:pr-5 sm:last:pr-6">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d} className={`border-t border-zinc-100 ${d === today ? "bg-emerald-50/70" : "hover:bg-zinc-50/60"}`}>
                  <td className="sticky left-0 whitespace-nowrap bg-inherit py-2 pl-5 pr-3 sm:pl-6">
                    <Link href={`/meals?date=${d}`} className="font-medium text-zinc-700 hover:text-emerald-700">
                      {formatDate(d)}
                    </Link>
                  </td>
                  {sheetMembers.map((m) => {
                    const e = sheet.get(`${m.id}|${d}`);
                    return (
                      <td key={m.id} className="px-3 py-2 text-center text-zinc-700 last:pr-5 sm:last:pr-6">
                        {e && e.lunch + e.dinner > 0 ? `${e.lunch} / ${e.dinner}` : <span className="text-zinc-300">–</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 bg-emerald-50/50 font-semibold text-emerald-800">
                <td className="sticky left-0 bg-emerald-50 py-3 pl-5 pr-3 sm:pl-6">Total meals</td>
                {sheetMembers.map((m) => (
                  <td key={m.id} className="px-3 py-3 text-center last:pr-5 sm:last:pr-6">
                    {memberTotal(m.id)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </>
  );
}
