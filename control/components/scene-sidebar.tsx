import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Scene } from "../../types.ts";
import { computeSyncStatus } from "../lib/sync-status.ts";
import { SectionHeader } from "./ui/section-header.tsx";
import { IconButton } from "./ui/icon-button.tsx";

export function SceneSidebar({
  scenes,
  selectedSceneId,
  onSelect,
  onCreateScene,
  onRenameScene,
  onDeleteScene,
}: {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelect: (id: string) => void;
  onCreateScene: (name: string) => void;
  onRenameScene: (sceneId: string, name: string) => void;
  onDeleteScene: (sceneId: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleCreate() {
    onCreateScene("Untitled");
  }

  function startRename(scene: Scene) {
    setEditingId(scene.id);
    setEditName(scene.name);
  }

  function commitRename() {
    if (editingId && editName.trim()) {
      onRenameScene(editingId, editName.trim());
    }
    setEditingId(null);
  }

  return (
    <aside className="w-[220px] min-w-[220px] border-r border-[#1e1e22] flex flex-col overflow-hidden">
      <SectionHeader title="Scenes">
        <IconButton aria-label="Add scene" onClick={handleCreate}>
          <Plus size={14} aria-hidden="true" />
        </IconButton>
      </SectionHeader>
      <div
        className="flex-1 overflow-y-auto p-1.5"
        role="listbox"
        aria-label="Scenes"
      >
        {scenes.map((scene) => {
          const { sceneSynced } = computeSyncStatus(scene.draft, scene.live);
          const isSelected = scene.id === selectedSceneId;

          return (
            <div
              key={scene.id}
              role="option"
              tabIndex={0}
              aria-selected={isSelected}
              className={`flex items-center justify-between py-2 px-2.5 rounded-[5px] cursor-pointer transition-[background,border-color] duration-100 ease-in-out border mb-0.5 text-xs font-medium relative before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-[1px] before:transition-colors before:duration-100 ${
                isSelected
                  ? "bg-[#18181b] border-[#27272a] before:bg-[#818cf8]"
                  : "border-transparent hover:bg-[#111113] hover:before:bg-[#3f3f46]"
              } ${!scene.visible ? "opacity-50" : ""}`}
              onClick={() => onSelect(scene.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(scene.id);
                }
              }}
            >
              {editingId === scene.id ? (
                <input
                  className="flex-1 min-w-0 px-1.5 py-0.5 bg-[#111113] border border-[#3f3f46] rounded-[3px] text-[#fafafa] font-mono text-xs outline-none focus-visible:border-[#818cf8] focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)]"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRename(scene);
                  }}
                >
                  {scene.name}
                </span>
              )}
              {!sceneSynced && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0 ml-1.5" />
              )}
              {scenes.length > 1 && (
                <button
                  className="flex items-center opacity-0 bg-transparent border-none text-[#52525b] cursor-pointer p-0.5 rounded-[3px] transition-[opacity,color,background] duration-100 group-hover:opacity-100 hover:text-[#f87171] hover:bg-[#2e0a0a] focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_rgba(129,140,248,0.25)] [div:hover>&]:opacity-100"
                  aria-label={`Delete scene ${scene.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScene(scene.id);
                  }}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
