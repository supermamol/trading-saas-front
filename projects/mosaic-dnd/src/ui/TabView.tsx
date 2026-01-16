// src/ui/TabView.tsx
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";

export function TabView({
  tab,
  containerId,
}: {
  tab: Tab;
  containerId: ContainerId;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/x-mosaic-tab",
          JSON.stringify({
            tabId: tab.id,
            sourceContainerId: containerId,
          })
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{
        border: "1px solid #999",
        padding: 6,
        marginBottom: 6,
        cursor: "grab",
        background: "#fff",
      }}
    >
      Tab {tab.id}
    </div>
  );
}
