import { ArrowRight, Eye, EyeOff } from "lucide-react";

export function SceneActionBar({
  visible,
  needsSync,
  onSyncToLive,
  onSetVisibility,
}: {
  visible: boolean;
  needsSync: boolean;
  onSyncToLive: () => void;
  onSetVisibility: (v: boolean) => void;
}) {
  return (
    <section className="flex items-center justify-between px-5 py-2.5 border-t border-[#1e1e22] bg-[#09090b] shrink-0">
      <button
        className={`inline-flex items-center justify-center gap-[5px] px-5 py-2 font-mono text-[11px] font-semibold border-none rounded-[5px] cursor-pointer transition-[background,opacity,transform,box-shadow] duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] bg-white text-[#09090b] hover:opacity-90 ${needsSync ? "shadow-[0_0_0_2px_rgba(245,158,11,0.35)]" : ""}`}
        onClick={onSyncToLive}
      >
        Sync Draft <ArrowRight size={14} aria-hidden="true" />
      </button>
      <div className="flex gap-[5px]">
        <div className="flex bg-[#111113] rounded-[5px] border border-[#27272a] overflow-hidden">
          <button
            className={`inline-flex items-center gap-1 px-3 py-[5px] font-mono text-[10px] font-semibold bg-transparent border-none cursor-pointer transition-[color,background] duration-150 ease-in-out focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(129,140,248,0.25)] ${visible ? "bg-[#1e1e22] text-[#fafafa]" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
            aria-label="Show overlay"
            onClick={() => onSetVisibility(true)}
          >
            <Eye size={12} aria-hidden="true" />
            Show
          </button>
          <button
            className={`inline-flex items-center gap-1 px-3 py-[5px] font-mono text-[10px] font-semibold bg-transparent border-none cursor-pointer transition-[color,background] duration-150 ease-in-out focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgba(129,140,248,0.25)] ${!visible ? "bg-[#1e1e22] text-[#fafafa]" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
            aria-label="Hide overlay"
            onClick={() => onSetVisibility(false)}
          >
            <EyeOff size={12} aria-hidden="true" />
            Hide
          </button>
        </div>
      </div>
    </section>
  );
}
