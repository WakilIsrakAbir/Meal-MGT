"use server";

import { z } from "zod";
import { runAction } from "@/lib/action";
import { requireMember } from "@/lib/dal";
import { parse } from "@/lib/validation";
import { changePassword } from "@/services/members";

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { error: "The new passwords don't match" });

export async function changePasswordAction(prevState, formData) {
  return runAction(async () => {
    const me = await requireMember();
    const data = parse(PasswordSchema, Object.fromEntries(formData));
    await changePassword(me.id, data.currentPassword, data.newPassword);
    return "Password changed.";
  });
}
