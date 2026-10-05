import "server-only";
import { connectDB } from "@/lib/db";
import { addMonths, formatMonth, monthOf, todayISO } from "@/lib/dates";
import { UserError } from "@/lib/errors";
import Deposit from "@/models/Deposit";
import Expense from "@/models/Expense";
import MealEntry from "@/models/MealEntry";
import Member from "@/models/Member";
import Month from "@/models/Month";
import { calculateMonthReport } from "./report";

const id = (value) => value?.toString() ?? null;

async function findMonth(key) {
  await connectDB();
  return Month.findOne({ key }).lean();
}

export async function getMonthStatus(key) {
  return (await findMonth(key))?.status ?? "open";
}

// Every change to a closed month is refused here, on the server.
export async function assertMonthOpen(key) {
  if ((await getMonthStatus(key)) === "closed") {
    throw new UserError(`${formatMonth(key)} is closed. The admin can reopen it on the Report page.`);
  }
}

async function calculateLive(key) {
  await connectDB();
  const [members, meals, expenses, deposits] = await Promise.all([
    Member.find().sort({ name: 1 }).lean(),
    MealEntry.find({ month: key }).lean(),
    Expense.find({ month: key }).lean(),
    Deposit.find({ month: key }).lean(),
  ]);
  return calculateMonthReport({
    // Only approved, active people take part (join requests never do).
    members: members.map((m) => ({ id: id(m._id), name: m.name, active: m.active && m.status === "approved" })),
    meals: meals.map((e) => ({ member: id(e.member), lunch: e.lunch, dinner: e.dinner })),
    expenses: expenses.map((e) => ({
      type: e.type,
      amount: e.amount,
      member: id(e.member),
      paidFromFund: e.paidFromFund,
    })),
    deposits: deposits.map((d) => ({ member: id(d.member), type: d.type, amount: d.amount })),
  });
}

// A closed month shows its frozen snapshot; an open month is calculated live.
export async function getMonthReport(key) {
  // Load the month and its data at the same time: one trip to the database instead of two.
  const [month, live] = await Promise.all([findMonth(key), calculateLive(key)]);
  if (month?.status === "closed" && month.snapshot) {
    return { ...month.snapshot, month: key, status: "closed", closedAt: month.closedAt?.toISOString() ?? null };
  }
  return { ...live, month: key, status: "open", closedAt: null };
}

export async function closeMonth(key) {
  await assertMonthOpen(key);
  if (key > monthOf(todayISO())) throw new UserError("You can't close a month that hasn't started yet.");

  const next = addMonths(key, 1);
  if ((await getMonthStatus(next)) === "closed") {
    throw new UserError(`${formatMonth(next)} is already closed. Reopen it first.`);
  }

  const report = await calculateLive(key);

  // Carry each balance into the first day of next month.
  await Deposit.deleteMany({ type: "carry_forward", sourceMonth: key });
  const carried = report.rows
    .filter((r) => Math.abs(r.balance) >= 0.01)
    .map((r) => ({
      member: r.memberId,
      type: "carry_forward",
      amount: r.balance,
      date: `${next}-01`,
      month: next,
      note: `Balance from ${formatMonth(key)}`,
      sourceMonth: key,
    }));
  if (carried.length > 0) await Deposit.insertMany(carried);

  await Month.updateOne(
    { key },
    { $set: { status: "closed", closedAt: new Date(), snapshot: report } },
    { upsert: true }
  );
}

export async function reopenMonth(key) {
  if ((await getMonthStatus(key)) !== "closed") throw new UserError(`${formatMonth(key)} is not closed.`);

  const next = addMonths(key, 1);
  if ((await getMonthStatus(next)) === "closed") {
    throw new UserError(`Reopen ${formatMonth(next)} first, because it already uses this month's balances.`);
  }

  await Deposit.deleteMany({ type: "carry_forward", sourceMonth: key });
  await Month.updateOne({ key }, { $set: { status: "open", closedAt: null, snapshot: null } });
}
