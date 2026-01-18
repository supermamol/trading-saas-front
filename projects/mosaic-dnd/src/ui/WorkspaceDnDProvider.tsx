import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

import type { Workspace } from "../model/workspace";
import { handleTabDrop } from "../model/dnd";

/**
 * Provider DnD applicatif
 * - basé sur dnd-kit
 * - compatible React Mosaic
 * - aucune utilisation du DnD HTML5 natif
 */
export function WorkspaceDnDProvider({
  workspace,
  onWorkspaceChange,
  children,
}: {
  workspace: Workspace;
  onWorkspaceChange: (ws: Workspace) => void;
  children: React.ReactNode;
}) {
  /**
   * Tab actuellement draggé (pour le DragOverlay)
   */
  const [activeTab, setActiveTab] = useState<{
    tabId: string;
    sourceContainerId: string;
  } | null>(null);

  /**
   * Drag start
   * → mémorise le tab pour l’overlay
   */
  const onDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current;
    if (payload?.type === "tab") {
      setActiveTab({
        tabId: payload.tabId,
        sourceContainerId: payload.sourceContainerId,
      });
    }
  };

  /**
   * Drag end
   * → applique la transition métier si nécessaire
   */
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Nettoyage overlay
    setActiveTab(null);

    if (!over) return;

    const payload = active.data.current;
    if (!payload || payload.type !== "tab") return;

    // Drop uniquement sur un container
    if (over.data.current?.type === "container") {
      const targetContainerId = over.data.current.containerId;

      // ❌ Drop dans le même container → NO-OP
      if (payload.sourceContainerId === targetContainerId) {
        return;
      }

      onWorkspaceChange(
        handleTabDrop(workspace, payload.tabId, {
          type: "header",
          containerId: targetContainerId,
        })
      );
    }
  };

  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}

      {/* ===============================
          DRAG OVERLAY (preview visuel)
         =============================== */}
      <DragOverlay>
        {activeTab ? (
          <div
            style={{
              padding: "4px 6px",
              border: "1px solid #999",
              borderRadius: 4,
              background: "#ffffff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              cursor: "grabbing",
              whiteSpace: "nowrap",
            }}
          >
            Tab {activeTab.tabId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
