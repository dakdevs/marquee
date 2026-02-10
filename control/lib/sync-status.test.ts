import { test, expect, describe } from "bun:test";
import { computeSyncStatus } from "./sync-status.ts";
import type { OverlayLayer } from "../../types.ts";

function layer(id: string, overrides?: Partial<OverlayLayer>): OverlayLayer {
  return {
    id,
    label: "Layer",
    template: "lower-third",
    props: { name: "Test" },
    ...overrides,
  };
}

describe("computeSyncStatus", () => {
  test("identical draft/live → all synced", () => {
    const draft = [layer("a")];
    const live = [layer("a-live")];
    const { sceneSynced, draftStatuses, deletedFromDraft } = computeSyncStatus(
      draft,
      live,
    );
    expect(sceneSynced).toBe(true);
    expect(draftStatuses.get("a")).toBe("synced");
    expect(deletedFromDraft).toEqual([]);
  });

  test("changed props → modified", () => {
    const draft = [layer("a", { props: { name: "Updated" } })];
    const live = [layer("a-live", { props: { name: "Original" } })];
    const { sceneSynced, draftStatuses } = computeSyncStatus(draft, live);
    expect(sceneSynced).toBe(false);
    expect(draftStatuses.get("a")).toBe("modified");
  });

  test("changed label → modified", () => {
    const draft = [layer("a", { label: "New Label" })];
    const live = [layer("a-live", { label: "Old Label" })];
    const { draftStatuses } = computeSyncStatus(draft, live);
    expect(draftStatuses.get("a")).toBe("modified");
  });

  test("changed template → modified", () => {
    const draft = [layer("a", { template: "brb" })];
    const live = [layer("a-live", { template: "lower-third" })];
    const { draftStatuses } = computeSyncStatus(draft, live);
    expect(draftStatuses.get("a")).toBe("modified");
  });

  test("reordered layers → modified", () => {
    const draft = [layer("a"), layer("b")];
    const live = [layer("b-live"), layer("a-live")];
    const { sceneSynced, draftStatuses } = computeSyncStatus(draft, live);
    expect(sceneSynced).toBe(false);
    expect(draftStatuses.get("a")).toBe("modified");
    expect(draftStatuses.get("b")).toBe("modified");
  });

  test("new draft layer (no live match) → new", () => {
    const draft = [layer("a"), layer("b")];
    const live = [layer("a-live")];
    const { sceneSynced, draftStatuses } = computeSyncStatus(draft, live);
    expect(sceneSynced).toBe(false);
    expect(draftStatuses.get("a")).toBe("synced");
    expect(draftStatuses.get("b")).toBe("new");
  });

  test("deleted from draft (live has no draft match) → in deletedFromDraft", () => {
    const draft = [layer("a")];
    const live = [layer("a-live"), layer("b-live")];
    const { sceneSynced, deletedFromDraft } = computeSyncStatus(draft, live);
    expect(sceneSynced).toBe(false);
    expect(deletedFromDraft.length).toBe(1);
    expect(deletedFromDraft[0]!.id).toBe("b-live");
  });

  test("both empty → synced", () => {
    const { sceneSynced, draftStatuses, deletedFromDraft } = computeSyncStatus(
      [],
      [],
    );
    expect(sceneSynced).toBe(true);
    expect(draftStatuses.size).toBe(0);
    expect(deletedFromDraft).toEqual([]);
  });
});
