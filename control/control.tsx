import { createRoot } from "react-dom/client";
import { useState, useCallback } from "react";
import { useWebSocket } from "./hooks/use-websocket.ts";
import { Header } from "./components/header.tsx";
import { SceneSidebar } from "./components/scene-sidebar.tsx";
import { PreviewSection } from "./components/preview-section.tsx";
import { DraftLayerList } from "./components/draft-layer-list.tsx";
import { LayerEditor } from "./components/layer-editor.tsx";
import { SceneActionBar } from "./components/scene-action-bar.tsx";
import { AddOverlayModal } from "./components/add-overlay-modal.tsx";
import { QuickTweetSender } from "./components/quick-tweet-sender.tsx";
import { computeSyncStatus } from "./lib/sync-status.ts";

function App() {
  const { scenes, quickTweet, connected, send } = useWebSocket();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftPreview, setDraftPreview] = useState<{
    template: string;
    props: Record<string, string>;
  } | null>(null);

  const effectiveSceneId =
    selectedSceneId && scenes.find((s) => s.id === selectedSceneId)
      ? selectedSceneId
      : (scenes[0]?.id ?? null);

  const currentScene = scenes.find((s) => s.id === effectiveSceneId);
  const selectedLayer =
    currentScene?.draft.find((l) => l.id === selectedLayerId) ?? null;

  const { sceneSynced } = computeSyncStatus(
    currentScene?.draft ?? [],
    currentScene?.live ?? [],
  );

  const handlePreviewChange = useCallback(
    (template: string, props: Record<string, string>) => {
      setDraftPreview({ template, props });
    },
    [],
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090b] text-[#fafafa] font-mono">
      <Header connected={connected} />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <SceneSidebar
          scenes={scenes}
          selectedSceneId={effectiveSceneId}
          onSelect={(id) => {
            setSelectedSceneId(id);
            setSelectedLayerId(null);
            setDraftPreview(null);
          }}
          onCreateScene={(name) => send({ type: "create-scene", name })}
          onRenameScene={(sceneId, name) =>
            send({ type: "rename-scene", sceneId, name })
          }
          onDeleteScene={(sceneId) => {
            send({ type: "delete-scene", sceneId });
            if (sceneId === effectiveSceneId) {
              setSelectedSceneId(null);
              setSelectedLayerId(null);
              setDraftPreview(null);
            }
          }}
        />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <PreviewSection
            liveLayers={currentScene?.live ?? []}
            visible={currentScene?.visible ?? false}
            draftTemplate={draftPreview?.template ?? null}
            draftProps={draftPreview?.props ?? null}
          />
          <DraftLayerList
            layers={currentScene?.draft ?? []}
            liveLayers={currentScene?.live ?? []}
            selectedLayerId={selectedLayerId}
            onSelect={setSelectedLayerId}
            onDelete={(layerId) => {
              if (effectiveSceneId) {
                send({
                  type: "delete-layer",
                  sceneId: effectiveSceneId,
                  layerId,
                });
                if (layerId === selectedLayerId) {
                  setSelectedLayerId(null);
                  setDraftPreview(null);
                }
              }
            }}
            onReorder={(ids) => {
              if (effectiveSceneId) {
                send({
                  type: "reorder-layers",
                  sceneId: effectiveSceneId,
                  layerIds: ids,
                });
              }
            }}
            onAddOverlay={() => setModalOpen(true)}
          />
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <LayerEditor
              layer={selectedLayer}
              onSave={(updates) => {
                if (effectiveSceneId && selectedLayerId) {
                  send({
                    type: "update-layer",
                    sceneId: effectiveSceneId,
                    layerId: selectedLayerId,
                    ...updates,
                  });
                }
              }}
              onPreviewChange={handlePreviewChange}
            />
            <SceneActionBar
              visible={currentScene?.visible ?? false}
              needsSync={!sceneSynced}
              onSyncToLive={() => {
                if (effectiveSceneId) {
                  send({ type: "sync-to-live", sceneId: effectiveSceneId });
                }
              }}
              onSetVisibility={(v) => {
                if (effectiveSceneId) {
                  send({
                    type: "set-visibility",
                    sceneId: effectiveSceneId,
                    visible: v,
                  });
                }
              }}
            />
            <QuickTweetSender
              activeTweet={quickTweet}
              onShow={(url) => send({ type: "show-tweet", url })}
              onHide={() => send({ type: "hide-tweet" })}
            />
          </div>
        </main>
      </div>
      <AddOverlayModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(label, template, props) => {
          if (effectiveSceneId) {
            send({
              type: "add-layer",
              sceneId: effectiveSceneId,
              label,
              template,
              props,
            });
          }
        }}
      />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
