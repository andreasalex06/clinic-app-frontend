import { cn } from "../../lib/utils";

export function Badge({ className, tone = "primary", ...props }) {
  const tones = {
    primary: "bg-primary-50 text-primary-700 ring-primary-100 dark:bg-[#0d3435] dark:text-[#a7eee5] dark:ring-[#48d6c9]",
    amber: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900",
    slate: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
    rose: "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-900"
  };

  return (
    <span
      className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium ring-1", tones[tone], className)}
      {...props}
    />
  );
}
