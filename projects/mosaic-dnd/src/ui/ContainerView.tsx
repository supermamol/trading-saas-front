import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import { TabView } from "./TabView";

export function ContainerView({
  container,
}: {
  container: Container;
}) {
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
        border: "1px solid #ccc",
        padding: 8,
        height: "100%",
        background: isOver ? "#e6f2ff" : "#fafafa",
      }}
    >
      {container.tabs.map(tab => (
        <TabView
          key={tab.id}
          tab={tab}
          containerId={container.id}
        />
      ))}
    </div>
  );
}
