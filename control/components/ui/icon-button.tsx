import type { ReactNode } from "react";

export function IconButton({
  "aria-label": ariaLabel,
  onClick,
  children,
}: {
  "aria-label": string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className="w-6 h-6 flex items-center justify-center bg-[#18181b] border border-[#27272a] rounded text-[#fafafa] text-sm font-mono cursor-pointer transition-[background,border-color] duration-150 ease-in-out hover:bg-[#1e1e22] hover:border-[#3f3f46] focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] focus-visible:outline-none"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
