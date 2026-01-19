import { useDraggable } from "@dnd-kit/core";
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";


export function TabView({
  tab,
  containerId,
  onDetach,
  onClose,
}: {
  tab: Tab;
  containerId: ContainerId;
  onDetach: (tab: Tab) => void;
  onClose: (tabId: string) => void;
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
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 6px",
        border: "1px solid #d1d5db",
        borderRadius: 4,
        background: "#ffffff",
      }}
    >
      {/* ✅ ZONE DRAG UNIQUEMENT */}
      <div
        {...listeners}
        {...attributes}
        style={{
          flex: 1,
          cursor: "grab",
          userSelect: "none",
          color: "#111827",
        }}
      >
        Tab {tab.id}
      </div>

      {/* ACTIONS (NON DRAGGABLES) */}
      <button
        aria-label="Detach tab"
        onClick={() => onDetach(tab)}
        style={{
          fontSize: 11,
          opacity: 0.6,
          cursor: "pointer",
        }}
      >
        detach
      </button>

      <button
        aria-label="Close tab"
        onClick={() => onClose(tab.id)}
        style={{
          fontSize: 11,
          opacity: 0.6,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}
