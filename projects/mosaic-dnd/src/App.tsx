import "react-mosaic-component/react-mosaic-component.css";

import { useState } from "react";
import type { MosaicNode } from "react-mosaic-component";

import type { Workspace } from "./model/workspace";
import type { Container } from "./model/container";
import type { Tab } from "./model/tab";

import {
  WorkspaceMosaicView,
  buildInitialLayout,
  type WorkspaceState,
} from "./ui/WorkspaceMosaicView";

import { WorkspaceDnDProvider } from "./ui/WorkspaceDnDProvider";
import { openPanel } from "./model/workspace.panels";

/* ======================================================
 * Types
 * ====================================================== */
type Layout = MosaicNode<string>;

/* ======================================================
 * Initial workspace
 * ====================================================== */
function initialWorkspace(): Workspace {
  const A: Tab = { id: "A", kind: "chart" };
  const B: Tab = { id: "B", kind: "chart" };
  const C: Tab = { id: "C", kind: "chart" };
  const D: Tab = { id: "D", kind: "run" };
  const E: Tab = { id: "E", kind: "run" };
  const F: Tab = { id: "F", kind: "run" };
  const G: Tab = { id: "G", kind: "chart" };

  const c1: Container = { id: "C1", tabs: [A, B, C] };
  const c2: Container = { id: "C2", tabs: [D, E, F] };
  const c3: Container = { id: "C3", tabs: [G] };

  return {
    containers: {
      C1: c1,
      C2: c2,
      C3: c3,
    },
    detached: [],
  };
}

/* ======================================================
 * App
 * ====================================================== */
export default function App() {
  const [state, setState] = useState<WorkspaceState>(() => {
    const workspace = initialWorkspace();
    const containerIds = Object.keys(workspace.containers).sort();
    const layout = buildInitialLayout(containerIds);
    return { workspace, layout };
  });

  // 🔍 DEBUG DEV
  if (import.meta.env.DEV) {
    (window as any).__workspace = {
      containers: state.workspace.containers,
      detached: state.workspace.detached,
    };
  }

  const onStateChange = (
    updater: (s: WorkspaceState) => WorkspaceState
  ) => {
    setState(updater);
  };

  /* ======================================================
   * CREATE helpers (DEV)
   * ====================================================== */
  function create(kind: "Chart" | "Run" | "Nodered", strategyId?: string) {
    onStateChange((s) => {
      const beforeIds = Object.keys(s.workspace.containers);
      const nextWorkspace = openPanel(s.workspace, kind, { strategyId });
      const afterIds = Object.keys(nextWorkspace.containers);

      // si nouveau container → rebuild layout
      const layout =
        afterIds.length !== beforeIds.length
          ? buildInitialLayout(afterIds.sort())
          : s.layout;

      return {
        workspace: nextWorkspace,
        layout,
      };
    });
  }

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
      {/* ======================================================
       * DEV — CREATE buttons
       * ====================================================== */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 8,
          background: "#e5e7eb",
          borderRadius: 6,
          flexWrap: "wrap",
        }}
      >
        <strong>CREATE</strong>

        <button onClick={() => create("Chart")}>
          + Chart (no ctx)
        </button>
        <button onClick={() => create("Chart", "S1")}>
          + Chart S1
        </button>
        <button onClick={() => create("Chart", "S2")}>
          + Chart S2
        </button>

        <button onClick={() => create("Run", "S1")}>
          + Run S1
        </button>
        <button onClick={() => create("Run", "S2")}>
          + Run S2
        </button>

        <button onClick={() => create("Nodered", "S1")}>
          + Nodered S1
        </button>
      </div>

      {/* ======================================================
       * Workspace
       * ====================================================== */}
      <WorkspaceDnDProvider state={state} onStateChange={onStateChange}>
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
