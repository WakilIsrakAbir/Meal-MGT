import AppShell from "@/components/AppShell";
import { requireMember } from "@/lib/dal";
import { countPendingMembers } from "@/services/members";

export default async function AppLayout({ children }) {
  // Both at once (one trip to the database); members just don't see the count.
  const [me, pending] = await Promise.all([requireMember(), countPendingMembers()]);
  const pendingCount = me.role === "admin" ? pending : 0;

  return (
    <AppShell me={me} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
