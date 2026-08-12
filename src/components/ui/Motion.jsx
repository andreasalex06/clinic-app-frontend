import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";

const easeOut = "easeOut";

export function PageMotion({ className, children, ...props }) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      {children}
    </div>
  );
}

export function MotionSection({ className, children, as = "div", ...props }) {
  const Component = as;

  return (
    <Component
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

export function MotionItem({ className, children, index = 0, as = "div", ...props }) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as] ?? motion.div;

  return (
    <Component
      initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.14, delay: Math.min(index * 0.02, 0.1), ease: easeOut }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
}

export function MotionPanel({ className, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.99 }}
      transition={{ duration: 0.16, ease: easeOut }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
