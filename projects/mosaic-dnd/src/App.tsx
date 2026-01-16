import { useState } from "react";
import type { Workspace } from "./model/workspace";
import type { Container } from "./model/container";
import type { Tab } from "./model/tab";
import { WorkspaceView } from "./ui/WorkspaceView";

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
  const [workspace, setWorkspace] =
    useState<Workspace>(initialWorkspace);

  return (
    <div style={{ padding: 16 }}>
      <h1>Mosaic DnD — C1</h1>

      <WorkspaceView
        workspace={workspace}
        onChange={setWorkspace}
      />
    </div>
  );
}
