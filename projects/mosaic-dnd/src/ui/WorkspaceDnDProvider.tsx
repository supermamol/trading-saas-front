import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { ReactNode } from "react";
import type { Workspace } from "../model/workspace";
import { moveTab } from "../model/workspace.move";

type Props = {
  state: { workspace: Workspace };
  onStateChange: (updater: (s: any) => any) => void;
  children: ReactNode;
};

export function WorkspaceDnDProvider({
  state,
  onStateChange,
  children,
}: Props) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (
      activeData?.type !== "tab" ||
      overData?.type !== "container"
    ) {
      return;
    }

    const tabId = activeData.tabId;
    const fromContainerId = activeData.fromContainerId;
    const toContainerId = overData.containerId;

    if (fromContainerId === toContainerId) return;

    onStateChange((s: any) => ({
      ...s,
      workspace: moveTab(s.workspace, tabId, toContainerId),
    }));
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
