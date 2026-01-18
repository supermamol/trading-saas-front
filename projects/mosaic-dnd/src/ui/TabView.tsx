import { useDraggable } from "@dnd-kit/core";
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";

export function TabView({
  tab,
  containerId,
}: {
  tab: Tab;
  containerId: ContainerId;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `tab-${tab.id}`,
    data: {
      type: "tab",
      tabId: tab.id,
      sourceContainerId: containerId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        cursor: "grab",
        padding: "4px 6px",
        border: "1px solid #d1d5db",
        borderRadius: 4,
        background: "#fff",
      }}
    >
      Tab {tab.id}
    </div>
  );
}
