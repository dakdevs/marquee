import type { TemplateType } from "../../types.ts";

export const templateDefaults: Record<
  TemplateType,
  {
    label: string;
    key: string;
    placeholder: string;
    type?: "toggle";
  }[]
> = {
  "lower-third": [
    { label: "Name", key: "name", placeholder: "Guest Name" },
    { label: "Title", key: "title", placeholder: "Podcast Guest" },
  ],
  "title-card": [
    { label: "Heading", key: "heading", placeholder: "Episode Title" },
    { label: "Subtitle", key: "subtitle", placeholder: "Season 1 Episode 1" },
    { label: "Blur Background", key: "blur", placeholder: "", type: "toggle" },
  ],
  brb: [{ label: "Message", key: "message", placeholder: "Be Right Back" }],
  "topic-bar": [
    { label: "Topic", key: "topic", placeholder: "Current Discussion" },
  ],
  ticker: [{ label: "Label", key: "label", placeholder: "HN" }],
};

export const templateLabels: Record<TemplateType, string> = {
  "lower-third": "Lower Third",
  "title-card": "Title Card",
  brb: "BRB",
  "topic-bar": "Topic Bar",
  ticker: "Ticker",
};

export const allTemplateTypes: TemplateType[] = [
  "lower-third",
  "title-card",
  "brb",
  "topic-bar",
  "ticker",
];

export function getDefaultProps(
  template: TemplateType,
): Record<string, string> {
  const fields = templateDefaults[template];
  const props: Record<string, string> = {};
  for (const f of fields) {
    props[f.key] = f.placeholder;
  }
  return props;
}
