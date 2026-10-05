import Link from "next/link";
import { Avatar, Card, Icon, PageHeader, Stat, balanceTone, buttonClass, table } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { formatDate, formatMonth, monthOf, todayISO } from "@/lib/dates";
import { formatNumber, formatTaka } from "@/lib/money";
import { getMealsForDate } from "@/services/meals";
import { listMembers } from "@/services/members";
import { getMonthReport } from "@/services/months";

export const metadata = { title: "Dashboard · Meal Manager" };

export default async function DashboardPage() {
  const me = await requireMember();
  const today = todayISO();
  const month = monthOf(today);

  const [report, todayMeals, members] = await Promise.all([getMonthReport(month), getMealsForDate(today), listMembers()]);
  const mine = report.rows.find((r) => r.memberId === me.id);
  const myBalance = mine?.balance ?? 0;
  const todayByMember = new Map(todayMeals.map((e) => [e.member, e]));
  const todayRows = members.filter((m) => m.active || todayByMember.has(m.id));
  const plates = (slot) => todayMeals.reduce((sum, e) => sum + e[slot], 0);

  return (
    <>
      <PageHeader title={`Hello, ${me.name.split(" ")[0]} 👋`} subtitle={`Here is how ${formatMonth(month)} is going so far.`}>
        <Link href="/meals" className={buttonClass.primary}>
          <Icon name="plus" className="h-4 w-4" />
          Enter today&apos;s meals
        </Link>
      </PageHeader>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Meal rate" value={formatTaka(report.mealRate)} hint="per meal this month" icon="scale" tone="brand" />
        <Stat label="Total meals" value={formatNumber(report.totalMeals)} hint="everyone together" icon="bowl" tone="brand" />
        <Stat label="Total bazar" value={formatTaka(report.bazarCost)} hint={`Shared bills ${formatTaka(report.sharedCost)}`} icon="cart" tone="brand" />
        <Stat label="Cash in hand" value={formatTaka(report.cashInHand)} hint="with the admin" icon="banknotes" tone={balanceTone(report.cashInHand)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-sm">
          <div className="text-sm font-medium text-emerald-100">My balance</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{formatTaka(myBalance)}</div>
          <p className="mt-2 text-sm text-emerald-50/90">
            {myBalance < -0.005 ? "You need to pay this amount." : myBalance > 0.005 ? "You will get this back." : "You are all settled."}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-5 text-sm">
            <div>
              <dt className="text-emerald-100">My meals</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{formatNumber(mine?.meals ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-emerald-100">My cost so far</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{formatTaka(mine?.cost ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-emerald-100">I have paid</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{formatTaka(mine?.credit ?? 0)}</dd>
            </div>
            <div>
              <dt className="text-emerald-100">Shared bills</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{formatTaka(mine?.sharedCost ?? 0)}</dd>
            </div>
          </dl>
        </section>

        <Card
          title="Today's meals"
          description={formatDate(today)}
          className="lg:col-span-2"
          action={
            <Link href="/meals" className={buttonClass.secondary}>
              Edit
            </Link>
          }
        >
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Member</th>
                  <th className={`${table.th} text-center`}>Lunch</th>
                  <th className={`${table.th} text-center`}>Dinner</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((m) => (
                  <tr key={m.id} className={table.tr}>
                    <td className={table.td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <span className="font-medium text-zinc-900">{m.name}</span>
                      </div>
                    </td>
                    <td className={`${table.td} text-center tabular-nums`}>{todayByMember.get(m.id)?.lunch ?? 0}</td>
                    <td className={`${table.td} text-center tabular-nums`}>{todayByMember.get(m.id)?.dinner ?? 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200 bg-emerald-50/50">
                  <td className={table.foot}>Plates to cook</td>
                  <td className={`${table.foot} text-center text-base tabular-nums`}>{plates("lunch")}</td>
                  <td className={`${table.foot} text-center text-base tabular-nums`}>{plates("dinner")}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
