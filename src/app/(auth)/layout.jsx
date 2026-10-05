import { Icon, Logo } from "@/components/ui";

const FEATURES = [
  { icon: "calendar", text: "Mark lunch and dinner for everyone in seconds" },
  { icon: "cart", text: "Record every bazar and shared bill" },
  { icon: "scale", text: "Fair meal rate and balances, worked out for you" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
        <Logo dark />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Home meals, shared fairly.</h2>
          <p className="mt-4 text-lg text-emerald-50/90">
            One place for your home&apos;s meals, bazar, deposits and month-end settlement.
          </p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-emerald-50">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-emerald-100/70">© {new Date().getFullYear()} Meal Manager</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
