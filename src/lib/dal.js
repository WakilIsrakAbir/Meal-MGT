import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMemberById } from "@/services/members";
import { UserError } from "./errors";
import { SESSION_COOKIE, decrypt } from "./session";

// The logged-in member, loaded from the database so approval, role changes
// and deactivation take effect immediately. Cached for one request.
export const getCurrentMember = cache(async () => {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session?.memberId) return null;
  const member = await getMemberById(session.memberId);
  return member?.active && member.status === "approved" ? member : null;
});

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return member;
}

export async function requireAdmin() {
  const member = await requireMember();
  if (member.role !== "admin") throw new UserError("Only the admin can do this.");
  return member;
}
