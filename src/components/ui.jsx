// Shared building blocks for the whole app. No hooks, so they work in server and client components.

const ICONS = {
  home: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  calendar:
    "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  cart: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  wallet:
    "M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3",
  chart:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  users:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  user: "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  logout:
    "M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9",
  left: "M15.75 19.5 8.25 12l7.5-7.5",
  right: "m8.25 4.5 7.5 7.5-7.5 7.5",
  plus: "M12 4.5v15m7.5-7.5h-15",
  check: "m4.5 12.75 6 6 9-13.5",
  x: "M6 18 18 6M6 6l12 12",
  pencil:
    "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125",
  printer:
    "M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z",
  bowl: "M3 12h18M4.5 12a7.5 7.5 0 0 0 15 0M9 21h6M12 3c.75 1.5-.75 2.25 0 3.75M8.25 4.5c.75 1.5-.75 2.25 0 3.75M15.75 4.5c.75 1.5-.75 2.25 0 3.75",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  banknotes:
    "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
  scale:
    "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
  info: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
};

export function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

export function Logo({ dark = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-600/30">
        <Icon name="bowl" className="h-5 w-5" />
      </span>
      <span className={`text-base font-semibold tracking-tight ${dark ? "text-white" : "text-zinc-900"}`}>Meal Manager</span>
    </span>
  );
}

export const inputClass =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 disabled:bg-zinc-50";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60";

export const buttonClass = {
  primary: `${buttonBase} bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/30`,
  secondary: `${buttonBase} border border-zinc-300 bg-white px-4 py-2 text-zinc-700 shadow-xs hover:bg-zinc-50 focus-visible:ring-zinc-400/20`,
  danger: `${buttonBase} px-2.5 py-1.5 text-red-600 hover:bg-red-50 focus-visible:ring-red-500/20`,
  dangerSolid: `${buttonBase} border border-red-200 bg-white px-3 py-1.5 text-red-600 hover:bg-red-50 focus-visible:ring-red-500/20`,
  success: `${buttonBase} bg-emerald-600 px-3 py-1.5 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/30`,
  ghost: `${buttonBase} px-2.5 py-1.5 text-zinc-600 hover:bg-zinc-100 focus-visible:ring-zinc-400/20`,
  icon: `${buttonBase} h-9 w-9 border border-zinc-300 bg-white text-zinc-600 shadow-xs hover:bg-zinc-50 focus-visible:ring-zinc-400/20`,
};

export const table = {
  wrap: "-mx-5 overflow-x-auto sm:-mx-6",
  table: "w-full min-w-max text-sm",
  th: "bg-zinc-50/80 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6",
  td: "px-5 py-3 text-zinc-700 first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6",
  tr: "border-t border-zinc-100 hover:bg-zinc-50/60",
  foot: "px-5 py-3 font-semibold text-emerald-800 first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6",
};

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ title, description, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-zinc-200/80 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="text-base font-semibold text-zinc-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

const STAT_TONES = {
  default: { value: "text-zinc-900", chip: "bg-zinc-100 text-zinc-600" },
  brand: { value: "text-zinc-900", chip: "bg-emerald-50 text-emerald-600" },
  good: { value: "text-emerald-600", chip: "bg-emerald-50 text-emerald-600" },
  bad: { value: "text-red-600", chip: "bg-red-50 text-red-600" },
};

export function Stat({ label, value, hint, icon, tone = "default" }) {
  const t = STAT_TONES[tone];
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-500">{label}</span>
        {icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.chip}`}>
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${t.value}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Badge({ children, tone = "default" }) {
  const toneClass = {
    default: "bg-zinc-100 text-zinc-700 ring-zinc-500/10",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/15",
    blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass}`}>
      {children}
    </span>
  );
}

export function Notice({ children, tone = "amber" }) {
  const toneClass = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    gray: "border-zinc-200 bg-zinc-50 text-zinc-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-800",
  }[tone];
  return (
    <div className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${toneClass}`}>
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon = "info", title, children }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-zinc-900">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-zinc-500">{children}</p>}
    </div>
  );
}

export function Avatar({ name, size = "md" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ${sizeClass}`}>
      {initials}
    </span>
  );
}

export function balanceTone(balance) {
  if (balance > 0.005) return "good";
  if (balance < -0.005) return "bad";
  return "default";
}
