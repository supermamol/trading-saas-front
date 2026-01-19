import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import { TabView } from "./TabView";
import { closeTab } from "../model/workspace";
import { detachPanel } from "../model/workspace.panels";
import type { WorkspaceState } from "./WorkspaceMosaicView";

type Props = {
  container: Container;
  onStateChange: (updater: (s: WorkspaceState) => WorkspaceState) => void;
};

/* ======================================================
 * SplitDropZone (UI pure)
 * ====================================================== */
function SplitDropZone({
  containerId,
  side,
}: {
  containerId: string;
  side: "left" | "right" | "top" | "bottom";
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `split-${containerId}-${side}`,
    data: {
      type: "split-zone",
      containerId,
      side,
    },
  });

  const styleBySide: Record<string, React.CSSProperties> = {
    left: { left: 0, top: 0, bottom: 0, width: 16 },
    right: { right: 0, top: 0, bottom: 0, width: 16 },
    top: { top: 0, left: 0, right: 0, height: 16 },
    bottom: { bottom: 0, left: 0, right: 0, height: 16 },
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        zIndex: 10,
        background: isOver ? "rgba(59,130,246,0.25)" : "transparent",
        ...styleBySide[side],
      }}
    />
  );
}

/* ======================================================
 * ContainerView
 * ====================================================== */
export function ContainerView({
  container,
  onStateChange,
}: Props) {
  /**
   * Drop HEADER (MOVE tab)
   */
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
        overflow: "hidden",
      }}
    >
      {/* ===============================
          SPLIT DROP ZONES (ISOLATE)
         =============================== */}
      <SplitDropZone containerId={container.id} side="left" />
      <SplitDropZone containerId={container.id} side="right" />
      <SplitDropZone containerId={container.id} side="top" />
      <SplitDropZone containerId={container.id} side="bottom" />

      {/* ===============================
          TABS
         =============================== */}
      {container.tabs.map((tab) => (
        <TabView
          key={tab.id}
          tab={tab}
          containerId={container.id}
          onDetach={() => {
            onStateChange((s) => {
              const { workspace: nextWs } = detachPanel(s.workspace, tab);
              return { ...s, workspace: nextWs };
            });
          }}
          onClose={(tabId) => {
            onStateChange((s) => ({
              ...s,
              workspace: closeTab(s.workspace, tabId),
            }));
          }}
        />
      ))}
    </div>
  );
}
