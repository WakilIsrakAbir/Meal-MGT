"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { requireMember } from "@/lib/dal";
import { formatDate } from "@/lib/dates";
import { dateField, idField, mealCount, parse } from "@/lib/validation";
import { saveMealsForDate } from "@/services/meals";

const MealsSchema = z.object({
  date: dateField,
  rows: z.array(z.object({ memberId: idField("Member not found"), lunch: mealCount, dinner: mealCount })),
});

// The form sends fields named "lunch:<memberId>" and "dinner:<memberId>".
function readRows(formData) {
  const rows = new Map();
  for (const [key, value] of formData.entries()) {
    const [slot, memberId] = key.split(":");
    if ((slot !== "lunch" && slot !== "dinner") || !memberId) continue;
    if (!rows.has(memberId)) rows.set(memberId, { memberId, lunch: 0, dinner: 0 });
    rows.get(memberId)[slot] = value;
  }
  return [...rows.values()];
}

export async function saveMealsAction(prevState, formData) {
  return runAction(async () => {
    const me = await requireMember();
    const data = parse(MealsSchema, { date: formData.get("date"), rows: readRows(formData) });
    await saveMealsForDate({ date: data.date, rows: data.rows, actor: me });
    return `Meals for ${formatDate(data.date)} saved.`;
  });
}
