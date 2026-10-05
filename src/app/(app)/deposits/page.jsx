import ActionForm from "@/components/ActionForm";
import MonthPicker from "@/components/MonthPicker";
import { Avatar, Badge, Card, EmptyState, Field, Notice, PageHeader, Stat, inputClass, table } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { formatDate, isValidMonth, monthOf, todayISO } from "@/lib/dates";
import { formatTaka } from "@/lib/money";
import { listDeposits } from "@/services/deposits";
import { listMembers } from "@/services/members";
import { getMonthStatus } from "@/services/months";
import { addDepositAction, deleteDepositAction } from "./actions";

export const metadata = { title: "Deposits · Meal Manager" };

const TYPE_LABEL = {
  deposit: { label: "Deposit", tone: "green" },
  refund: { label: "Refund", tone: "red" },
  carry_forward: { label: "From last month", tone: "default" },
};

export default async function DepositsPage({ searchParams }) {
  const me = await requireMember();
  const params = await searchParams;
  const month = isValidMonth(params.month) ? params.month : monthOf(todayISO());

  const [deposits, members, status] = await Promise.all([listDeposits(month), listMembers(), getMonthStatus(month)]);
  const names = new Map(members.map((m) => [m.id, m.name]));
  const sum = (type) => deposits.filter((d) => d.type === type).reduce((s, d) => s + d.amount, 0);
  const canEdit = me.role === "admin" && status === "open";
  const today = todayISO();

  return (
    <>
      <PageHeader title="Deposits" subtitle="Money members give to the admin, and money given back.">
        <MonthPicker basePath="/deposits" month={month} />
      </PageHeader>

      {status === "closed" && <Notice>This month is closed. The admin can reopen it on the Report page.</Notice>}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Deposits" value={formatTaka(sum("deposit"))} icon="wallet" tone="brand" />
        <Stat label="Refunds" value={formatTaka(sum("refund"))} icon="banknotes" />
        <Stat label="Carried from last month" value={formatTaka(sum("carry_forward"))} icon="calendar" />
      </div>

      {canEdit && (
        <Card title="Add deposit or refund" className="mb-8">
          <ActionForm action={addDepositAction} submitLabel="Add entry" submitIcon="plus">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Member">
                <select name="member" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    Choose…
                  </option>
                  {members
                    .filter((m) => m.active)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Type">
                <select name="type" defaultValue="deposit" className={inputClass}>
                  <option value="deposit">Deposit (member gave money)</option>
                  <option value="refund">Refund (admin gave money back)</option>
                </select>
              </Field>
              <Field label="Amount (৳)">
                <input name="amount" type="number" min="0.01" step="0.01" placeholder="0" required className={inputClass} />
              </Field>
              <Field label="Date">
                <input
                  name="date"
                  type="date"
                  defaultValue={monthOf(today) === month ? today : `${month}-01`}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Note (optional)">
                <input name="note" maxLength={200} className={inputClass} />
              </Field>
            </div>
          </ActionForm>
        </Card>
      )}

      <Card title="Entries" description={`${deposits.length} ${deposits.length === 1 ? "entry" : "entries"} this month`}>
        {deposits.length === 0 ? (
          <EmptyState icon="wallet" title="No deposits yet">
            Deposits and refunds for this month will show up here.
          </EmptyState>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Date</th>
                  <th className={table.th}>Member</th>
                  <th className={table.th}>Type</th>
                  <th className={table.th}>Note</th>
                  <th className={`${table.th} text-right`}>Amount</th>
                  {canEdit && <th className={table.th} />}
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id} className={table.tr}>
                    <td className={`${table.td} whitespace-nowrap`}>{formatDate(d.date)}</td>
                    <td className={table.td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={names.get(d.member) ?? "?"} size="sm" />
                        <span className="font-medium text-zinc-900">{names.get(d.member) ?? "?"}</span>
                      </div>
                    </td>
                    <td className={table.td}>
                      <Badge tone={TYPE_LABEL[d.type].tone}>{TYPE_LABEL[d.type].label}</Badge>
                    </td>
                    <td className={`${table.td} max-w-xs truncate`}>{d.note || "—"}</td>
                    <td className={`${table.td} text-right font-semibold tabular-nums text-zinc-900`}>{formatTaka(d.amount)}</td>
                    {canEdit && (
                      <td className={`${table.td} text-right`}>
                        {d.type !== "carry_forward" && (
                          <ActionForm
                            action={deleteDepositAction}
                            submitLabel="Delete"
                            variant="danger"
                            confirmText="Delete this entry?"
                            className="flex items-center justify-end"
                          >
                            <input type="hidden" name="id" value={d.id} />
                          </ActionForm>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
