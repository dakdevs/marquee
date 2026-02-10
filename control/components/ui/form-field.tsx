import type { ReactNode } from "react";

export function FormField({
  label,
  toggle,
  children,
}: {
  label: string;
  toggle?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex gap-[3px] ${toggle ? "flex-row items-center justify-between" : "flex-col"}`}
    >
      <label className="text-[9px] font-semibold text-[#52525b] uppercase tracking-[0.06em]">
        {label}
      </label>
      {children}
    </div>
  );
}
