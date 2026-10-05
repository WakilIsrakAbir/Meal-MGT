"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { runAction } from "@/lib/action";
import { normalizePhone } from "@/lib/phone";
import { createSession, deleteSession } from "@/lib/session";
import { parse } from "@/lib/validation";
import { registerMember, verifyLogin } from "@/services/members";

const emailField = z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address" }));

const LoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password"),
});

const RegisterSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(60),
    email: emailField,
    phone: z.string().default("").transform(normalizePhone),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { error: "The passwords don't match" });

export async function login(prevState, formData) {
  let outcome;
  const result = await runAction(async () => {
    const data = parse(LoginSchema, Object.fromEntries(formData));
    outcome = await verifyLogin(data.email, data.password);
  });
  if (!result.ok) return result;
  if (outcome.error) return { ok: false, message: outcome.error };

  await createSession(outcome.member.id);
  redirect("/");
}

export async function register(prevState, formData) {
  const result = await runAction(async () => {
    const { name, email, phone, password } = parse(RegisterSchema, Object.fromEntries(formData));
    await registerMember({ name, email, phone, password });
  });
  if (!result.ok) return result;
  redirect("/login?notice=requested");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
