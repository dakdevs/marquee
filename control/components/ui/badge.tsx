import type { ReactNode } from "react";

const variantClasses = {
  default: "bg-[#18181b] text-[#52525b]",
  live: "bg-[#0a2e1a] text-[#4ade80]",
  hidden: "bg-[#2e1a0a] text-[#fb923c]",
} as const;

export function Badge({
  variant = "default",
  children,
}: {
  variant?: keyof typeof variantClasses;
  children: ReactNode;
}) {
  return (
    <span
      className={`text-[9px] font-semibold px-[7px] py-0.5 rounded-[3px] uppercase tracking-[0.04em] ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
