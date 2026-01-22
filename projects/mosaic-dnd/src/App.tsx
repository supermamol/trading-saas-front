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
 * Placement CREATE
 * ========================= */
function placementForKind(
  kind: PanelKind
): { zone: VerticalZone; slot: HorizontalSlot } {
  switch (kind) {
    case "Nodered":
      return { zone: "top", slot: "left" };
    case "Chart":
      return { zone: "top", slot: "center" };
    case "Run":
      return { zone: "top", slot: "right" };
    case "Strategies":
      return { zone: "bottom", slot: "left" };
    case "StrategyDetail":
      return { zone: "bottom", slot: "center" };
    default:
      return { zone: "top", slot: "right" };
  }
}

function slotForContainerId(
  workspace: Workspace,
  id: string
): HorizontalSlot | null {
  const c = workspace.containers[id];
  if (!c) return null;
  return placementForKind(c.tabs[0].kind as PanelKind).slot;
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
      if (Object.keys(s.workspace.containers).length > 0) return s;

      const { workspace, createdContainerId } = openPanel(
        s.workspace,
        "Strategies"
      );

      return {
        workspace,
        layout: createdContainerId
          ? ensureVerticalRootLayout(createdContainerId)
          : s.layout,
      };
    });
  }, []);

  /* ======================================
   * CREATE PANEL (SOURCE UNIQUE)
   * ====================================== */
  function createPanel(
    kind: PanelKind,
    context: PanelContext = {},
    placement?: { zone: VerticalZone; slot: HorizontalSlot }
  ) {
    setState((s) => {
      const beforeIds = Object.keys(s.workspace.containers);

      const { workspace: nextWorkspace, createdContainerId } =
        openPanel(s.workspace, kind, context);

      // 🔁 Aucun nouveau container → simple update métier
      if (!createdContainerId) {
        return { ...s, workspace: nextWorkspace };
      }

      const { zone, slot } =
        placement ?? placementForKind(kind);

      const root = ensureVerticalRootLayout(s.layout);

      const nextLayout = insertInZoneAndSlot(
        root,
        zone,
        slot,
        createdContainerId,
        (id) => slotForContainerId(nextWorkspace, id)
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
    <div style={{ height: "100vh", padding: 8 }}>
      <WorkspaceDnDProvider state={state} onStateChange={setState}>
        {(hoveredContainerId, onSplitZoneChange) => (
          <WorkspaceMosaicView
            state={state}
            onStateChange={setState}
            hoveredContainerId={hoveredContainerId}
            onSplitZoneChange={onSplitZoneChange}
            createPanel={createPanel} // ✅ injection unique
          />
        )}
      </WorkspaceDnDProvider>
    </div>
  );
}
