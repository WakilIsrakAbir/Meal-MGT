import Link from "next/link";
import ActionForm from "@/components/ActionForm";
import { ToastOnLoad } from "@/components/Toaster";
import MonthPicker from "@/components/MonthPicker";
import { Badge, Card, EmptyState, Field, Icon, Notice, PageHeader, Stat, buttonClass, inputClass, table } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { formatDate, isValidMonth, monthOf, todayISO } from "@/lib/dates";
import { formatTaka } from "@/lib/money";
import { getExpense, listExpenses } from "@/services/expenses";
import { listMembers } from "@/services/members";
import { getMonthStatus } from "@/services/months";
import { addExpenseAction, deleteExpenseAction, updateExpenseAction } from "./actions";

export const metadata = { title: "Bazar & Bills · Meal Manager" };

function ExpenseFields({ expense, members, defaultDate }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Type">
        <select name="type" defaultValue={expense?.type ?? "bazar"} className={inputClass}>
          <option value="bazar">Bazar (shared by meals)</option>
          <option value="shared">Shared bill (split equally)</option>
        </select>
      </Field>
      <Field label="Date">
        <input name="date" type="date" defaultValue={expense?.date ?? defaultDate} required className={inputClass} />
      </Field>
      <Field label="Amount (৳)">
        <input name="amount" type="number" min="0.01" step="0.01" defaultValue={expense?.amount} placeholder="0" required className={inputClass} />
      </Field>
      <Field label="Paid with">
        <select name="paidFrom" defaultValue={expense && !expense.paidFromFund ? "member" : "fund"} className={inputClass}>
          <option value="fund">Fund money (deposits)</option>
          <option value="member">Member&apos;s own pocket</option>
        </select>
      </Field>
      <Field label="Member" hint="Who shopped or paid">
        <select name="member" defaultValue={expense?.member ?? ""} className={inputClass}>
          <option value="">—</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Note" hint="Items or bill name">
        <input name="note" defaultValue={expense?.note} maxLength={200} placeholder="Rice, fish, vegetables…" className={inputClass} />
      </Field>
    </div>
  );
}

export default async function ExpensesPage({ searchParams }) {
  const me = await requireMember();
  const params = await searchParams;
  const isAdmin = me.role === "admin";
  const editing = isAdmin && params.edit ? await getExpense(params.edit) : null;
  const month = editing ? monthOf(editing.date) : isValidMonth(params.month) ? params.month : monthOf(todayISO());

  const [expenses, members, status] = await Promise.all([listExpenses(month), listMembers(), getMonthStatus(month)]);
  const names = new Map(members.map((m) => [m.id, m.name]));
  const total = (type) => expenses.filter((e) => e.type === type).reduce((sum, e) => sum + e.amount, 0);
  const canEdit = isAdmin && status === "open";
  const today = todayISO();
  const defaultDate = monthOf(today) === month ? today : `${month}-01`;

  return (
    <>
      {params.saved && <ToastOnLoad id={`saved-${params.saved}`} type="success" message="Changes saved." />}
      <PageHeader title="Bazar & Bills" subtitle="Bazar is shared by meal count. Shared bills are split equally.">
        <MonthPicker basePath="/expenses" month={month} />
      </PageHeader>

      {status === "closed" && <Notice>This month is closed. The admin can reopen it on the Report page.</Notice>}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Bazar" value={formatTaka(total("bazar"))} hint="Shared by meal count" icon="cart" tone="brand" />
        <Stat label="Shared bills" value={formatTaka(total("shared"))} hint="Split equally" icon="banknotes" tone="brand" />
        <Stat label="Total spent" value={formatTaka(total("bazar") + total("shared"))} icon="wallet" />
      </div>

      {canEdit && (
        <Card
          title={editing ? "Edit entry" : "Add bazar or bill"}
          className="mb-8"
          action={
            editing && (
              <Link href={`/expenses?month=${month}`} className={buttonClass.ghost}>
                Cancel
              </Link>
            )
          }
        >
          {editing ? (
            <ActionForm action={updateExpenseAction} key={editing.id} submitLabel="Save changes">
              <input type="hidden" name="id" value={editing.id} />
              <ExpenseFields expense={editing} members={members.filter((m) => m.active || m.id === editing.member)} />
            </ActionForm>
          ) : (
            <ActionForm action={addExpenseAction} submitLabel="Add entry" submitIcon="plus">
              <ExpenseFields members={members.filter((m) => m.active)} defaultDate={defaultDate} />
            </ActionForm>
          )}
        </Card>
      )}

      <Card title="Entries" description={`${expenses.length} ${expenses.length === 1 ? "entry" : "entries"} this month`}>
        {expenses.length === 0 ? (
          <EmptyState icon="cart" title="Nothing added yet">
            Bazar and shared bills for this month will show up here.
          </EmptyState>
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Date</th>
                  <th className={table.th}>Type</th>
                  <th className={table.th}>Note</th>
                  <th className={table.th}>Paid by</th>
                  <th className={`${table.th} text-right`}>Amount</th>
                  {canEdit && <th className={table.th} />}
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className={table.tr}>
                    <td className={`${table.td} whitespace-nowrap`}>{formatDate(e.date)}</td>
                    <td className={table.td}>
                      <Badge tone={e.type === "bazar" ? "green" : "blue"}>{e.type === "bazar" ? "Bazar" : "Shared bill"}</Badge>
                    </td>
                    <td className={`${table.td} max-w-xs truncate`}>{e.note || "—"}</td>
                    <td className={table.td}>
                      {e.paidFromFund ? (
                        <span>
                          Fund{e.member && <span className="text-zinc-400"> · {names.get(e.member)}</span>}
                        </span>
                      ) : (
                        <span>
                          {names.get(e.member) ?? "?"} <Badge tone="amber">own pocket</Badge>
                        </span>
                      )}
                    </td>
                    <td className={`${table.td} text-right font-semibold tabular-nums text-zinc-900`}>{formatTaka(e.amount)}</td>
                    {canEdit && (
                      <td className={`${table.td} whitespace-nowrap`}>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/expenses?edit=${e.id}`} className={buttonClass.ghost} aria-label="Edit">
                            <Icon name="pencil" className="h-4 w-4" />
                          </Link>
                          <ActionForm
                            action={deleteExpenseAction}
                            submitLabel="Delete"
                            variant="danger"
                            confirmText="Delete this entry?"
                            className="flex items-center"
                          >
                            <input type="hidden" name="id" value={e.id} />
                          </ActionForm>
                        </div>
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
