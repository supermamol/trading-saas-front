// src/ui/Workspace-AD-DebugView.tsx

import type { Workspace } from "../model/workspace";
import type { Tab } from "../model/tab";

import { openPanel, detachPanel } from "../model/workspace.panels";
import { closeTab } from "../model/workspace";

type Props = {
  workspace: Workspace;
  setWorkspace: (ws: Workspace) => void;
};

export function WorkspaceADDebugView({ workspace, setWorkspace }: Props) {
  return (
    <div style={{ fontFamily: "monospace", padding: 12 }}>
      <h3>Workspace – AD Debug View</h3>

      {/* Actions explicites de test */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() =>
            setWorkspace(
              openPanel(workspace, "Chart", { strategyId: "S1" })
            )
          }
        >
          Open Chart S1
        </button>{" "}
        <button
          onClick={() =>
            setWorkspace(
              openPanel(workspace, "Run", { strategyId: "S2" })
            )
          }
        >
          Open Run S2
        </button>
      </div>

      {/* Projection brute du Workspace */}
      {Object.values(workspace.containers).map(container => (
        <div
          key={container.id}
          style={{
            border: "1px solid #aaa",
            marginBottom: 8,
            padding: 8,
          }}
        >
          <div>
            <strong>
              Container {container.id} | groupKey:{" "}
              {container.groupKey.kind}
              {container.groupKey.strategyId
                ? `:${container.groupKey.strategyId}`
                : ""}
            </strong>
          </div>

          <ul>
            {container.tabs.map(tab => (
              <li key={tab.id}>
                Tab {tab.id} ({tab.kind}
                {tab.context.strategyId
                  ? `, ${tab.context.strategyId}`
                  : ""}
                )
                {" "}
                <button
                  onClick={() =>
                    handleDetach(tab, workspace, setWorkspace)
                  }
                >
                  detach
                </button>{" "}
                <button
                  onClick={() =>
                    setWorkspace(closeTab(workspace, tab.id))
                  }
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ======================================================
 * Helper local — aucun métier ici
 * ==================================================== */

function handleDetach(
  tab: Tab,
  workspace: Workspace,
  setWorkspace: (ws: Workspace) => void
) {
  const { workspace: next } = detachPanel(workspace, tab);
  setWorkspace(next);
}
