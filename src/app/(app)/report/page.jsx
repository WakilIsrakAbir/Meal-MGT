import ActionForm from "@/components/ActionForm";
import MonthPicker from "@/components/MonthPicker";
import PrintButton from "@/components/PrintButton";
import { Avatar, Badge, Card, Notice, PageHeader, Stat, balanceTone, table } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { formatMonth, isValidMonth, monthOf, todayISO } from "@/lib/dates";
import { formatNumber, formatTaka } from "@/lib/money";
import { getMonthReport } from "@/services/months";
import { closeMonthAction, reopenMonthAction } from "./actions";

export const metadata = { title: "Report · Meal Manager" };

const toneText = { good: "text-emerald-600", bad: "text-red-600", default: "text-zinc-900" };

export default async function ReportPage({ searchParams }) {
  const me = await requireMember();
  const params = await searchParams;
  const month = isValidMonth(params.month) ? params.month : monthOf(todayISO());
  const report = await getMonthReport(month);
  const isAdmin = me.role === "admin";
  const closed = report.status === "closed";

  return (
    <>
      <PageHeader title={`Report · ${formatMonth(month)}`} subtitle="Month-end settlement for every member.">
        <div className="flex items-center gap-2 print:hidden">
          <MonthPicker basePath="/report" month={month} />
          <PrintButton />
        </div>
      </PageHeader>

      <div className="mb-6">
        {closed ? <Badge tone="red">Closed · numbers are final</Badge> : <Badge tone="green">Open · numbers update live</Badge>}
      </div>

      {report.warnings.map((w) => (
        <Notice key={w}>{w}</Notice>
      ))}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Meal rate" value={formatTaka(report.mealRate)} hint="per meal" icon="scale" tone="brand" />
        <Stat label="Total meals" value={formatNumber(report.totalMeals)} icon="bowl" tone="brand" />
        <Stat label="Bazar" value={formatTaka(report.bazarCost)} icon="cart" tone="brand" />
        <Stat label="Shared bills" value={formatTaka(report.sharedCost)} hint={`${formatTaka(report.sharedPerMember)} each`} icon="banknotes" tone="brand" />
        <Stat label="Cash in hand" value={formatTaka(report.cashInHand)} hint="with the admin" icon="wallet" tone={balanceTone(report.cashInHand)} />
      </div>

      <Card
        title="Each member"
        description="Positive balance: gets money back. Negative balance: must pay."
        className="mb-8"
      >
        <div className={table.wrap}>
          <table className={`${table.table} tabular-nums`}>
            <thead>
              <tr>
                <th className={table.th}>Member</th>
                <th className={`${table.th} text-right`}>Meals</th>
                <th className={`${table.th} text-right`}>Meal cost</th>
                <th className={`${table.th} text-right`}>Shared</th>
                <th className={`${table.th} text-right`}>Total cost</th>
                <th className={`${table.th} text-right`}>Paid</th>
                <th className={`${table.th} text-right`}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.memberId} className={`${table.tr} ${r.memberId === me.id ? "bg-emerald-50/40" : ""}`}>
                  <td className={table.td}>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} size="sm" />
                      <span className="font-medium text-zinc-900">
                        {r.name}
                        {r.memberId === me.id && <span className="ml-1.5 text-xs font-normal text-zinc-400">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className={`${table.td} text-right`}>{formatNumber(r.meals)}</td>
                  <td className={`${table.td} text-right`}>{formatTaka(r.mealCost)}</td>
                  <td className={`${table.td} text-right`}>{formatTaka(r.sharedCost)}</td>
                  <td className={`${table.td} text-right font-medium text-zinc-900`}>{formatTaka(r.cost)}</td>
                  <td
                    className={`${table.td} text-right`}
                    title={`Deposits ${formatTaka(r.deposits)} · Own-pocket bazar ${formatTaka(r.ownPocket)} · From last month ${formatTaka(r.carried)} · Refunds ${formatTaka(r.refunds)}`}
                  >
                    {formatTaka(r.credit)}
                  </td>
                  <td className={`${table.td} text-right text-base font-semibold ${toneText[balanceTone(r.balance)]}`}>
                    {formatTaka(r.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Paid = deposits + bazar paid from own pocket + balance from last month − refunds. Hover a number to see the details.
        </p>
      </Card>

      {isAdmin && (
        <Card
          title={closed ? "Reopen this month" : "Close this month"}
          description={
            closed
              ? "Reopen to fix a mistake, then close it again."
              : "Closing locks this month and moves each member's balance into next month."
          }
          className="print:hidden"
        >
          {closed ? (
            <ActionForm
              action={reopenMonthAction}
              submitLabel="Reopen month"
              variant="secondary"
              confirmText={`Reopen ${formatMonth(month)}? The balances carried to next month will be removed.`}
            >
              <input type="hidden" name="month" value={month} />
            </ActionForm>
          ) : (
            <ActionForm
              action={closeMonthAction}
              submitLabel="Close month"
              submitIcon="lock"
              confirmText={`Close ${formatMonth(month)}? It will be locked and each balance will move to next month.`}
            >
              <input type="hidden" name="month" value={month} />
            </ActionForm>
          )}
        </Card>
      )}
    </>
  );
}
