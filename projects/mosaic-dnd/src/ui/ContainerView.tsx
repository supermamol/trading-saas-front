import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import type { Tab } from "../model/tab";
import { TabView } from "./TabView";
import { TablistView } from "./TablistView";

type Props = {
  container: Container;
  onCloseTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;
  onSelectTab: (containerId: string, tabId: string) => void;
};

export function ContainerView({
  container,
  onCloseTab,
  onDetachTab,
  onSelectTab,
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
        activeTabId={activeTab.id}
        onSelectTab={(tabId) =>
          onSelectTab(container.id, tabId)
        }
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
