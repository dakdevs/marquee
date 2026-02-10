import type { OverlayLayer, Scene } from "./types.ts";
import {
  overlayStyles,
  quickTweetStyles,
} from "./control/lib/overlay-styles.ts";

function el(tag: string, className: string, text?: string): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}

const templates: Record<
  string,
  (props: Record<string, string>) => HTMLElement
> = {
  "lower-third": (props) => {
    const s = overlayStyles["lower-third"]!;
    const container = el("div", s.container!);
    container.appendChild(el("div", s.name!, props.name ?? "Guest Name"));
    container.appendChild(el("div", s.title!, props.title ?? "Podcast Guest"));
    return container;
  },
  "title-card": (props) => {
    const s = overlayStyles["title-card"]!;
    const container = el(
      "div",
      `${s.container!}${props.blur === "on" ? ` ${s.blurBefore!}` : ""}`,
    );
    container.appendChild(
      el("div", s.heading!, props.heading ?? "Episode Title"),
    );
    container.appendChild(
      el("div", s.subtitle!, props.subtitle ?? "Season 1 Episode 1"),
    );
    return container;
  },
  brb: (props) => {
    const s = overlayStyles.brb!;
    const container = el("div", s.container!);
    container.appendChild(el("div", s.text!, props.message ?? "Be Right Back"));
    return container;
  },
  "topic-bar": (props) => {
    const s = overlayStyles["topic-bar"]!;
    const container = el("div", s.container!);
    container.appendChild(el("div", s.label!, "Topic"));
    container.appendChild(
      el("div", s.content!, props.topic ?? "Current Discussion"),
    );
    return container;
  },
  ticker: (props) => {
    const s = overlayStyles.ticker!;
    const container = el("div", s.container!);
    container.appendChild(el("div", s.label!, props.label ?? "HN"));
    const content = el("div", s.content!);
    content.appendChild(el("div", s.text!, "Loading\u2026"));
    container.appendChild(content);
    return container;
  },
};

// ===== Ticker lifecycle =====

let tickerTimer: ReturnType<typeof setInterval> | null = null;
let tickerStories: { title: string; score: number }[] = [];
let tickerIndex = 0;

async function fetchTopStories(
  count = 20,
): Promise<{ title: string; score: number }[]> {
  try {
    const ids: number[] = await (
      await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")
    ).json();
    const stories = await Promise.all(
      ids
        .slice(0, count)
        .map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (r) => r.json(),
          ),
        ),
    );
    return stories.map((s: { title?: string; score?: number }) => ({
      title: s.title ?? "",
      score: s.score ?? 0,
    }));
  } catch {
    return [];
  }
}

function flipTo(
  contentEl: HTMLElement,
  story: { title: string; score: number },
) {
  const textEl = contentEl.querySelector(".ticker-text") as HTMLElement;
  if (!textEl) return;
  textEl.classList.remove("flip");
  void textEl.offsetWidth;
  textEl.textContent = `${story.title}  \u00b7  \u25b2${story.score}`;
  textEl.classList.add("flip");
}

function startTicker() {
  stopTicker();
  tickerIndex = 0;
  const contentEl = document.querySelector(
    `.${overlayStyles.ticker!.content!.split(" ")[0]}`,
  ) as HTMLElement;
  // Fallback: find ticker content by structure
  const tickerContent =
    contentEl ??
    (document.querySelector(".ticker-wrap > div:nth-child(2)") as HTMLElement);
  if (!tickerContent) return;

  fetchTopStories().then((stories) => {
    if (stories.length === 0) return;
    tickerStories = stories;
    flipTo(tickerContent, stories[0]!);
    tickerTimer = setInterval(() => {
      tickerIndex = (tickerIndex + 1) % tickerStories.length;
      flipTo(tickerContent, tickerStories[tickerIndex]!);
    }, 5000);
  });
}

function stopTicker() {
  if (tickerTimer) {
    clearInterval(tickerTimer);
    tickerTimer = null;
  }
}

// ===== Quick tweet rendering =====

let quickTweetEl: HTMLElement | null = null;

function renderQuickTweet(tweet: { author: string; text: string } | null) {
  if (!tweet) {
    if (quickTweetEl) {
      quickTweetEl.classList.remove("active");
      const old = quickTweetEl;
      quickTweetEl = null;
      setTimeout(() => old.remove(), 500);
    }
    return;
  }

  if (quickTweetEl) {
    const authorEl = quickTweetEl.querySelector("div:first-child");
    const textEl = quickTweetEl.querySelector("div:nth-child(2)");
    if (authorEl) authorEl.textContent = `@${tweet.author}`;
    if (textEl) textEl.textContent = tweet.text;
    return;
  }

  const card = el("div", quickTweetStyles.container);
  card.appendChild(el("div", quickTweetStyles.author, `@${tweet.author}`));
  card.appendChild(el("div", quickTweetStyles.text, tweet.text));
  overlayEl.appendChild(card);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.add("active");
    });
  });

  quickTweetEl = card;
}

// ===== Multi-layer rendering =====

const overlayEl = document.getElementById("overlay")!;
const activeLayers = new Map<
  string,
  { template: string; element: HTMLElement }
>();

function getTargetSceneId(): string | null {
  const params = new URLSearchParams(location.search);
  return params.get("scene");
}

function getTargetScene(allScenes: Scene[]): Scene | undefined {
  const targetId = getTargetSceneId();
  if (targetId) return allScenes.find((s) => s.id === targetId);
  return allScenes[0];
}

function render(scene: Scene | undefined) {
  if (!scene || !scene.visible || scene.live.length === 0) {
    stopTicker();
    for (const [, layer] of activeLayers) {
      layer.element.classList.remove("active");
      const elem = layer.element;
      setTimeout(() => elem.remove(), 500);
    }
    activeLayers.clear();
    return;
  }

  const newLayerIds = new Set(scene.live.map((l) => l.id));

  for (const [id, layer] of activeLayers) {
    if (!newLayerIds.has(id)) {
      if (layer.template === "ticker") stopTicker();
      layer.element.classList.remove("active");
      const elem = layer.element;
      setTimeout(() => elem.remove(), 500);
      activeLayers.delete(id);
    }
  }

  for (const liveLayer of scene.live) {
    const existing = activeLayers.get(liveLayer.id);

    if (existing && existing.template === liveLayer.template) {
      if (liveLayer.template === "ticker") {
        const labelEl = existing.element.querySelector("div > div:first-child");
        if (labelEl) labelEl.textContent = liveLayer.props.label ?? "HN";
      } else {
        const renderer = templates[liveLayer.template];
        if (renderer) {
          existing.element.replaceChildren(renderer(liveLayer.props));
          existing.element.classList.add("active");
        }
      }
    } else if (existing) {
      if (existing.template === "ticker") stopTicker();
      existing.element.classList.remove("active");
      const oldEl = existing.element;
      setTimeout(() => oldEl.remove(), 500);
      activeLayers.delete(liveLayer.id);
      addLayer(liveLayer);
    } else {
      addLayer(liveLayer);
    }
  }
}

function addLayer(layer: OverlayLayer) {
  const renderer = templates[layer.template];
  if (!renderer) return;

  const sceneEl = document.createElement("div");
  sceneEl.className = "scene";
  sceneEl.dataset.layerId = layer.id;
  sceneEl.appendChild(renderer(layer.props));
  overlayEl.appendChild(sceneEl);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sceneEl.classList.add("active");
      if (layer.template === "ticker") startTicker();
    });
  });

  activeLayers.set(layer.id, { template: layer.template, element: sceneEl });
}

// ===== WebSocket =====

function connect() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);

  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "sync") {
      const allScenes: Scene[] = msg.scenes ?? [];
      const scene = getTargetScene(allScenes);
      render(scene);
      renderQuickTweet(msg.quickTweet ?? null);
    }
  });

  ws.addEventListener("close", () => {
    setTimeout(connect, 1000);
  });
}

connect();
