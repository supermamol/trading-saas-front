import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import type { Tab } from "../model/tab";
import { TabView } from "./TabView";

/* ======================================================
 * Props
 * ====================================================== */
type Props = {
  container: Container;
  onCloseTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;
};

export function ContainerView({
  container,
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

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "relative",
        border: "1px solid #ccc",
        padding: 8,
        height: "100%",
        background: isOver ? "#e6f2ff" : "#fafafa",
      }}
    >
      {container.tabs.map((tab) => (
        <TabView
          key={tab.id}
          tab={tab}
          containerId={container.id}
          onClose={onCloseTab}
          onDetach={onDetachTab}
        />
      ))}
    </div>
  );
}
