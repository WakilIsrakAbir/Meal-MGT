"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { runAction } from "@/lib/action";
import { requireAdmin } from "@/lib/dal";
import { normalizePhone } from "@/lib/phone";
import { idField, mealCount, parse } from "@/lib/validation";
import { createMember, getMemberById, setMemberStatus, updateMember } from "@/services/members";

const baseFields = {
  name: z.string().trim().min(1, "Name is required").max(60),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address" })),
  phone: z.string().default("").transform(normalizePhone),
  role: z.enum(["admin", "member"], { error: "Choose a role" }),
  defaultLunch: mealCount,
  defaultDinner: mealCount,
};

const CreateSchema = z.object({
  ...baseFields,
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const UpdateSchema = z.object({
  ...baseFields,
  id: idField("Member not found"),
  active: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine((p) => !p || p.length >= 6, { error: "New password must be at least 6 characters" }),
});

export async function addMemberAction(prevState, formData) {
  return runAction(async () => {
    await requireAdmin();
    const data = parse(CreateSchema, Object.fromEntries(formData));
    await createMember({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      defaultMeals: { lunch: data.defaultLunch, dinner: data.defaultDinner },
    });
    return `${data.name} was added.`;
  });
}

export async function updateMemberAction(prevState, formData) {
  const result = await runAction(async () => {
    await requireAdmin();
    const data = parse(UpdateSchema, Object.fromEntries(formData));
    await updateMember(data.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      active: data.active === "on",
      defaultMeals: { lunch: data.defaultLunch, dinner: data.defaultDinner },
      password: data.password,
    });
  });
  if (!result.ok) return result;
  redirect(`/members?saved=${Date.now()}`);
}

async function changeStatus(formData, status, verb) {
  return runAction(async () => {
    await requireAdmin();
    const id = parse(idField("Member not found"), formData.get("id"));
    const member = await getMemberById(id);
    await setMemberStatus(id, status);
    return `${member?.name ?? "Member"} was ${verb}.`;
  });
}

export async function approveMemberAction(prevState, formData) {
  return changeStatus(formData, "approved", "accepted");
}

export async function rejectMemberAction(prevState, formData) {
  return changeStatus(formData, "rejected", "rejected");
}
