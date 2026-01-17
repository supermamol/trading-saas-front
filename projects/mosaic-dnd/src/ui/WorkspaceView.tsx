import { useState, type DragEvent } from "react";
import type { Workspace } from "../model/workspace";
import { closeTab } from "../model/workspace";
import { handleTabDrop } from "../model/dnd";
import { TabView } from "./TabView";
import { detachPanel } from "../model/workspace.panels";

/**
 * Props du WorkspaceView
 * - workspace : état métier courant
 * - onChange : callback unique pour appliquer une transition métier
 */
type Props = {
  workspace: Workspace;
  onChange: (ws: Workspace) => void;
};

/**
 * MIME type utilisé pour le Drag & Drop des tabs
 * (évite les collisions avec d'autres DnD éventuels)
 */
const MIME = "application/x-mosaic-tab";

/**
 * Payload transporté pendant le drag d'un tab
 */
type DragPayload = {
  tabId: string;
  sourceContainerId: string;
};

/**
 * Helper pour lire proprement le payload DnD
 */
function readDragPayload(e: DragEvent): DragPayload | null {
  const raw = e.dataTransfer.getData(MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

export function WorkspaceView({ workspace, onChange }: Props) {
  // ✅ Hooks : uniquement ici, au niveau racine du composant
  const [dragOverContainer, setDragOverContainer] =
    useState<string | null>(null);

  const containers = Object.values(workspace.containers);

  return (
    /**
     * ===============================
     * ZONE "OUTSIDE" GLOBALE
     * ===============================
     *
     * - Drop ici = intention "DETACH"
     * - Le modèle décidera :
     *   - isolation (nouveau container)
     *   - ou fermeture (fallback)
     */
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: 16,
        minHeight: 400,
        background: "#f0f0f0",
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(MIME)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        const payload = readDragPayload(e);
        if (!payload) return;

        // 👉 MOVE TAB → OUTSIDE = DETACH
        onChange(
          handleTabDrop(workspace, payload.tabId, {
            type: "outside",
          })
        );
      }}
    >
      {containers.map((container) => (
        /**
         * ===============================
         * CONTAINER (DROP ZONE "GROUPER")
         * ===============================
         *
         * - Drop n'importe où dans le panel
         *   = groupement dans ce container
         */
        <div
          key={container.id}
          style={{
            border: "1px solid #ccc",
            padding: 8,
            minWidth: 240,
            background:
              dragOverContainer === container.id
                ? "#e6f2ff"
                : "#fafafa",
          }}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes(MIME)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }
          }}
          onDragEnter={() => setDragOverContainer(container.id)}
          onDrop={(e) => {
            // ⚠️ Empêche le drop "outside" global
            e.stopPropagation();
            setDragOverContainer(null);

            const payload = readDragPayload(e);
            if (!payload) return;

            // Optionnel : ignorer le drop sur le même container
            if (payload.sourceContainerId === container.id) {
              return;
            }

            onChange(
              handleTabDrop(workspace, payload.tabId, {
                type: "header",
                containerId: container.id,
              })
            );
          }}
        >
          {/* ===============================
              HEADER DU CONTAINER (VISUEL)
              =============================== */}
          <div
            style={{
              padding: 6,
              border: "1px dashed #bbb",
              marginBottom: 8,
              background: "#fff",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Container {container.id}
            </h3>
          </div>

          {/* ===============================
              LISTE DES TABS
              =============================== */}
          {container.tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                border: "1px solid #ddd",
                padding: 6,
                marginBottom: 8,
                background: "#fff",
              }}
            >
              {/* -------------------------------
                  TAB (DRAG + CLOSE)
                  -------------------------------
                  - Drag = déplacement
                  - ✕ = fermeture explicite
               */}
              <TabView
                tab={tab}
                containerId={container.id}
                onClose={(tabId) =>
                  onChange(closeTab(workspace, tabId))
                }
                onDetach={(tab) => {
                  const { workspace: next } = detachPanel(workspace, tab);
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
