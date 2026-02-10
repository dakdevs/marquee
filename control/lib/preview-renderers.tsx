import type { OverlayLayer } from "../../types.ts";
import { previewStyles, previewQuickTweetStyles } from "./overlay-styles.ts";

function PreviewLowerThird({ props }: { props: Record<string, string> }) {
  const s = previewStyles["lower-third"]!;
  return (
    <div className={s.container}>
      <div className={s.name}>{props.name ?? "Guest Name"}</div>
      <div className={s.title}>{props.title ?? "Podcast Guest"}</div>
    </div>
  );
}

function PreviewTitleCard({ props }: { props: Record<string, string> }) {
  const s = previewStyles["title-card"]!;
  return (
    <div
      className={`${s.container}${props.blur === "on" ? ` ${s.blurBefore}` : ""}`}
    >
      <div className={s.heading}>{props.heading ?? "Episode Title"}</div>
      <div className={s.subtitle}>{props.subtitle ?? "Season 1 Episode 1"}</div>
    </div>
  );
}

function PreviewBrb({ props }: { props: Record<string, string> }) {
  const s = previewStyles.brb!;
  return (
    <div className={s.container}>
      <div className={s.text}>{props.message ?? "Be Right Back"}</div>
    </div>
  );
}

function PreviewTopicBar({ props }: { props: Record<string, string> }) {
  const s = previewStyles["topic-bar"]!;
  return (
    <div className={s.container}>
      <div className={s.label}>Topic</div>
      <div className={s.content}>{props.topic ?? "Current Discussion"}</div>
    </div>
  );
}

function PreviewTicker({ props }: { props: Record<string, string> }) {
  const s = previewStyles.ticker!;
  return (
    <div className={s.container}>
      <div className={s.label}>{props.label ?? "HN"}</div>
      <div className={s.content}>
        <div className={s.text}>
          Show HN: Example Story Title &middot; &#9650;142
        </div>
      </div>
    </div>
  );
}

function PreviewQuickTweet({ props }: { props: Record<string, string> }) {
  const s = previewQuickTweetStyles;
  return (
    <div className={s.container}>
      <div className={s.author}>@{props.author ?? "guest"}</div>
      <div className={s.text}>{props.text ?? "Tweet text..."}</div>
    </div>
  );
}

const renderers: Record<string, React.FC<{ props: Record<string, string> }>> = {
  "lower-third": PreviewLowerThird,
  "title-card": PreviewTitleCard,
  brb: PreviewBrb,
  "topic-bar": PreviewTopicBar,
  ticker: PreviewTicker,
  "quick-tweet": PreviewQuickTweet,
};

export function RenderLayer({ layer }: { layer: OverlayLayer }) {
  const Renderer = renderers[layer.template];
  if (!Renderer) return null;
  return (
    <div className="scene active">
      <Renderer props={layer.props} />
    </div>
  );
}

export function RenderTemplate({
  template,
  props,
}: {
  template: string;
  props: Record<string, string>;
}) {
  const Renderer = renderers[template];
  if (!Renderer) return null;
  return (
    <div className="scene active">
      <Renderer props={props} />
    </div>
  );
}
