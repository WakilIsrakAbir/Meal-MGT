import ActionForm from "@/components/ActionForm";
import { Avatar, Badge, Card, Field, PageHeader, inputClass } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { changePasswordAction } from "./actions";

export const metadata = { title: "Profile · Meal Manager" };

export default async function ProfilePage() {
  const me = await requireMember();

  return (
    <>
      <PageHeader title="Profile" subtitle="Your account details and password." />
      <div className="grid max-w-4xl gap-8 md:grid-cols-2">
        <Card title="My details">
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={me.name} />
            <div>
              <div className="font-semibold text-zinc-900">{me.name}</div>
              <Badge tone={me.role === "admin" ? "green" : "default"}>{me.role === "admin" ? "Admin" : "Member"}</Badge>
            </div>
          </div>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{me.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Phone</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{me.phone || "—"}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs text-zinc-500">Ask the admin to change your name, email or phone.</p>
        </Card>

        <Card title="Change password">
          <ActionForm action={changePasswordAction} submitLabel="Change password">
            <Field label="Current password">
              <input name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
            </Field>
            <Field label="New password">
              <input name="newPassword" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
            </Field>
            <Field label="Repeat new password">
              <input name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
