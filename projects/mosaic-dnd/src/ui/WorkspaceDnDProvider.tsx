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
import { findContainerByTab, isolateTab } from "../model/workspace";
import { moveTab } from "../model/workspace.move";
import { canGroup } from "../model/canGroup";
import type { MosaicNode } from "react-mosaic-component";
import { splitLayoutAtPath } from "./mosaicLayout";
import type { SplitTarget, SplitZone } from "./ContainerView";

type WorkspaceState = {
  workspace: Workspace;
  layout: MosaicNode<string> | null;
};

type Props = {
  state: WorkspaceState;
  onStateChange: (updater: (s: WorkspaceState) => WorkspaceState) => void;
  children: (
    hoveredContainerId: string | null,
    onSplitZoneChange: (split: SplitTarget) => void
  ) => ReactNode;
};

function getTabById(workspace: Workspace, tabId: string) {
  const source = findContainerByTab(workspace, tabId);
  return source?.tabs.find((t) => t.id === tabId) ?? null;
}

function pruneLayout(
  node: MosaicNode<string> | null,
  validIds: Set<string>
): MosaicNode<string> | null {
  if (!node) return null;
  if (typeof node === "string") {
    return validIds.has(node) ? node : null;
  }
  const first = pruneLayout(node.first, validIds);
  const second = pruneLayout(node.second, validIds);
  if (!first && !second) return null;
  if (!first) return second;
  if (!second) return first;
  return { ...node, first, second };
}

function directionForZone(zone: SplitZone): "row" | "column" {
  return zone === "left" || zone === "right" ? "row" : "column";
}

function insertForZone(zone: SplitZone): "before" | "after" {
  return zone === "left" || zone === "top" ? "before" : "after";
}

export function WorkspaceDnDProvider({ state, onStateChange, children }: Props) {
  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  // Toujours le workspace/layout le plus récent pendant un drag
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 🔑 split courant (remonté par ContainerView via onSplitZoneChange)
  const splitTargetRef = useRef<SplitTarget>(null);

  const onSplitZoneChange = (split: SplitTarget) => {
    splitTargetRef.current = split;
  };

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "tab") setDraggedTabId(data.tabId);
  }

  function handleDragMove(event: DragMoveEvent) {
    const overData = event.over?.data.current;

    if (overData?.type !== "container" || !draggedTabId) {
      setHoveredContainerId(null);
      return;
    }

    const ws = stateRef.current.workspace;
    const tab = getTabById(ws, draggedTabId);
    const target = ws.containers[overData.containerId];

    // zone visible uniquement si compatible (même kind)
    if (tab && target && canGroup(tab, target)) {
      setHoveredContainerId(overData.containerId);
    } else {
      setHoveredContainerId(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    // IMPORTANT: on capture la valeur AVANT de reset (sinon tu vois null au drop)
    const splitTarget = splitTargetRef.current;

    setHoveredContainerId(null);
    setDraggedTabId(null);
    splitTargetRef.current = null;

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "tab" || overData?.type !== "container") return;

    const tabId = activeData.tabId as string;
    const fromContainerId = activeData.fromContainerId as string;
    const toContainerId = overData.containerId as string;

    const { workspace: ws0, layout: layout0 } = stateRef.current;

    const tab = getTabById(ws0, tabId);
    const target = ws0.containers[toContainerId];
    if (!tab || !target) return;

    // 🔒 compat au drop
    if (!canGroup(tab, target)) return;

    // === SPLIT DROP ===
    if (splitTarget && splitTarget.containerId === toContainerId) {
      // cas "split dans le même container" : si container=1 tab => impossible (cible disparaîtrait)
      const source = findContainerByTab(ws0, tabId);
      if (!source) return;
      if (source.id === toContainerId && source.tabs.length === 1) {
        return; // no-op safe
      }

      onStateChange((s) => {
        // 1) isoler le tab → nouveau container (métier)
        const { workspace: ws1, newContainerId } = isolateTab(s.workspace, tabId);

        // 2) prune layout (source peut avoir été dissous)
        const validIds = new Set(Object.keys(ws1.containers));
        const pruned = pruneLayout(s.layout, validIds);

        // 3) split Mosaic autour du container cible
        const dir = directionForZone(splitTarget.zone);
        const ins = insertForZone(splitTarget.zone);

        const nextLayout = splitLayoutAtPath(
          pruned,
          toContainerId,
          newContainerId,
          dir,
          ins
        );

        return {
          ...s,
          workspace: ws1,
          layout: nextLayout,
        };
      });

      return;
    }

    // === HEADER MOVE (merge) ===
    if (fromContainerId === toContainerId) return;

    onStateChange((s) => ({
      ...s,
      workspace: moveTab(s.workspace, tabId, toContainerId),
    }));
  }

  function handleDragCancel() {
    setHoveredContainerId(null);
    setDraggedTabId(null);
    splitTargetRef.current = null;
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children(hoveredContainerId, onSplitZoneChange)}

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
