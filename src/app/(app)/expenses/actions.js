"use server";

import { isValidObjectId } from "mongoose";
import { redirect } from "next/navigation";
import { z } from "zod";
import { runAction } from "@/lib/action";
import { requireAdmin } from "@/lib/dal";
import { monthOf } from "@/lib/dates";
import { dateField, idField, parse } from "@/lib/validation";
import { createExpense, deleteExpense, updateExpense } from "@/services/expenses";

const ExpenseSchema = z
  .object({
    type: z.enum(["bazar", "shared"], { error: "Choose bazar or shared bill" }),
    date: dateField,
    amount: z.coerce.number({ error: "Enter an amount" }).positive("Amount must be more than 0").max(10_000_000),
    note: z.string().trim().max(200).default(""),
    paidFrom: z.enum(["fund", "member"]),
    member: z.string().default(""),
  })
  .refine((d) => d.paidFrom === "fund" || isValidObjectId(d.member), {
    error: "Choose the member who paid from their own pocket",
  });

function toExpenseData(formData) {
  const data = parse(ExpenseSchema, Object.fromEntries(formData));
  return {
    type: data.type,
    date: data.date,
    amount: data.amount,
    note: data.note,
    member: isValidObjectId(data.member) ? data.member : null,
    paidFromFund: data.paidFrom === "fund",
  };
}

export async function addExpenseAction(prevState, formData) {
  return runAction(async () => {
    const me = await requireAdmin();
    await createExpense(toExpenseData(formData), me);
    return "Added.";
  });
}

export async function updateExpenseAction(prevState, formData) {
  let month;
  const result = await runAction(async () => {
    await requireAdmin();
    const id = parse(idField("Entry not found"), formData.get("id"));
    const data = toExpenseData(formData);
    await updateExpense(id, data);
    month = monthOf(data.date);
  });
  if (!result.ok) return result;
  redirect(`/expenses?month=${month}&saved=${Date.now()}`);
}

export async function deleteExpenseAction(prevState, formData) {
  return runAction(async () => {
    await requireAdmin();
    await deleteExpense(parse(idField("Entry not found"), formData.get("id")));
    return "Deleted.";
  });
}
