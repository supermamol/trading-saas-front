import "react-mosaic-component/react-mosaic-component.css";

import { useRef, useState } from "react";
import type { MosaicNode } from "react-mosaic-component";

/* =========================
 * Modèle
 * ========================= */
import type { Workspace } from "./model/workspace";
import { openPanel } from "./model/workspace.panels";
import type {
  PanelKind,
  PanelContext,
} from "./model/workspace.panels";

/* =========================
 * UI / Layout
 * ========================= */
import {
  WorkspaceMosaicView,
  buildInitialLayout,
  type WorkspaceState,
} from "./ui/WorkspaceMosaicView";

import {
  ensureVerticalRootLayout,
  insertInZoneAndSlot,
  type VerticalZone,
  type HorizontalSlot,
} from "./ui/mosaicLayout";

import { WorkspaceDnDProvider } from "./ui/WorkspaceDnDProvider";

/* =========================
 * Placement CREATE
 * ========================= */
function placementForKind(
  kind: PanelKind
): { zone: VerticalZone; slot: HorizontalSlot } {
  switch (kind) {
    case "Nodered":
      return { zone: "top", slot: "left" };

    case "Chart":
      return { zone: "top", slot: "right" };

    case "Strategies":
      return { zone: "bottom", slot: "left" };

    case "StrategyDetail":
      return { zone: "bottom", slot: "center" };

    case "Run":
      return { zone: "bottom", slot: "right" };

    default:
      return { zone: "top", slot: "right" };
  }
}

function hasContainerOfKind(
  workspace: Workspace,
  kind: PanelKind
): boolean {
  return Object.values(workspace.containers).some((c) =>
    c.tabs.some((t) => t.kind === kind)
  );
}

function slotForContainerId(
  workspace: Workspace,
  id: string
): HorizontalSlot | null {
  const c = workspace.containers[id];
  if (!c) return null;
  return placementForKind(c.tabs[0].kind).slot;
}

/* =========================
 * Initial workspace
 * ========================= */
function initialWorkspace(): Workspace {
  return {
    containers: {},
    detached: [],
  };
}

/* =========================
 * App
 * ========================= */
export default function App() {
  const [state, setState] = useState<WorkspaceState>(() => {
    const workspace = initialWorkspace();
    const layout = ensureVerticalRootLayout(
      buildInitialLayout([])
    );
    return { workspace, layout };
  });

  /**
   * 🔒 ZONE MAP
   * - persiste entre renders
   * - utilisée UNIQUEMENT pour CREATE
   * - clé = containerId
   */
  const zoneMapRef = useRef<
    Record<
      string,
      { zone: VerticalZone; slot: HorizontalSlot }
    >
  >({});

  /* =========================
   * DEV debug
   * ========================= */
  if (import.meta.env.DEV) {
    (window as any).__workspace = {
      containers: state.workspace.containers,
      detached: state.workspace.detached,
      zoneMap: zoneMapRef.current,
    };
  }

  const onStateChange = (
    updater: (s: WorkspaceState) => WorkspaceState
  ) => {
    setState(updater);
  };

  /* =========================
   * CREATE (avec zonage)
   * ========================= */
  function createPanel(
    kind: PanelKind,
    context: PanelContext = {}
  ) {
    setState((s) => {
      const hadKindBefore = hasContainerOfKind(
        s.workspace,
        kind
      );

      const nextWorkspace = openPanel(
        s.workspace,
        kind,
        context
      );

      const beforeIds = Object.keys(
        s.workspace.containers
      );
      const afterIds = Object.keys(
        nextWorkspace.containers
      );

      const newContainerId = afterIds.find(
        (id) => !beforeIds.includes(id)
      );

      // Pas de nouveau container → pas de zonage
      if (!newContainerId || hadKindBefore) {
        return {
          ...s,
          workspace: nextWorkspace,
        };
      }

      const rootLayout = ensureVerticalRootLayout(s.layout);
      const { zone, slot } = placementForKind(kind);

      const nextLayout = insertInZoneAndSlot(
        rootLayout,
        zone,
        slot,
        newContainerId,
        (id) => slotForContainerId(nextWorkspace, id)
      );

      return {
        workspace: nextWorkspace,
        layout: nextLayout,
      };
    });
  }

  /* =========================
   * Render
   * ========================= */
  return (
    <div
      style={{
        height: "calc(100vh - 20px)",
        background: "#f3f4f6",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* =========================
       * DEV — CREATE buttons
       * ========================= */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 8,
          background: "#e5e7eb",
          borderRadius: 6,
        }}
      >
        <strong>CREATE (DEV)</strong>

        {/* -------- TOP -------- */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <strong>TOP</strong>

          <button onClick={() => createPanel("Chart")}>
            + Chart
          </button>
          <button
            onClick={() =>
              createPanel("Chart", { strategyId: "S1" })
            }
          >
            + Chart S1
          </button>
          <button
            onClick={() =>
              createPanel("Chart", { strategyId: "S2" })
            }
          >
            + Chart S2
          </button>

          <button onClick={() => createPanel("Nodered")}>
            + Nodered
          </button>
          <button
            onClick={() =>
              createPanel("Nodered", {
                strategyId: "S1",
              })
            }
          >
            + Nodered S1
          </button>
          <button
            onClick={() =>
              createPanel("Nodered", {
                strategyId: "S2",
              })
            }
          >
            + Nodered S2
          </button>
        </div>

        {/* -------- BOTTOM -------- */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <strong>BOTTOM</strong>

          <button onClick={() => createPanel("Strategies")}>
            + Strategies
          </button>
          <button
            onClick={() =>
              createPanel("Strategies", {
                strategyId: "S1",
              })
            }
          >
            + Strategies S1
          </button>
          <button
            onClick={() =>
              createPanel("Strategies", {
                strategyId: "S2",
              })
            }
          >
            + Strategies S2
          </button>

          <button
            onClick={() =>
              createPanel("StrategyDetail")
            }
          >
            + StrategyDetail
          </button>
          <button
            onClick={() =>
              createPanel("StrategyDetail", {
                strategyId: "S1",
              })
            }
          >
            + StrategyDetail S1
          </button>
          <button
            onClick={() =>
              createPanel("StrategyDetail", {
                strategyId: "S2",
              })
            }
          >
            + StrategyDetail S2
          </button>

          <button onClick={() => createPanel("Run")}>
            + Run
          </button>
          <button
            onClick={() =>
              createPanel("Run", { strategyId: "S1" })
            }
          >
            + Run S1
          </button>
          <button
            onClick={() =>
              createPanel("Run", { strategyId: "S2" })
            }
          >
            + Run S2
          </button>
        </div>
      </div>

      {/* =========================
       * Workspace
       * ========================= */}
      <WorkspaceDnDProvider
        state={state}
        onStateChange={onStateChange}
      >
        {(hoveredContainerId) => (
          <WorkspaceMosaicView
            state={state}
            onStateChange={onStateChange}
            hoveredContainerId={hoveredContainerId}
          />
        )}
      </WorkspaceDnDProvider>
    </div>
  );
}
