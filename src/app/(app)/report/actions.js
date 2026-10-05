"use server";

import { runAction } from "@/lib/action";
import { requireAdmin } from "@/lib/dal";
import { formatMonth, isValidMonth } from "@/lib/dates";
import { UserError } from "@/lib/errors";
import { closeMonth, reopenMonth } from "@/services/months";

function readMonth(formData) {
  const month = formData.get("month");
  if (!isValidMonth(month)) throw new UserError("Invalid month.");
  return month;
}

export async function closeMonthAction(prevState, formData) {
  return runAction(async () => {
    await requireAdmin();
    const month = readMonth(formData);
    await closeMonth(month);
    return `${formatMonth(month)} is closed. Balances were carried to next month.`;
  });
}

export async function reopenMonthAction(prevState, formData) {
  return runAction(async () => {
    await requireAdmin();
    const month = readMonth(formData);
    await reopenMonth(month);
    return `${formatMonth(month)} is open again.`;
  });
}
