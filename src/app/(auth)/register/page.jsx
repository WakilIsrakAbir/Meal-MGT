import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import { Field, inputClass } from "@/components/ui";
import { getCurrentMember } from "@/lib/dal";
import { register } from "../actions";

export const metadata = { title: "Request to join · Meal Manager" };

export default async function RegisterPage() {
  if (await getCurrentMember()) redirect("/");

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Request to join</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-500">
        The admin will check your request. You can log in once it is accepted.
      </p>

      <ActionForm action={register} submitLabel="Send request" fullWidth>
        <Field label="Full name">
          <input name="name" autoComplete="name" required className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field label="Phone (optional)">
          <input name="phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password">
            <input name="password" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
          </Field>
          <Field label="Repeat password">
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
          </Field>
        </div>
      </ActionForm>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
          Log in
        </Link>
      </p>
    </>
  );
}
