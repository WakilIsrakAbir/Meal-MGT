"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { requireAdmin } from "@/lib/dal";
import { dateField, idField, parse } from "@/lib/validation";
import { createDeposit, deleteDeposit } from "@/services/deposits";

const DepositSchema = z.object({
  member: idField("Choose a member"),
  type: z.enum(["deposit", "refund"], { error: "Choose deposit or refund" }),
  amount: z.coerce.number({ error: "Enter an amount" }).positive("Amount must be more than 0").max(10_000_000),
  date: dateField,
  note: z.string().trim().max(200).default(""),
});

export async function addDepositAction(prevState, formData) {
  return runAction(async () => {
    const me = await requireAdmin();
    await createDeposit(parse(DepositSchema, Object.fromEntries(formData)), me);
    return "Added.";
  });
}

export async function deleteDepositAction(prevState, formData) {
  return runAction(async () => {
    await requireAdmin();
    await deleteDeposit(parse(idField("Entry not found"), formData.get("id")));
    return "Deleted.";
  });
}
