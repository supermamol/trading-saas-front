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

/* ======================================================
 * Types
 * ====================================================== */
type Layout = MosaicNode<string>;

/* ======================================================
 * Initial workspace
 * ====================================================== */
function initialWorkspace(): Workspace {
  const A: Tab = { id: "A", kind: "test" };
  const B: Tab = { id: "B", kind: "test" };
  const C: Tab = { id: "C", kind: "test" };
  const D: Tab = { id: "D", kind: "test" };
  const E: Tab = { id: "E", kind: "test" };
  const F: Tab = { id: "F", kind: "test" };
  const G: Tab = { id: "G", kind: "test" };

  const c1: Container = { id: "C1", tabs: [A, B, C] };
  const c2: Container = { id: "C2", tabs: [D, E, F] };
  const c3: Container = { id: "C3", tabs: [G] };

  return {
    containers: {
      C1: c1,
      C2: c2,
      C3: c3,
    },
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

  // 🔍 DEBUG DEV : exposer le workspace courant
  if (import.meta.env.DEV) {
    (window as any).__workspace = state.workspace;
  }

  const onStateChange = (
    updater: (s: WorkspaceState) => WorkspaceState
  ) => {
    setState(updater);
  };

  return (
    <div
      style={{
        height: "calc(100vh - 20px)",
        background: "#f3f4f6",
        padding: 12,
      }}
    >
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
