import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

import { handleTabDrop } from "../model/dnd";
import type { WorkspaceState } from "./WorkspaceMosaicView";

export function WorkspaceDnDProvider({
  state,
  onStateChange,
  children,
}: {
  state: WorkspaceState;
  onStateChange: (updater: (s: WorkspaceState) => WorkspaceState) => void;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<{
    tabId: string;
    sourceContainerId: string;
  } | null>(null);

  const onDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current;
    if (payload?.type === "tab") {
      setActiveTab({
        tabId: payload.tabId,
        sourceContainerId: payload.sourceContainerId,
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTab(null);

    if (!over) return;

    const payload = active.data.current;
    if (!payload || payload.type !== "tab") return;

    if (over.data.current?.type === "container") {
      const targetContainerId = over.data.current.containerId;

      // NO-OP : même container
      if (payload.sourceContainerId === targetContainerId) {
        return;
      }

      // ✅ PHASE 1 : on passe par onStateChange
      onStateChange((s) => ({
        ...s,
        workspace: handleTabDrop(s.workspace, payload.tabId, {
          type: "header",
          containerId: targetContainerId,
        }),
      }));
    }
  };

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {children}
      <DragOverlay>
        {activeTab ? (
          <div
            style={{
              padding: "4px 6px",
              border: "1px solid #999",
              borderRadius: 4,
              background: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              cursor: "grabbing",
            }}
          >
            Tab {activeTab.tabId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
