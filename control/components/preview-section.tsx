import { useRef, useEffect } from "react";
import type { OverlayLayer } from "../../types.ts";
import { RenderLayer, RenderTemplate } from "../lib/preview-renderers.tsx";
import { Badge } from "./ui/badge.tsx";

export function PreviewSection({
  liveLayers,
  visible,
  draftTemplate,
  draftProps,
}: {
  liveLayers: OverlayLayer[];
  visible: boolean;
  draftTemplate: string | null;
  draftProps: Record<string, string> | null;
}) {
  const liveWrapperRef = useRef<HTMLDivElement>(null);
  const draftWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function scalePreviews() {
      for (const ref of [liveWrapperRef, draftWrapperRef]) {
        const wrapper = ref.current?.parentElement;
        const frame = ref.current;
        if (!wrapper || !frame) continue;
        const scale = wrapper.clientWidth / 1920;
        frame.style.transform = `scale(${scale})`;
      }
    }
    scalePreviews();
    window.addEventListener("resize", scalePreviews);
    return () => window.removeEventListener("resize", scalePreviews);
  }, []);

  const isLiveOnAir = liveLayers.length > 0 && visible;

  const liveBadge =
    liveLayers.length === 0
      ? { text: "Off", variant: "default" as const }
      : visible
        ? {
            text:
              liveLayers.length === 1
                ? "On Air"
                : `On Air \u00b7 ${liveLayers.length}`,
            variant: "live" as const,
          }
        : { text: "Hidden", variant: "hidden" as const };

  return (
    <section className="px-5 py-3.5 border-b border-[#1e1e22] shrink-0">
      <div className="grid grid-cols-2 gap-3.5">
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#52525b]">
              Draft
            </h2>
            <Badge>Draft</Badge>
          </div>
          <div className="bg-[#111113] rounded-[5px] overflow-hidden aspect-video relative border border-dashed border-[#27272a]">
            <div
              ref={draftWrapperRef}
              className="preview-frame w-[1920px] h-[1080px] origin-top-left absolute top-0 left-0 bg-transparent font-mono"
            >
              {draftTemplate && draftProps && (
                <RenderTemplate template={draftTemplate} props={draftProps} />
              )}
            </div>
          </div>
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#52525b]">
              Live
            </h2>
            <div className="flex gap-1">
              <Badge variant={liveBadge.variant}>{liveBadge.text}</Badge>
            </div>
          </div>
          <div
            className={`bg-[#111113] rounded-[5px] overflow-hidden aspect-video relative ${isLiveOnAir ? "border border-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.15)]" : "border border-[#1e1e22]"}`}
          >
            <div
              ref={liveWrapperRef}
              className="preview-frame w-[1920px] h-[1080px] origin-top-left absolute top-0 left-0 bg-transparent font-mono"
            >
              {liveLayers.map((layer) => (
                <RenderLayer key={layer.id} layer={layer} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
