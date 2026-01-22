// src/App.tsx
import "react-mosaic-component/react-mosaic-component.css";
import { useEffect, useState } from "react";

/* =========================
 * Modèle
 * ========================= */
import type { Workspace } from "./model/workspace";
import {
  openPanel,
  type PanelKind,
  type PanelContext,
} from "./model/workspace.panels";

/* =========================
 * UI / Layout
 * ========================= */
import {
  WorkspaceMosaicView,
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
 * CREATE – API MÉTIER
 * ========================= */
export type CreateDirection = "top" | "bottom" | "left" | "right";

/**
 * Traduction MÉTIER → Mosaic
 * (SEUL endroit où zone/slot existent)
 */
function placementFromDirection(
  dir: CreateDirection
): { zone: VerticalZone; slot: HorizontalSlot } {
  switch (dir) {
    case "top":
      return { zone: "top", slot: "center" };
    case "bottom":
      return { zone: "bottom", slot: "center" };
    case "left":
      return { zone: "top", slot: "left" };
    case "right":
      return { zone: "top", slot: "right" };
  }
}

/**
 * Slot visuel “naturel” d’un container EXISTANT
 * (sert uniquement à l’insertion relative)
 */
function slotForContainerKind(kind: PanelKind): HorizontalSlot {
  switch (kind) {
    case "Nodered":
      return "left";
    case "Chart":
      return "center";
    case "Run":
      return "right";
    case "Strategies":
      return "left";
    case "StrategyDetail":
      return "center";
    default:
      return "center";
  }
}

/* =========================
 * Initial workspace
 * ========================= */
function emptyWorkspace(): Workspace {
  return {
    containers: {},
    detached: [],
  };
}

/* =========================
 * App
 * ========================= */
export default function App() {
  const [state, setState] = useState<WorkspaceState>(() => ({
    workspace: emptyWorkspace(),
    layout: ensureVerticalRootLayout(null),
  }));

  /* ======================================
   * INIT — créer Strategies au chargement
   * ====================================== */
  useEffect(() => {
    setState((s) => {
      if (Object.keys(s.workspace.containers).length > 0) {
        return s;
      }

      const result = openPanel(s.workspace, "Strategies");

      if (!result.createdContainerId) {
        return { ...s, workspace: result.workspace };
      }

      return {
        workspace: result.workspace,
        layout: ensureVerticalRootLayout(result.createdContainerId),
      };
    });
  }, []);

  /* ======================================
   * CREATE PANEL (API PUBLIQUE)
   * ====================================== */
  function createPanel(
    kind: PanelKind,
    context: PanelContext = {},
    direction: CreateDirection = "right"
  ) {
    setState((s) => {
      const beforeIds = Object.keys(s.workspace.containers);

      const result = openPanel(s.workspace, kind, context);
      const nextWorkspace = result.workspace;

      const afterIds = Object.keys(nextWorkspace.containers);
      const newContainerId = afterIds.find(
        (id) => !beforeIds.includes(id)
      );

      // 👉 regroupement : pas de nouveau container
      if (!newContainerId) {
        return { ...s, workspace: nextWorkspace };
      }

      const { zone, slot } = placementFromDirection(direction);
      const root = ensureVerticalRootLayout(s.layout);

      const nextLayout = insertInZoneAndSlot(
        root,
        zone,
        slot,
        newContainerId,
        (id) =>
          slotForContainerKind(
            nextWorkspace.containers[id].tabs[0].kind as PanelKind
          )
      );

      return {
        workspace: nextWorkspace,
        layout: nextLayout,
      };
    });
  }

  /* ======================================
   * DEBUG DEV
   * ====================================== */
  if (import.meta.env.DEV) {
    (window as any).__workspace = state;
  }

  /* ======================================
   * RENDER
   * ====================================== */
  return (
    <div
      style={{
        height: "100vh",
        padding: 8,
        background: "#f3f4f6",
      }}
    >
      <WorkspaceDnDProvider state={state} onStateChange={setState}>
        {(hoveredContainerId, onSplitZoneChange) => (
          <WorkspaceMosaicView
            state={state}
            onStateChange={setState}
            hoveredContainerId={hoveredContainerId}
            onSplitZoneChange={onSplitZoneChange}
            createPanel={createPanel}
          />
        )}
      </WorkspaceDnDProvider>
    </div>
  );
}
