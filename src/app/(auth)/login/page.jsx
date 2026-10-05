import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import { ToastOnLoad } from "@/components/Toaster";
import { Field, inputClass } from "@/components/ui";
import { getCurrentMember } from "@/lib/dal";
import { login } from "../actions";

export const metadata = { title: "Log in · Meal Manager" };

const NOTICES = {
  requested: { type: "success", text: "Your request was sent. You can log in after the admin accepts it." },
  pending: { type: "warning", text: "Your request is still waiting for the admin to accept it." },
  rejected: { type: "error", text: "Your request was not accepted. Please contact the admin." },
  off: { type: "error", text: "Your account is turned off. Please contact the admin." },
};

export default async function LoginPage({ searchParams }) {
  if (await getCurrentMember()) redirect("/");
  const { notice } = await searchParams;
  const message = NOTICES[notice];

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-500">Log in to see today&apos;s meals and your balance.</p>

      {message && <ToastOnLoad id={`notice-${notice}`} type={message.type} message={message.text} />}

      <ActionForm action={login} submitLabel="Log in" fullWidth>
        <Field label="Email">
          <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required className={inputClass} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required className={inputClass} />
        </Field>
      </ActionForm>

      <p className="mt-8 text-center text-sm text-zinc-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
          Request to join
        </Link>
      </p>
    </>
  );
}
