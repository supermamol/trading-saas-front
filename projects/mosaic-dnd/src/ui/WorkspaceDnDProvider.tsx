import {
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type { Workspace } from "../model/workspace";
import { moveTab } from "../model/workspace.move";
import { findContainerByTab } from "../model/workspace";
import { canGroup } from "../model/canGroup";

type Props = {
  state: { workspace: Workspace };
  onStateChange: (updater: (s: any) => any) => void;
  children: (hoveredContainerId: string | null) => ReactNode;
};

function getTabById(workspace: Workspace, tabId: string) {
  const source = findContainerByTab(workspace, tabId);
  return source?.tabs.find((t) => t.id === tabId) ?? null;
}

export function WorkspaceDnDProvider({ state, onStateChange, children }: Props) {
  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  // ✅ garantit un accès au workspace le plus récent pendant un drag
  const workspaceRef = useRef(state.workspace);
  useEffect(() => {
    workspaceRef.current = state.workspace;
  }, [state.workspace]);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "tab") setDraggedTabId(data.tabId);
  }

  function handleDragMove(event: DragMoveEvent) {
    const overData = event.over?.data.current;

    // par défaut : pas de zone (Option C)
    if (overData?.type !== "container" || !draggedTabId) {
      setHoveredContainerId(null);
      return;
    }

    const ws = workspaceRef.current;
    const tab = getTabById(ws, draggedTabId);
    const target = ws.containers[overData.containerId];

    // ✅ drop zone visible uniquement si compatible
    if (tab && target && canGroup(tab, target)) {
      setHoveredContainerId(overData.containerId);
    } else {
      setHoveredContainerId(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setHoveredContainerId(null);
    setDraggedTabId(null);

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "tab" || overData?.type !== "container") return;

    const tabId = activeData.tabId as string;
    const fromContainerId = activeData.fromContainerId as string;
    const toContainerId = overData.containerId as string;

    if (fromContainerId === toContainerId) return;

    // 🔒 re-check compat au drop (sécurité)
    const ws = workspaceRef.current;
    const tab = getTabById(ws, tabId);
    const target = ws.containers[toContainerId];
    if (!tab || !target || !canGroup(tab, target)) return;

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
