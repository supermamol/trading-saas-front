import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";

import { WorkspaceView } from "./ui/WorkspaceView";
import { WorkspaceADDebugView } from "./ui/Workspace-AD-DebugView";

import type { Workspace } from "./model/workspace";

const initialWorkspace: Workspace = {
  containers: {},
};

function App() {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);

  // 🔴 SWITCH TEMPORAIRE ICI
  const DEBUG_AD = true;

  return DEBUG_AD ? (
    <WorkspaceADDebugView
      workspace={workspace}
      setWorkspace={setWorkspace}
    />
  ) : (
    <WorkspaceView />
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* 
// ---------- POC mosaic-dnd ----------
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/
