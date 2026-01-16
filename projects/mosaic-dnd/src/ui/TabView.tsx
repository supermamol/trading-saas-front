// src/ui/TabView.tsx
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";

export function TabView({ tab, containerId, onClose }: {
    tab: Tab;
    containerId: ContainerId;
    onClose: (tabId: TabId) => void;
  }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* zone draggable */}
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
            border: "1px solid #999",
            padding: "4px 8px",
            cursor: "grab",
          }}
        >
          Tab {tab.id}
        </div>
  
        {/* bouton close */}
        <button
          onClick={() => onClose(tab.id)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          aria-label="Close tab"
        >
          ✕
        </button>
      </div>
    );
  }
  