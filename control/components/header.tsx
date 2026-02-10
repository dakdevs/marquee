import { Wifi, WifiOff } from "lucide-react";

export function Header({ connected }: { connected: boolean }) {
  return (
    <header
      className={`flex items-center justify-between px-5 py-3 border-b border-[#1e1e22] shrink-0 relative ${connected ? "after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#22c55e] after:to-transparent" : ""}`}
    >
      <h1 className="text-sm font-semibold tracking-tight">Overlay Control</h1>
      <div
        className={`flex items-center gap-[5px] text-[10px] font-medium px-2.5 py-[3px] rounded-full ${connected ? "bg-[#0a2e1a] text-[#4ade80]" : "bg-[#2e0a0a] text-[#f87171]"}`}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${connected ? "bg-[#22c55e] animate-[pulse-dot_2s_ease-in-out_infinite]" : "bg-[#ef4444]"}`}
          aria-hidden="true"
        />
        {connected ? (
          <Wifi size={12} aria-hidden="true" />
        ) : (
          <WifiOff size={12} aria-hidden="true" />
        )}
        {connected ? "Connected" : "Disconnected"}
      </div>
    </header>
  );
}
