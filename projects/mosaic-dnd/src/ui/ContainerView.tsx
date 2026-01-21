import { useDroppable, useDndContext } from "@dnd-kit/core";
import type { Container } from "../model/container";
import type { Tab } from "../model/tab";
import { ContainerHeaderView } from "./ContainerHeaderView";
import { TabView } from "./TabView";
import { canGroup } from "../model/canGroup";

type Props = {
  container: Container;
  hoveredContainerId: string | null;
  onSelectTab: (containerId: string, tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;
};

export function ContainerView({
  container,
  hoveredContainerId,
  onSelectTab,
  onCloseTab,
  onDetachTab,
}: Props) {
  /* =============================
   * DnD — droppable container
   * ============================= */
  const { setNodeRef } = useDroppable({
    id: `container-${container.id}`,
    data: {
      type: "container",
      containerId: container.id,
    },
  });

  const { active } = useDndContext();

  const isDraggingTab =
    active?.data.current?.type === "tab";

  const draggedTabKind: string | undefined =
    active?.data.current?.tabKind;

  const isCompatible =
    !isDraggingTab ||
    (draggedTabKind
      ? canGroup(draggedTabKind, container)
      : true);

  const isHovered = hoveredContainerId === container.id;

  const activeTab = container.tabs[container.tabs.length - 1];

  /* =============================
   * Render
   * ============================= */
  return (
    <div
      ref={setNodeRef}
      className="container-root"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",

        background: isDraggingTab ? "#e6f2ff" : "#fafafa",

        outline: isDraggingTab
          ? isHovered
            ? "2px solid #2563eb"   // survol réel
            : "2px dashed #3b82f6" // zone droppable
          : "none",

        outlineOffset: "-2px",
        transition: "background 0.15s, outline 0.15s",

        // ✨ feedback passif compatibilité
        opacity: isDraggingTab && !isCompatible ? 0.4 : 1,
        filter:
          isDraggingTab && !isCompatible
            ? "grayscale(0.6)"
            : "none",
      }}
    >
      <ContainerHeaderView
        tabs={container.tabs}
        activeTab={activeTab}
        containerId={container.id}
        onSelectTab={(tabId) =>
          onSelectTab(container.id, tabId)
        }
        onDetachTab={onDetachTab}
        onCloseTab={onCloseTab}
      />

      <div className="container-panel" style={{ flex: 1 }}>
        <TabView tab={activeTab} />
      </div>
    </div>
  );
}
