import "react-mosaic-component/react-mosaic-component.css";

import { useState } from "react";
import type { MosaicNode } from "react-mosaic-component";

import type { Workspace } from "./model/workspace";
import type { Container } from "./model/container";
import type { Tab } from "./model/tab";

import { WorkspaceMosaicView, buildInitialLayout } from "./ui/WorkspaceMosaicView";
import { WorkspaceDnDProvider } from "./ui/WorkspaceDnDProvider";

type Layout = MosaicNode<string>;

type AppState = {
  workspace: Workspace;
  layout: Layout | null;
};

function initialWorkspace(): Workspace {
  const A: Tab = { id: "A", kind: "test" };
  const B: Tab = { id: "B", kind: "test" };
  const C: Tab = { id: "C", kind: "test" };

  const c1: Container = { id: "C1", tabs: [A, B] };
  const c2: Container = { id: "C2", tabs: [C] };

  return {
    containers: {
      C1: c1,
      C2: c2,
    },
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const workspace = initialWorkspace();
    const containerIds = Object.keys(workspace.containers).sort();
    const layout = buildInitialLayout(containerIds);
    return { workspace, layout };
  });

  return (
    <div
      style={{
        height: "calc(100vh - 80px)",
        background: "#f3f4f6",
        padding: 12,
      }}
    >
      <WorkspaceDnDProvider state={state} onStateChange={setState}>
        <WorkspaceMosaicView state={state} onStateChange={setState} />
      </WorkspaceDnDProvider>
    </div>
  );
}
