import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { OverlayLayer } from "../../types.ts";
import { SortableLayerItem } from "./sortable-layer-item.tsx";
import { computeSyncStatus } from "../lib/sync-status.ts";
import { templateLabels } from "../lib/template-config.ts";
import { SectionHeader } from "./ui/section-header.tsx";
import { IconButton } from "./ui/icon-button.tsx";
import { Badge } from "./ui/badge.tsx";

export function DraftLayerList({
  layers,
  liveLayers,
  selectedLayerId,
  onSelect,
  onDelete,
  onReorder,
  onAddOverlay,
}: {
  layers: OverlayLayer[];
  liveLayers: OverlayLayer[];
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onAddOverlay: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { draftStatuses, deletedFromDraft } = computeSyncStatus(
    layers,
    liveLayers,
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layers.findIndex((l) => l.id === active.id);
    const newIndex = layers.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...layers];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved!);
    onReorder(newOrder.map((l) => l.id));
  }

  return (
    <div className="grid grid-cols-2 border-b border-[#1e1e22] shrink-0">
      <section className="min-w-0 overflow-hidden">
        <SectionHeader title="Draft">
          <IconButton aria-label="Add overlay" onClick={onAddOverlay}>
            <Plus size={14} aria-hidden="true" />
          </IconButton>
        </SectionHeader>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={layers.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-1.5 px-3.5 max-h-[180px] overflow-y-auto">
              {layers.length === 0 && (
                <div className="py-4 text-center text-[#27272a] text-[11px]">
                  No layers yet. Add an overlay to get started.
                </div>
              )}
              {layers.map((layer) => (
                <SortableLayerItem
                  key={layer.id}
                  layer={layer}
                  isSelected={layer.id === selectedLayerId}
                  syncStatus={draftStatuses.get(layer.id)}
                  onSelect={() => onSelect(layer.id)}
                  onDelete={() => onDelete(layer.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <section className="min-w-0 overflow-hidden border-l border-[#1e1e22]">
        <SectionHeader title="Live" />
        <div className="p-1.5 px-3.5 max-h-[180px] overflow-y-auto">
          {liveLayers.length === 0 && deletedFromDraft.length === 0 && (
            <div className="py-4 text-center text-[#27272a] text-[11px]">
              Not synced yet
            </div>
          )}
          {liveLayers.map((layer) => (
            <LiveLayerItem key={layer.id} layer={layer} />
          ))}
          {deletedFromDraft.map((layer) => (
            <LiveLayerItem key={layer.id} layer={layer} deleted />
          ))}
        </div>
      </section>
    </div>
  );
}

function LiveLayerItem({
  layer,
  deleted,
}: {
  layer: OverlayLayer;
  deleted?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded-[5px] cursor-default mb-0.5 text-xs ${deleted ? "opacity-30 line-through" : "opacity-50"}`}
    >
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {layer.label}
        </span>
        <Badge>{templateLabels[layer.template] ?? layer.template}</Badge>
      </div>
    </div>
  );
}
