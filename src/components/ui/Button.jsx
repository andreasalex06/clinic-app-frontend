import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", disabled, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 dark:bg-[#249d8f] dark:text-white dark:hover:bg-[#38c9ba]",
    outline:
      "border border-primary-200 bg-white text-primary-800 hover:bg-primary-50 dark:border-[#4a7378] dark:bg-[#101a1d] dark:text-slate-100 dark:hover:!border-[#48d6c9] dark:hover:!bg-[#0d3435] dark:hover:!text-white",
    ghost:
      "text-slate-600 hover:bg-primary-50 hover:text-primary-800 dark:text-slate-300 dark:hover:bg-[#0d3435] dark:hover:text-white",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
    danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
  };

  return (
    <motion.button
      whileTap={!disabled && !shouldReduceMotion ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={cn(
        "inline-flex h-10 min-w-0 max-w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-center text-sm font-medium leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
