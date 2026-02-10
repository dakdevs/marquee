import { test, expect, beforeAll, afterAll } from "bun:test";
import { Database } from "bun:sqlite";
import type { Scene, OverlayLayer, TemplateType } from "./types.ts";

// Test the server DB logic in isolation by recreating the DB helpers

let db: Database;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

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

beforeAll(() => {
  db = new Database(":memory:");
  db.run("PRAGMA journal_mode = WAL");
  db.run(`
    CREATE TABLE scenes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      visible INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    )
  `);
  db.run(`
    CREATE TABLE overlay_layers (
      id TEXT PRIMARY KEY,
      scene_id TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
      state TEXT NOT NULL CHECK(state IN ('draft','live')),
      label TEXT NOT NULL,
      template TEXT NOT NULL,
      props TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `);
});

afterAll(() => {
  db.close();
});

test("create a scene", () => {
  const id = generateId("scene");
  db.run(
    "INSERT INTO scenes (id, name, visible, sort_order) VALUES (?, ?, 1, 0)",
    [id, "Main"],
  );
  const scenes = loadScenes();
  expect(scenes.length).toBe(1);
  expect(scenes[0]!.name).toBe("Main");
  expect(scenes[0]!.visible).toBe(true);
  expect(scenes[0]!.draft).toEqual([]);
  expect(scenes[0]!.live).toEqual([]);
});

test("add a draft layer to a scene", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;
  const layerId = generateId("layer");

  db.run(
    "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'draft', ?, ?, ?, 0)",
    [
      layerId,
      sceneId,
      "Host L3",
      "lower-third",
      JSON.stringify({ name: "Alice", title: "Host" }),
    ],
  );

  const updated = loadScenes();
  expect(updated[0]!.draft.length).toBe(1);
  expect(updated[0]!.draft[0]!.label).toBe("Host L3");
  expect(updated[0]!.draft[0]!.template).toBe("lower-third");
  expect(updated[0]!.draft[0]!.props.name).toBe("Alice");
  expect(updated[0]!.live.length).toBe(0);
});

test("update a layer", () => {
  const scenes = loadScenes();
  const layer = scenes[0]!.draft[0]!;

  db.run("UPDATE overlay_layers SET label = ?, props = ? WHERE id = ?", [
    "Co-host L3",
    JSON.stringify({ name: "Bob", title: "Co-host" }),
    layer.id,
  ]);

  const updated = loadScenes();
  expect(updated[0]!.draft[0]!.label).toBe("Co-host L3");
  expect(updated[0]!.draft[0]!.props.name).toBe("Bob");
});

test("sync draft to live", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;

  // Remove old live layers
  db.run("DELETE FROM overlay_layers WHERE scene_id = ? AND state = 'live'", [
    sceneId,
  ]);

  // Copy draft to live
  for (let i = 0; i < scenes[0]!.draft.length; i++) {
    const l = scenes[0]!.draft[i]!;
    const liveId = `${l.id}-live`;
    db.run(
      "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'live', ?, ?, ?, ?)",
      [liveId, sceneId, l.label, l.template, JSON.stringify(l.props), i],
    );
  }

  const updated = loadScenes();
  expect(updated[0]!.live.length).toBe(1);
  expect(updated[0]!.live[0]!.label).toBe("Co-host L3");
  expect(updated[0]!.live[0]!.props.name).toBe("Bob");
});

test("set visibility", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;

  db.run("UPDATE scenes SET visible = 0 WHERE id = ?", [sceneId]);
  const updated = loadScenes();
  expect(updated[0]!.visible).toBe(false);

  db.run("UPDATE scenes SET visible = 1 WHERE id = ?", [sceneId]);
  const restored = loadScenes();
  expect(restored[0]!.visible).toBe(true);
});

test("delete a layer", () => {
  const scenes = loadScenes();
  const layerId = scenes[0]!.draft[0]!.id;

  db.run("DELETE FROM overlay_layers WHERE id = ? AND state = 'draft'", [
    layerId,
  ]);
  const updated = loadScenes();
  expect(updated[0]!.draft.length).toBe(0);
});

test("rename a scene", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;

  db.run("UPDATE scenes SET name = ? WHERE id = ?", ["Interview", sceneId]);
  const updated = loadScenes();
  expect(updated[0]!.name).toBe("Interview");
});

test("delete a scene removes its layers", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;

  db.run("DELETE FROM overlay_layers WHERE scene_id = ?", [sceneId]);
  db.run("DELETE FROM scenes WHERE id = ?", [sceneId]);

  const updated = loadScenes();
  expect(updated.length).toBe(0);
});

test("multiple scenes with ordering", () => {
  const id1 = generateId("scene");
  const id2 = generateId("scene");

  db.run(
    "INSERT INTO scenes (id, name, visible, sort_order) VALUES (?, ?, 1, 0)",
    [id1, "Main"],
  );
  db.run(
    "INSERT INTO scenes (id, name, visible, sort_order) VALUES (?, ?, 1, 1)",
    [id2, "BRB"],
  );

  const scenes = loadScenes();
  expect(scenes.length).toBe(2);
  expect(scenes[0]!.name).toBe("Main");
  expect(scenes[1]!.name).toBe("BRB");
});

test("reorder draft layers", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;

  const layerA = generateId("layer");
  const layerB = generateId("layer");

  db.run(
    "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'draft', ?, ?, ?, 0)",
    [layerA, sceneId, "Layer A", "lower-third", JSON.stringify({ name: "A" })],
  );
  db.run(
    "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'draft', ?, ?, ?, 1)",
    [layerB, sceneId, "Layer B", "brb", JSON.stringify({ message: "BRB" })],
  );

  // Reorder: B before A
  db.run("UPDATE overlay_layers SET sort_order = 0 WHERE id = ?", [layerB]);
  db.run("UPDATE overlay_layers SET sort_order = 1 WHERE id = ?", [layerA]);

  const updated = loadScenes();
  expect(updated[0]!.draft[0]!.label).toBe("Layer B");
  expect(updated[0]!.draft[1]!.label).toBe("Layer A");
});

test("x-feed cleanup removes legacy x-feed layers", () => {
  const scenes = loadScenes();
  const sceneId = scenes[0]!.id;

  // Insert a legacy x-feed layer
  const xfeedId = generateId("layer");
  db.run(
    "INSERT INTO overlay_layers (id, scene_id, state, label, template, props, sort_order) VALUES (?, ?, 'draft', ?, ?, ?, 99)",
    [xfeedId, sceneId, "X Feed", "x-feed", JSON.stringify({})],
  );

  // Verify it was inserted via raw SQL count
  const beforeCount = db
    .query(
      "SELECT COUNT(*) as cnt FROM overlay_layers WHERE template = 'x-feed'",
    )
    .get() as { cnt: number };
  expect(beforeCount.cnt).toBe(1);

  // Run the cleanup (same as server.ts startup)
  db.run("DELETE FROM overlay_layers WHERE template = 'x-feed'");

  // Verify it's gone
  const afterCount = db
    .query(
      "SELECT COUNT(*) as cnt FROM overlay_layers WHERE template = 'x-feed'",
    )
    .get() as { cnt: number };
  expect(afterCount.cnt).toBe(0);

  // Other layers should still exist
  const after = loadScenes();
  expect(after[0]!.draft.length).toBeGreaterThan(0);
});
