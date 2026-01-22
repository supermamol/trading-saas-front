import { useDroppable, useDndContext } from "@dnd-kit/core";
import { useEffect, useRef } from "react";
import type { Container } from "../model/container";
import type { Tab } from "../model/tab";
import { ContainerHeaderView } from "./ContainerHeaderView";
import { TabView } from "./TabView";

/* =============================
 * Types
 * ============================= */
export type SplitZone = "top" | "bottom" | "left" | "right";

export type SplitTarget =
  | { containerId: string; zone: SplitZone }
  | null;

/* =============================
 * Utils
 * ============================= */
function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function detectSplitZone(relX: number, relY: number): SplitZone {
  const dx = relX - 0.5;
  const dy = relY - 0.5;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? "left" : "right";
  }
  return dy < 0 ? "top" : "bottom";
}

/* =============================
 * Component
 * ============================= */
type Props = {
  container: Container;
  hoveredContainerId: string | null;

  onSelectTab: (containerId: string, tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;

  /** 🔑 Remonte la zone de split active au Provider */
  onSplitZoneChange: (split: SplitTarget) => void;
};

export function ContainerView({
  container,
  hoveredContainerId,
  onSelectTab,
  onCloseTab,
  onDetachTab,
  onSplitZoneChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { setNodeRef } = useDroppable({
    id: `container-${container.id}`,
    data: { type: "container", containerId: container.id },
  });

  const { active } = useDndContext();

  const isDraggingTab = active?.data.current?.type === "tab";
  const isHovered = hoveredContainerId === container.id;

  const activeTab = container.tabs[container.tabs.length - 1];

  const fromContainerId =
    active?.data.current?.fromContainerId;

  const isSourceContainer =
    container.id === fromContainerId;

  // -----------------------------
  // Split zone detection (depuis la position du drag)
  // active.rect.current.translated est en coords viewport (comme getBoundingClientRect)
  // -----------------------------
  let splitZone: SplitZone | null = null;

  if (
    isDraggingTab &&
    isHovered &&
    isSourceContainer &&   // 🔒 CLÉ ABSOLUE
    containerRef.current &&
    active?.rect?.current
  ) {
    const rect = containerRef.current.getBoundingClientRect();
    const dragRect = active.rect.current.translated ?? active.rect.current.initial;

    if (dragRect) {
      const cx = dragRect.left + dragRect.width / 2;
      const cy = dragRect.top + dragRect.height / 2;

      const relX = clamp01((cx - rect.left) / rect.width);
      const relY = clamp01((cy - rect.top) / rect.height);

      splitZone = detectSplitZone(relX, relY);
    }
  }

  // 🔑 Propagation vers le Provider (sinon: splitTargetRef reste null au drop)
  useEffect(() => {
    if (isDraggingTab && isHovered && splitZone) {
      const next = { containerId: container.id, zone: splitZone } as const;
      onSplitZoneChange(next);
      // debug éventuel:
      // console.log("SPLIT TARGET", next);
    } else {
      onSplitZoneChange(null);
      // console.log("SPLIT TARGET", null);
    }
  }, [isDraggingTab, isHovered, splitZone, container.id, onSplitZoneChange]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      className="container-root"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,

        background: isDraggingTab ? "#e6f2ff" : "#fafafa",
        outline: isDraggingTab
          ? isHovered
            ? "2px solid #2563eb"
            : "2px dashed #3b82f6"
          : "none",
        outlineOffset: "-2px",
        transition: "background 0.12s, outline 0.12s",
      }}
    >
      {/* ===== SPLIT OVERLAY ===== */}
      {isDraggingTab && isHovered && (
        <div className="split-overlay">
          <div className={`split-zone split-top ${splitZone === "top" ? "active" : ""}`} />
          <div className={`split-zone split-bottom ${splitZone === "bottom" ? "active" : ""}`} />
          <div className={`split-zone split-left ${splitZone === "left" ? "active" : ""}`} />
          <div className={`split-zone split-right ${splitZone === "right" ? "active" : ""}`} />
        </div>
      )}

      <ContainerHeaderView
        tabs={container.tabs}
        activeTab={activeTab}
        containerId={container.id}
        onSelectTab={(tabId) => onSelectTab(container.id, tabId)}
        onDetachTab={onDetachTab}
        onCloseTab={onCloseTab}
      />

      <div className="container-panel" style={{ flex: 1 }}>
        <TabView tab={activeTab} />
      </div>
    </div>
  );
}
