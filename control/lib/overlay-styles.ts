import type { TemplateType } from "../../types.ts";

export const overlayStyles: Record<TemplateType, Record<string, string>> = {
  "lower-third": {
    container: "absolute bottom-[80px] left-[80px] flex flex-col",
    name: "lt-name bg-white text-[#0a0a0a] px-8 py-3.5 text-[28px] font-semibold tracking-tight leading-none w-fit",
    title:
      "lt-title bg-[#0a0a0a] text-white px-8 py-2.5 text-[16px] font-normal tracking-[0.04em] uppercase leading-none w-fit",
  },
  "title-card": {
    container:
      "absolute inset-0 flex items-center justify-center flex-col gap-4",
    blurBefore:
      "before:content-[''] before:absolute before:inset-0 before:bg-black/50 before:backdrop-blur-[20px]",
    heading:
      "tc-heading bg-white text-[#0a0a0a] px-12 py-5 text-[48px] font-bold tracking-[-0.03em] leading-none",
    subtitle:
      "tc-subtitle bg-[#0a0a0a] text-white px-9 py-3 text-[20px] font-normal tracking-[0.04em] uppercase leading-none",
  },
  brb: {
    container: "absolute inset-0 flex items-center justify-center",
    text: "brb-text bg-white text-[#0a0a0a] px-16 py-6 text-[64px] font-bold tracking-[-0.03em] leading-none",
  },
  "topic-bar": {
    container: "absolute top-10 left-[80px] flex items-stretch",
    label:
      "tb-label bg-[#0a0a0a] text-white px-5 py-2.5 text-[14px] font-semibold tracking-[0.06em] uppercase leading-none flex items-center",
    content:
      "tb-content bg-white text-[#0a0a0a] px-6 py-2.5 text-[16px] font-medium leading-none flex items-center",
  },
  ticker: {
    container:
      "ticker-wrap absolute bottom-0 left-0 right-0 flex items-stretch h-12",
    label:
      "bg-[#0a0a0a] text-[#ff6600] px-6 text-[16px] font-bold tracking-[0.06em] flex items-center shrink-0",
    content:
      "flex-1 bg-white text-[#0a0a0a] flex items-center px-6 overflow-hidden",
    text: "ticker-text text-[16px] font-medium whitespace-nowrap overflow-hidden text-ellipsis",
  },
};

export const quickTweetStyles = {
  container:
    "quick-tweet absolute bottom-[80px] right-[80px] w-[420px] bg-[rgba(10,10,10,0.85)] backdrop-blur-[12px] border border-white/[0.08] rounded-lg px-6 py-5 flex flex-col gap-2",
  author: "text-[13px] font-semibold text-[#818cf8] tracking-[0.02em]",
  text: "text-[18px] font-medium text-[#e5e5e5] leading-[1.45] break-words",
};

export const previewStyles: Record<TemplateType, Record<string, string>> = {
  "lower-third": {
    container: "absolute bottom-[80px] left-[80px] flex flex-col",
    name: "bg-white text-[#09090b] px-8 py-3.5 text-[28px] font-semibold tracking-tight leading-none w-fit",
    title:
      "bg-[#09090b] text-white px-8 py-2.5 text-[16px] font-normal tracking-[0.04em] uppercase leading-none w-fit",
  },
  "title-card": {
    container:
      "absolute inset-0 flex items-center justify-center flex-col gap-4",
    blurBefore:
      "before:content-[''] before:absolute before:inset-0 before:bg-black/50 before:backdrop-blur-[20px]",
    heading:
      "bg-white text-[#09090b] px-12 py-5 text-[48px] font-bold tracking-[-0.03em] leading-none",
    subtitle:
      "bg-[#09090b] text-white px-9 py-3 text-[20px] font-normal tracking-[0.04em] uppercase leading-none",
  },
  brb: {
    container: "absolute inset-0 flex items-center justify-center",
    text: "bg-white text-[#09090b] px-16 py-6 text-[64px] font-bold tracking-[-0.03em] leading-none",
  },
  "topic-bar": {
    container: "absolute top-10 left-[80px] flex items-stretch",
    label:
      "bg-[#09090b] text-white px-5 py-2.5 text-[14px] font-semibold tracking-[0.06em] uppercase leading-none flex items-center",
    content:
      "bg-white text-[#09090b] px-6 py-2.5 text-[16px] font-medium leading-none flex items-center",
  },
  ticker: {
    container: "absolute bottom-0 left-0 right-0 flex items-stretch h-12",
    label:
      "bg-[#09090b] text-[#ff6600] px-6 text-[16px] font-bold tracking-[0.06em] flex items-center shrink-0",
    content:
      "flex-1 bg-white text-[#09090b] flex items-center px-6 overflow-hidden",
    text: "text-[16px] font-medium whitespace-nowrap overflow-hidden text-ellipsis",
  },
};

export const previewQuickTweetStyles = {
  container:
    "absolute bottom-[80px] right-[80px] w-[420px] bg-[rgba(10,10,10,0.85)] border border-white/[0.08] rounded-lg px-6 py-5 flex flex-col gap-2",
  author: "text-[13px] font-semibold text-[#818cf8]",
  text: "text-[18px] font-medium text-[#e5e5e5] leading-[1.45] break-words",
};
