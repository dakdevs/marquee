export type TemplateType =
  | "lower-third"
  | "title-card"
  | "brb"
  | "topic-bar"
  | "ticker";

export type OverlayLayer = {
  id: string;
  label: string;
  template: TemplateType;
  props: Record<string, string>;
};

export type Scene = {
  id: string;
  name: string;
  draft: OverlayLayer[];
  live: OverlayLayer[];
  visible: boolean;
};
