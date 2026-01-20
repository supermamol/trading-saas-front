import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import type { Tab } from "../model/tab";
import { ContainerHeaderView } from "./ContainerHeaderView";
import { TabView } from "./TabView";

type Props = {
  container: Container;
  onSelectTab: (containerId: string, tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;
};

export function ContainerView({
  container,
  onSelectTab,
  onCloseTab,
  onDetachTab,
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
      className="container-root"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: isOver ? "#e6f2ff" : "#fafafa",
      }}
    >
      {/* BARRE FUSIONNÉE */}
      <ContainerHeaderView
        tabs={container.tabs}
        activeTab={activeTab}
        containerId={container.id}   // ✅ C’EST ICI QUE ÇA VIENT
        onSelectTab={(tabId) =>
          onSelectTab(container.id, tabId)
        }
        onDetachTab={onDetachTab}
        onCloseTab={onCloseTab}
      />

      {/* CONTENU */}
      <div className="container-panel" style={{ flex: 1 }}>
        <TabView tab={activeTab} />
      </div>
    </div>
  );
}
