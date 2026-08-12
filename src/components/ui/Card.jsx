import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full rounded-lg border border-primary-100 bg-white shadow-sm shadow-primary-950/5 dark:border-[#35585e] dark:bg-[#101a1d] dark:shadow-black/30",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("min-w-0 border-b border-slate-100 px-4 py-4 dark:border-[#35585e] sm:px-5", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("min-w-0 p-4 sm:p-5", className)} {...props} />;
}
