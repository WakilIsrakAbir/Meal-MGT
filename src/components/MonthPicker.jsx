import Link from "next/link";
import { addMonths, formatMonth } from "@/lib/dates";
import { Icon, buttonClass } from "./ui";

export default function MonthPicker({ basePath, month }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-xs">
      <Link href={`${basePath}?month=${addMonths(month, -1)}`} className={buttonClass.ghost} aria-label="Previous month">
        <Icon name="left" className="h-4 w-4" />
      </Link>
      <span className="flex min-w-36 items-center justify-center gap-2 px-2 text-sm font-medium text-zinc-800">
        <Icon name="calendar" className="h-4 w-4 text-zinc-400" />
        {formatMonth(month)}
      </span>
      <Link href={`${basePath}?month=${addMonths(month, 1)}`} className={buttonClass.ghost} aria-label="Next month">
        <Icon name="right" className="h-4 w-4" />
      </Link>
    </div>
  );
}
