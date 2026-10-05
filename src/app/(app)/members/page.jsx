import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import { ToastOnLoad } from "@/components/Toaster";
import { Avatar, Badge, Card, EmptyState, Field, PageHeader, buttonClass, inputClass } from "@/components/ui";
import { requireMember } from "@/lib/dal";
import { listMembers } from "@/services/members";
import { addMemberAction, approveMemberAction, rejectMemberAction, updateMemberAction } from "./actions";

export const metadata = { title: "Members · Meal Manager" };

const requestDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: process.env.APP_TIMEZONE || "Asia/Dhaka",
});

function MemberFields({ member }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name">
        <input name="name" defaultValue={member?.name} required className={inputClass} />
      </Field>
      <Field label="Email" hint="Used to log in">
        <input name="email" type="email" defaultValue={member?.email} required className={inputClass} />
      </Field>
      <Field label="Phone (optional)">
        <input name="phone" type="tel" defaultValue={member?.phone} className={inputClass} />
      </Field>
      <Field label="Role">
        <select name="role" defaultValue={member?.role ?? "member"} className={inputClass}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <Field label="Usual lunch per day">
        <input name="defaultLunch" type="number" min={0} max={10} defaultValue={member?.defaultMeals.lunch ?? 1} className={inputClass} />
      </Field>
      <Field label="Usual dinner per day">
        <input name="defaultDinner" type="number" min={0} max={10} defaultValue={member?.defaultMeals.dinner ?? 1} className={inputClass} />
      </Field>
      <div className="sm:col-span-2">
        <Field label={member ? "New password" : "Password"} hint={member ? "Leave empty to keep the current password" : "At least 6 characters"}>
          <input name="password" type="password" autoComplete="new-password" minLength={6} required={!member} className={inputClass} />
        </Field>
      </div>
    </div>
  );
}

function MemberIdentity({ member, me }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={member.name} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-zinc-900">
          <span className="truncate">{member.name}</span>
          {member.id === me?.id && <span className="text-xs font-normal text-zinc-400">(you)</span>}
        </div>
        <div className="truncate text-sm text-zinc-500">
          {member.email}
          {member.phone && ` · ${member.phone}`}
        </div>
      </div>
    </div>
  );
}

export default async function MembersPage({ searchParams }) {
  const me = await requireMember();
  if (me.role !== "admin") redirect("/");

  const { edit, saved } = await searchParams;
  const everyone = await listMembers({ status: null });
  const pending = everyone.filter((m) => m.status === "pending");
  const approved = everyone.filter((m) => m.status === "approved");
  const rejected = everyone.filter((m) => m.status === "rejected");
  const editing = approved.find((m) => m.id === edit);

  return (
    <>
      {saved && <ToastOnLoad id={`saved-${saved}`} type="success" message="Changes saved." />}
      <PageHeader title="Members" subtitle={`${approved.filter((m) => m.active).length} active members`} />

      <Card
        title={
          <span className="flex items-center gap-2">
            Join requests {pending.length > 0 && <Badge tone="amber">{pending.length} waiting</Badge>}
          </span>
        }
        description="People who registered on the app. They can log in only after you accept them."
        className="mb-8"
      >
        {pending.length === 0 ? (
          <EmptyState icon="users" title="No requests right now">
            Share the app link. New people can tap “Request to join”.
          </EmptyState>
        ) : (
          <ul className="-my-3 divide-y divide-zinc-100">
            {pending.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-4">
                  <MemberIdentity member={m} />
                  {m.requestedAt && (
                    <span className="hidden text-xs text-zinc-400 md:inline">Requested {requestDate.format(new Date(m.requestedAt))}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <ActionForm action={rejectMemberAction} submitLabel="Reject" variant="dangerSolid" confirmText={`Reject ${m.name}?`} className="flex items-center">
                    <input type="hidden" name="id" value={m.id} />
                  </ActionForm>
                  <ActionForm action={approveMemberAction} submitLabel="Accept" submitIcon="check" variant="success" className="flex items-center">
                    <input type="hidden" name="id" value={m.id} />
                  </ActionForm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <Card title="All members">
          <ul className="-my-3 divide-y divide-zinc-100">
            {approved.map((m) => (
              <li key={m.id} className={`flex items-center justify-between gap-3 py-3 ${m.id === editing?.id ? "opacity-60" : ""}`}>
                <MemberIdentity member={m} me={me} />
                <div className="flex shrink-0 items-center gap-2">
                  {m.role === "admin" && <Badge tone="green">Admin</Badge>}
                  {!m.active && <Badge tone="red">Off</Badge>}
                  <Link href={`/members?edit=${m.id}`} className={buttonClass.secondary}>
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {rejected.length > 0 && (
            <div className="mt-6 border-t border-zinc-100 pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Rejected requests</h3>
              <ul className="divide-y divide-zinc-100">
                {rejected.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <MemberIdentity member={m} />
                    <ActionForm action={approveMemberAction} submitLabel="Accept" variant="secondary" className="flex items-center">
                      <input type="hidden" name="id" value={m.id} />
                    </ActionForm>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {editing ? (
          <Card
            title={`Edit ${editing.name}`}
            action={
              <Link href="/members" className={buttonClass.ghost}>
                Cancel
              </Link>
            }
          >
            <ActionForm action={updateMemberAction} key={editing.id} submitLabel="Save changes">
              <input type="hidden" name="id" value={editing.id} />
              <MemberFields member={editing} />
              <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-700">
                <input type="checkbox" name="active" defaultChecked={editing.active} className="mt-0.5 h-4 w-4 accent-emerald-600" />
                <span>
                  <span className="font-medium text-zinc-900">Active</span>
                  <span className="block text-zinc-500">Turned-off members can&apos;t log in and are left out of new months.</span>
                </span>
              </label>
            </ActionForm>
          </Card>
        ) : (
          <Card title="Add a member" description="Added members can log in straight away.">
            <ActionForm action={addMemberAction} submitLabel="Add member" submitIcon="plus">
              <MemberFields />
            </ActionForm>
          </Card>
        )}
      </div>
    </>
  );
}
