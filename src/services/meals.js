import "server-only";
import { connectDB } from "@/lib/db";
import { monthOf, todayISO } from "@/lib/dates";
import { UserError } from "@/lib/errors";
import MealEntry from "@/models/MealEntry";
import Member from "@/models/Member";
import { assertMonthOpen } from "./months";

function toEntry(doc) {
  return { member: doc.member.toString(), date: doc.date, lunch: doc.lunch, dinner: doc.dinner };
}

export async function getMealsForDate(date) {
  await connectDB();
  return (await MealEntry.find({ date }).lean()).map(toEntry);
}

export async function getMealsForMonth(month) {
  await connectDB();
  return (await MealEntry.find({ month }).lean()).map(toEntry);
}

// rows: [{ memberId, lunch, dinner }]
export async function saveMealsForDate({ date, rows, actor }) {
  await assertMonthOpen(monthOf(date));

  if (actor.role !== "admin") {
    if (rows.some((r) => r.memberId !== actor.id)) throw new UserError("You can only change your own meals.");
    if (date < todayISO()) throw new UserError("You can't change past days. Ask the admin.");
  }
  if (rows.length === 0) return;

  await connectDB();
  const ids = rows.map((r) => r.memberId);
  if ((await Member.countDocuments({ _id: { $in: ids } })) !== new Set(ids).size) {
    throw new UserError("One of the members was not found.");
  }

  await MealEntry.bulkWrite(
    rows.map((r) => ({
      updateOne: {
        filter: { member: r.memberId, date },
        update: { $set: { month: monthOf(date), lunch: r.lunch, dinner: r.dinner, updatedBy: actor.id } },
        upsert: true,
      },
    }))
  );
}
