import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { monthOf } from "@/lib/dates";
import { UserError } from "@/lib/errors";
import Expense from "@/models/Expense";
import { assertMonthOpen } from "./months";

function toExpense(doc) {
  return {
    id: doc._id.toString(),
    type: doc.type,
    date: doc.date,
    amount: doc.amount,
    note: doc.note,
    member: doc.member?.toString() ?? null,
    paidFromFund: doc.paidFromFund,
  };
}

export async function listExpenses(month) {
  await connectDB();
  const docs = await Expense.find({ month }).sort({ date: -1, createdAt: -1 }).lean();
  return docs.map(toExpense);
}

export async function getExpense(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Expense.findById(id).lean();
  return doc ? toExpense(doc) : null;
}

// data: { type, date, amount, note, member, paidFromFund }
export async function createExpense(data, actor) {
  await assertMonthOpen(monthOf(data.date));
  await Expense.create({ ...data, month: monthOf(data.date), createdBy: actor.id });
}

export async function updateExpense(id, data) {
  const existing = await getExpense(id);
  if (!existing) throw new UserError("This entry was not found.");
  await assertMonthOpen(monthOf(existing.date));
  await assertMonthOpen(monthOf(data.date));
  await Expense.updateOne({ _id: id }, { $set: { ...data, month: monthOf(data.date) } });
}

export async function deleteExpense(id) {
  const existing = await getExpense(id);
  if (!existing) throw new UserError("This entry was not found.");
  await assertMonthOpen(monthOf(existing.date));
  await Expense.deleteOne({ _id: id });
}
