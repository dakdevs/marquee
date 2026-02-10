import type React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { OverlayLayer } from "../../types.ts";
import { templateLabels } from "../lib/template-config.ts";
import type { LayerSyncStatus } from "../lib/sync-status.ts";
import { Badge } from "./ui/badge.tsx";

export function SortableLayerItem({
  layer,
  isSelected,
  syncStatus,
  onSelect,
  onDelete,
}: {
  layer: OverlayLayer;
  isSelected: boolean;
  syncStatus?: LayerSyncStatus;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: layer.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-1.5 px-2 rounded-[5px] cursor-pointer transition-[background,border-color] duration-100 ease-in-out border mb-0.5 relative before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-[1px] before:transition-colors before:duration-100 ${
        isSelected
          ? "bg-[#18181b] border-[#27272a] before:bg-[#818cf8]"
          : "border-transparent hover:bg-[#111113] hover:before:bg-[#3f3f46]"
      }`}
      onClick={onSelect}
    >
      <span
        className="flex items-center cursor-grab text-[#27272a] shrink-0 p-0.5 select-none touch-none hover:text-[#52525b]"
        aria-label="Reorder layer"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} aria-hidden="true" />
      </span>
      {syncStatus && syncStatus !== "synced" && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${syncStatus === "modified" ? "bg-[#f59e0b]" : "bg-[#818cf8]"}`}
          aria-label={syncStatus === "modified" ? "Modified" : "New"}
        />
      )}
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {layer.label}
        </span>
        <Badge>{templateLabels[layer.template] ?? layer.template}</Badge>
      </div>
      <button
        className="flex items-center opacity-0 bg-transparent border-none text-[#52525b] cursor-pointer p-0.5 rounded-[3px] transition-[opacity,color,background] duration-100 hover:text-[#f87171] hover:bg-[#2e0a0a] focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] [div:hover>&]:opacity-100"
        aria-label={`Delete layer ${layer.label}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  );
}
