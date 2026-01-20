import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState, type ReactNode } from "react";
import type { Workspace } from "../model/workspace";
import { moveTab } from "../model/workspace.move";

type Props = {
  state: { workspace: Workspace };
  onStateChange: (updater: (s: any) => any) => void;
  children: (hoveredContainerId: string | null) => ReactNode;
};

export function WorkspaceDnDProvider({ state, onStateChange, children }: Props) {
  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "tab") setDraggedTabId(data.tabId);
  }

  function handleDragMove(event: DragMoveEvent) {
    const overData = event.over?.data.current;
    setHoveredContainerId(overData?.type === "container" ? overData.containerId : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setHoveredContainerId(null);
    setDraggedTabId(null);

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "tab" || overData?.type !== "container") return;

    const tabId = activeData.tabId;
    const fromContainerId = activeData.fromContainerId;
    const toContainerId = overData.containerId;

    if (fromContainerId === toContainerId) return;

    onStateChange((s: any) => ({
      ...s,
      workspace: moveTab(s.workspace, tabId, toContainerId),
    }));
  }

  function handleDragCancel() {
    setHoveredContainerId(null);
    setDraggedTabId(null);
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children(hoveredContainerId)}

      <DragOverlay dropAnimation={null}>
        {draggedTabId ? (
          <div
            className="tab tab--active tab--overlay"
            style={{
              pointerEvents: "none",
              padding: "4px 8px",
              background: "white",
              border: "1px solid #3b82f6",
              borderRadius: 4,
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
              cursor: "grabbing",
            }}
          >
            {draggedTabId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
