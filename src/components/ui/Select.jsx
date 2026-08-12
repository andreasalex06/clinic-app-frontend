import { cn } from "../../lib/utils";

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-[#4a7378] dark:bg-[#0b1518] dark:text-slate-100 dark:focus:border-[#48d6c9] dark:focus:ring-[#0d3435]",
        className
      )}
      {...props}
    />
  );
}
