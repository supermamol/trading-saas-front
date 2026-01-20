import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import type { Tab } from "../model/tab";
import { activateTab } from "../model/container";
import { TabView } from "./TabView";
import { TablistView } from "./TablistView";

type Props = {
  container: Container;
  onCloseTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;
  onUpdateContainer: (container: Container) => void;
};

export function ContainerView({
  container,
  onCloseTab,
  onDetachTab,
  onUpdateContainer,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-${container.id}`,
    data: {
      type: "container",
      containerId: container.id,
    },
  });

  const activeTab = container.tabs[container.tabs.length - 1];

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "relative",
        border: "1px solid #ccc",
        padding: 8,
        height: "100%",
        background: isOver ? "#e6f2ff" : "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TABLIST */}
      <TablistView
        tabs={container.tabs}
        onSelectTab={(tabId) => {
          const next = activateTab(container, tabId);
          onUpdateContainer(next);
        }}
      />

      {/* CONTENU DU TAB ACTIF */}
      <div className="container-panel" style={{ flex: 1 }}>
        <TabView
          tab={activeTab}
          containerId={container.id}
          onClose={onCloseTab}
          onDetach={onDetachTab}
        />
      </div>
    </div>
  );
}
