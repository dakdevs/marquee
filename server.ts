import { Database } from "bun:sqlite";
import overlay from "./overlay.html";
import control from "./control/control.html";
import type { Scene, OverlayLayer, TemplateType } from "./types.ts";

// ===== SQLite persistence =====

const dbPath = process.env.OVERLAY_DB_PATH ?? "overlay.db";
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL");

// Drop old tables if they exist
db.run("DROP TABLE IF EXISTS presets");
db.run("DROP TABLE IF EXISTS live_state");

db.run(`
  CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS overlay_layers (
    id TEXT PRIMARY KEY,
    scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    state TEXT NOT NULL CHECK(state IN ('draft','live')),
    label TEXT NOT NULL,
    template TEXT NOT NULL,
    props TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  )
`);

// Clean up any legacy x-feed layers
db.run("DELETE FROM overlay_layers WHERE template = 'x-feed'");

function loadScenes(): Scene[] {
  const sceneRows = db
    .query("SELECT id, name, visible FROM scenes ORDER BY sort_order")
    .all() as { id: string; name: string; visible: number }[];

  return sceneRows.map((row) => {
    const layers = db
      .query(
        "SELECT id, state, label, template, props FROM overlay_layers WHERE scene_id = ? ORDER BY sort_order",
      )
      .all(row.id) as {
      id: string;
      state: string;
      label: string;
      template: string;
      props: string;
    }[];

    const draft: OverlayLayer[] = [];
    const live: OverlayLayer[] = [];

    for (const l of layers) {
      const layer: OverlayLayer = {
        id: l.id,
        label: l.label,
        template: l.template as TemplateType,
        props: JSON.parse(l.props),
      };
      if (l.state === "draft") draft.push(layer);
      else live.push(layer);
    }

    return {
      id: row.id,
      name: row.name,
      draft,
      live,
      visible: row.visible === 1,
    };
  });
}

let nextId = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${nextId++}`;
}

// Seed default scene if DB has none
let scenes = loadScenes();
if (scenes.length === 0) {
  const sceneId = "scene-main";
  db.run(
    "INSERT INTO scenes (id, name, visible, sort_order) VALUES (?, ?, 1, 0)",
    [sceneId, "Main"],
  );
  const layerId = generateId("layer");
  db.run(
    "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'draft', ?, ?, ?, 0)",
    [
      layerId,
      sceneId,
      "Host Lower Third",
      "lower-third",
      JSON.stringify({ name: "Guest Name", title: "Podcast Guest" }),
    ],
  );
  scenes = loadScenes();
}

// ===== Quick tweet (ephemeral, not persisted) =====

let quickTweet: { author: string; text: string; url: string } | null = null;

function fullSync(): Record<string, unknown> {
  return { type: "sync", scenes, quickTweet };
}

// ===== DB helpers =====

function dbAddScene(name: string): Scene {
  const id = generateId("scene");
  const sortOrder = scenes.length;
  db.run(
    "INSERT INTO scenes (id, name, visible, sort_order) VALUES (?, ?, 1, ?)",
    [id, name, sortOrder],
  );
  const scene: Scene = { id, name, draft: [], live: [], visible: true };
  scenes.push(scene);
  return scene;
}

function dbRenameScene(sceneId: string, name: string) {
  db.run("UPDATE scenes SET name = ? WHERE id = ?", [name, sceneId]);
  const scene = scenes.find((s) => s.id === sceneId);
  if (scene) scene.name = name;
}

function dbDeleteScene(sceneId: string) {
  db.run("DELETE FROM overlay_layers WHERE scene_id = ?", [sceneId]);
  db.run("DELETE FROM scenes WHERE id = ?", [sceneId]);
  scenes = scenes.filter((s) => s.id !== sceneId);
}

function dbAddLayer(
  sceneId: string,
  label: string,
  template: TemplateType,
  props: Record<string, string>,
): OverlayLayer | null {
  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene) return null;

  const id = generateId("layer");
  const sortOrder = scene.draft.length;
  db.run(
    "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'draft', ?, ?, ?, ?)",
    [id, sceneId, label, template, JSON.stringify(props), sortOrder],
  );

  const layer: OverlayLayer = { id, label, template, props };
  scene.draft.push(layer);
  return layer;
}

function dbUpdateLayer(
  sceneId: string,
  layerId: string,
  updates: {
    label?: string;
    template?: TemplateType;
    props?: Record<string, string>;
  },
) {
  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene) return;

  const layer = scene.draft.find((l) => l.id === layerId);
  if (!layer) return;

  if (updates.label !== undefined) layer.label = updates.label;
  if (updates.template !== undefined) layer.template = updates.template;
  if (updates.props !== undefined) layer.props = updates.props;

  db.run(
    "UPDATE overlay_layers SET label = ?, template = ?, props = ? WHERE id = ?",
    [layer.label, layer.template, JSON.stringify(layer.props), layerId],
  );
}

function dbDeleteLayer(sceneId: string, layerId: string) {
  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene) return;

  scene.draft = scene.draft.filter((l) => l.id !== layerId);
  db.run("DELETE FROM overlay_layers WHERE id = ? AND state = 'draft'", [
    layerId,
  ]);
}

function dbReorderLayers(sceneId: string, layerIds: string[]) {
  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene) return;

  const layerMap = new Map(scene.draft.map((l) => [l.id, l]));
  const reordered: OverlayLayer[] = [];
  for (const id of layerIds) {
    const layer = layerMap.get(id);
    if (layer) reordered.push(layer);
  }
  scene.draft = reordered;

  for (let i = 0; i < reordered.length; i++) {
    db.run("UPDATE overlay_layers SET sort_order = ? WHERE id = ?", [
      i,
      reordered[i]!.id,
    ]);
  }
}

function dbSyncToLive(sceneId: string) {
  const scene = scenes.find((s) => s.id === sceneId);
  if (!scene) return;

  // Remove old live layers from DB
  db.run("DELETE FROM overlay_layers WHERE scene_id = ? AND state = 'live'", [
    sceneId,
  ]);

  // Copy draft to live
  scene.live = scene.draft.map((l) => ({ ...l, props: { ...l.props } }));

  for (let i = 0; i < scene.live.length; i++) {
    const l = scene.live[i]!;
    const liveId = `${l.id}-live`;
    db.run(
      "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'live', ?, ?, ?, ?)",
      [liveId, sceneId, l.label, l.template, JSON.stringify(l.props), i],
    );
  }
}

function dbSetVisibility(sceneId: string, visible: boolean) {
  db.run("UPDATE scenes SET visible = ? WHERE id = ?", [
    visible ? 1 : 0,
    sceneId,
  ]);
  const scene = scenes.find((s) => s.id === sceneId);
  if (scene) scene.visible = visible;
}

// ===== Server =====

function broadcastSync() {
  const sync = JSON.stringify(fullSync());
  server.publish("overlay", sync);
}

const port = Number(process.env.OVERLAY_PORT) || 3010;

const server = Bun.serve({
  port,
  routes: {
    "/overlay": overlay,
    "/control": control,
  },
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
      return undefined;
    }
    if (url.pathname === "/") {
      return Response.redirect("/control");
    }
    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      ws.subscribe("overlay");
      ws.send(JSON.stringify(fullSync()));
    },
    async message(ws, message) {
      const msg = JSON.parse(String(message));

      switch (msg.type) {
        case "create-scene": {
          dbAddScene(msg.name ?? "Untitled");
          break;
        }
        case "rename-scene": {
          dbRenameScene(msg.sceneId, msg.name);
          break;
        }
        case "delete-scene": {
          dbDeleteScene(msg.sceneId);
          break;
        }
        case "add-layer": {
          dbAddLayer(msg.sceneId, msg.label, msg.template, msg.props ?? {});
          break;
        }
        case "update-layer": {
          dbUpdateLayer(msg.sceneId, msg.layerId, {
            label: msg.label,
            template: msg.template,
            props: msg.props,
          });
          break;
        }
        case "delete-layer": {
          dbDeleteLayer(msg.sceneId, msg.layerId);
          break;
        }
        case "reorder-layers": {
          dbReorderLayers(msg.sceneId, msg.layerIds);
          break;
        }
        case "sync-to-live": {
          dbSyncToLive(msg.sceneId);
          break;
        }
        case "set-visibility": {
          dbSetVisibility(msg.sceneId, msg.visible);
          break;
        }
        case "show-tweet": {
          const url = msg.url as string | undefined;
          if (url) {
            try {
              const oembed = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
              const res = await fetch(oembed);
              if (res.ok) {
                const data = (await res.json()) as {
                  author_name?: string;
                  html?: string;
                };
                const author = data.author_name ?? "";
                const match = data.html?.match(/<p[^>]*>([\s\S]*?)<\/p>/);
                const text =
                  match?.[1]
                    ?.replace(/<[^>]*>/g, "")
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"') ?? "";
                quickTweet = { author, text, url };
              }
            } catch {
              /* network error, ignore */
            }
          }
          break;
        }
        case "hide-tweet": {
          quickTweet = null;
          break;
        }
      }

      const sync = JSON.stringify(fullSync());
      ws.publish("overlay", sync);
      ws.send(sync);
    },
    close(ws) {
      ws.unsubscribe("overlay");
    },
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at http://localhost:${port}`);
console.log(`  Overlay: http://localhost:${port}/overlay`);
console.log(`  Control: http://localhost:${port}/control`);
