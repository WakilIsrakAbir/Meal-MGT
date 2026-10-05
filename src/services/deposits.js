import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { monthOf } from "@/lib/dates";
import { UserError } from "@/lib/errors";
import Deposit from "@/models/Deposit";
import { assertMonthOpen } from "./months";

function toDeposit(doc) {
  return {
    id: doc._id.toString(),
    member: doc.member.toString(),
    type: doc.type,
    amount: doc.amount,
    date: doc.date,
    note: doc.note,
  };
}

export async function listDeposits(month) {
  await connectDB();
  const docs = await Deposit.find({ month }).sort({ date: -1, createdAt: -1 }).lean();
  return docs.map(toDeposit);
}

// data: { member, type: "deposit" | "refund", amount, date, note }
export async function createDeposit(data, actor) {
  await assertMonthOpen(monthOf(data.date));
  await Deposit.create({ ...data, month: monthOf(data.date), createdBy: actor.id });
}

export async function deleteDeposit(id) {
  if (!isValidObjectId(id)) throw new UserError("This entry was not found.");
  await connectDB();
  const existing = await Deposit.findById(id).lean();
  if (!existing) throw new UserError("This entry was not found.");
  if (existing.type === "carry_forward") {
    throw new UserError("Carried balances come from closing last month. Reopen that month to change them.");
  }
  await assertMonthOpen(existing.month);
  await Deposit.deleteOne({ _id: id });
}
