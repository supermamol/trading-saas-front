import { useDraggable } from "@dnd-kit/core";
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";

type Props = {
  tab: Tab;
  containerId: ContainerId;
  onDetach: (tab: Tab) => void;
  onClose: (tabId: string) => void;
};

export function TabView({
  tab,
  containerId,
  onDetach,
  onClose,
}: Props) {
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
      {/* zone drag */}
      <div
        {...listeners}
        {...attributes}
        style={{ flex: 1, cursor: "grab", userSelect: "none" }}
      >
        Tab {tab.id}
      </div>

      {/* actions */}
      <button aria-label="Detach tab" onClick={() => onDetach(tab)}>detach</button>
      <button aria-label="Close tab" onClick={() => onClose(tab.id)}>×</button>
    </div>
  );
}
