import AppShell from "@/components/AppShell";
import { requireMember } from "@/lib/dal";
import { countPendingMembers } from "@/services/members";

export default async function AppLayout({ children }) {
  const me = await requireMember();
  const pendingCount = me.role === "admin" ? await countPendingMembers() : 0;

  return (
    <AppShell me={me} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
