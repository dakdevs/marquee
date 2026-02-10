import type { ReactNode } from "react";

export function SectionHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#1e1e22]">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#52525b]">
        {title}
      </h2>
      {children}
    </div>
  );
}
