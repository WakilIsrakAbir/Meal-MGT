"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { Avatar, Icon, Logo } from "./ui";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/meals", label: "Meals", icon: "calendar" },
  { href: "/expenses", label: "Bazar & Bills", icon: "cart" },
  { href: "/deposits", label: "Deposits", icon: "wallet" },
  { href: "/report", label: "Report", icon: "chart" },
  { href: "/members", label: "Members", icon: "users", adminOnly: true },
  { href: "/profile", label: "Profile", icon: "user" },
];

function NavLinks({ isAdmin, pendingCount, compact = false }) {
  const pathname = usePathname();
  return LINKS.filter((link) => !link.adminOnly || isAdmin).map((link) => {
    const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`group flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
          active ? "bg-emerald-50 text-emerald-700" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        <Icon name={link.icon} className={`h-5 w-5 ${active ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600"} ${compact ? "hidden sm:block" : ""}`} />
        {link.label}
        {link.href === "/members" && pendingCount > 0 && (
          <span className="ml-auto rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
            {pendingCount}
          </span>
        )}
      </Link>
    );
  });
}

function LogoutButton({ className }) {
  return (
    <form action={logout}>
      <button type="submit" className={className} title="Log out">
        <Icon name="logout" className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only">Log out</span>
      </button>
    </form>
  );
}

export default function AppShell({ me, pendingCount, children }) {
  const isAdmin = me.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar on large screens */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex print:hidden">
        <div className="flex h-16 items-center px-5">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <NavLinks isAdmin={isAdmin} pendingCount={pendingCount} />
        </nav>
        <div className="border-t border-zinc-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={me.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-zinc-900">{me.name}</div>
              <div className="text-xs text-zinc-500">{isAdmin ? "Admin" : "Member"}</div>
            </div>
            <LogoutButton className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 [&>span]:sr-only" />
          </div>
        </div>
      </aside>

      {/* Top bar on phones and tablets */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur lg:hidden print:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Avatar name={me.name} size="sm" />
            <LogoutButton className="flex items-center gap-1.5 rounded-lg p-2 text-sm text-zinc-500 hover:bg-zinc-100" />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          <NavLinks isAdmin={isAdmin} pendingCount={pendingCount} compact />
        </nav>
      </header>

      <div className="lg:pl-64 print:pl-0">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
