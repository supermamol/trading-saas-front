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

import { splitLayoutAtPath } from "./ui/mosaicLayout";
import { WorkspaceDnDProvider } from "./ui/WorkspaceDnDProvider";

/* =========================
 * Types
 * ========================= */
export type CreateDirection = "top" | "bottom" | "left" | "right";

/* =========================
 * Helpers
 * ========================= */
function directionToMosaic(
  dir: CreateDirection
): { axis: "row" | "column"; insert: "before" | "after" } {
  switch (dir) {
    case "left":
      return { axis: "row", insert: "before" };
    case "right":
      return { axis: "row", insert: "after" };
    case "top":
      return { axis: "column", insert: "before" };
    case "bottom":
      return { axis: "column", insert: "after" };
  }
}

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
    layout: null,
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
        ...s,
        workspace: result.workspace,
        layout: result.createdContainerId, // layout = id du 1er container
      };
    });
  }, []);

  /* ======================================
   * CREATE PANEL — règle canonique
   * ====================================== */
  function createPanel(
    kind: PanelKind,
    context: PanelContext = {},
    direction: CreateDirection = "right"
  ) {
    setState((s) => {
      // fallback safe : on split par rapport au 1er container existant
      const sourceContainerId = Object.keys(s.workspace.containers)[0] ?? null;
      if (!sourceContainerId) return s;

      const result = openPanel(s.workspace, kind, context);
      const nextWorkspace = result.workspace;

      // 1) REGROUPEMENT → layout inchangé
      if (!result.createdContainerId) {
        return { ...s, workspace: nextWorkspace };
      }

      // 2) NOUVEAU CONTAINER → split relatif
      const newContainerId = result.createdContainerId;
      const { axis, insert } = directionToMosaic(direction);

      const nextLayout = splitLayoutAtPath(
        s.layout,
        sourceContainerId,
        newContainerId,
        axis,
        insert
      );

      return {
        ...s,
        workspace: nextWorkspace,
        layout: nextLayout,
      };
    });
  }

  /* ======================================
   * DEBUG
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
