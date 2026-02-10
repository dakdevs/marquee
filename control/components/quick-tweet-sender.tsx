import { useState } from "react";
import { Send, EyeOff } from "lucide-react";
import { FormField } from "./ui/form-field.tsx";

export function QuickTweetSender({
  activeTweet,
  onShow,
  onHide,
}: {
  activeTweet: { author: string; text: string; url: string } | null;
  onShow: (url: string) => void;
  onHide: () => void;
}) {
  const [url, setUrl] = useState("");

  function handleShow() {
    if (!url.trim()) return;
    onShow(url.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleShow();
    }
  }

  return (
    <section className="px-5 py-2.5 border-t border-[#1e1e22] shrink-0">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#52525b] mb-2">
        Quick Tweet
      </h2>
      <div className="flex flex-col gap-1.5" onKeyDown={handleKeyDown}>
        <FormField label="Tweet URL">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://x.com/…"
            spellCheck={false}
            autoComplete="off"
            className="w-full px-2.5 py-1.5 bg-[#111113] border border-[#27272a] rounded text-[#fafafa] font-mono text-xs outline-none transition-[border-color] duration-150 ease-in-out focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)]"
          />
        </FormField>
        {activeTweet && (
          <div className="px-2.5 py-1.5 bg-[#111113] border border-[#27272a] rounded text-[#a1a1aa] font-mono text-xs leading-relaxed">
            <span className="text-[#52525b]">@{activeTweet.author}</span>{" "}
            {activeTweet.text}
          </div>
        )}
        <div className="flex gap-1.5">
          <button
            className="inline-flex items-center gap-[5px] px-4 py-2 font-mono text-[11px] font-semibold border-none rounded-[5px] cursor-pointer transition-[background,opacity,transform] duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] bg-white text-[#09090b] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleShow}
            disabled={!url.trim()}
          >
            <Send size={12} aria-hidden="true" />
            Show
          </button>
          <button
            className="inline-flex items-center gap-[5px] px-4 py-2 font-mono text-[11px] font-semibold rounded-[5px] cursor-pointer transition-[background,opacity,transform,border-color] duration-150 ease-in-out active:scale-[0.98] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] bg-[#18181b] text-[#fafafa] border border-[#27272a] hover:bg-[#1e1e22] hover:border-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onHide}
            disabled={!activeTweet}
          >
            <EyeOff size={12} aria-hidden="true" />
            Hide
          </button>
        </div>
      </div>
    </section>
  );
}
