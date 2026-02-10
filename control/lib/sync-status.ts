import type { OverlayLayer } from "../../types.ts";

export type LayerSyncStatus = "synced" | "modified" | "new";

export function computeSyncStatus(
  draft: OverlayLayer[],
  live: OverlayLayer[],
): {
  sceneSynced: boolean;
  draftStatuses: Map<string, LayerSyncStatus>;
  deletedFromDraft: OverlayLayer[];
} {
  const draftStatuses = new Map<string, LayerSyncStatus>();

  // Live layer IDs follow pattern `{draftId}-live` (from dbSyncToLive)
  const liveByDraftId = new Map<
    string,
    { layer: OverlayLayer; index: number }
  >();
  for (let i = 0; i < live.length; i++) {
    const l = live[i]!;
    const draftId = l.id.replace(/-live$/, "");
    liveByDraftId.set(draftId, { layer: l, index: i });
  }

  const matchedDraftIds = new Set<string>();

  for (let i = 0; i < draft.length; i++) {
    const d = draft[i]!;
    const liveMatch = liveByDraftId.get(d.id);

    if (!liveMatch) {
      draftStatuses.set(d.id, "new");
      continue;
    }

    matchedDraftIds.add(d.id);

    const l = liveMatch.layer;
    if (
      d.label !== l.label ||
      d.template !== l.template ||
      JSON.stringify(d.props) !== JSON.stringify(l.props) ||
      i !== liveMatch.index
    ) {
      draftStatuses.set(d.id, "modified");
    } else {
      draftStatuses.set(d.id, "synced");
    }
  }

  // Live layers whose draft counterpart no longer exists
  const deletedFromDraft: OverlayLayer[] = [];
  for (const [draftId, { layer }] of liveByDraftId) {
    if (!matchedDraftIds.has(draftId) && !draft.some((d) => d.id === draftId)) {
      deletedFromDraft.push(layer);
    }
  }

  const sceneSynced =
    deletedFromDraft.length === 0 &&
    [...draftStatuses.values()].every((s) => s === "synced");

  return { sceneSynced, draftStatuses, deletedFromDraft };
}
