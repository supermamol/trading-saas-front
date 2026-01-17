// src/ui/TabView.tsx
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";

export function TabView({
  tab,
  containerId,
  onClose,
  onDetach,
}: {
  tab: Tab;
  containerId: ContainerId;
  onClose: (tabId: string) => void;
  onDetach: (tab: Tab) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid #ccc",
        padding: "4px 6px",
      }}
    >
      {/* ✅ ZONE DRAG UNIQUEMENT */}
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
          flex: 1,
          cursor: "grab",
          userSelect: "none",
        }}
      >
        Tab {tab.id}
      </div>

      {/* ACTIONS */}
      <button aria-label="Detach tab" onClick={() => onDetach(tab)}>detach</button>
      <button aria-label="Close tab" onClick={() => onClose(tab.id)}>×</button>
    </div>
  );
}
