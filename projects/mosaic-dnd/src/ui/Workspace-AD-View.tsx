import type { Workspace } from "../model/workspace";
import { openPanel, detachPanel } from "../model/workspace.panels";
import { closeTab } from "../model/workspace";

import { ContainerView } from "./ContainerView";

type Props = {
  workspace: Workspace;
  setWorkspace: (ws: Workspace) => void;
};

export function WorkspaceView({ workspace, setWorkspace }: Props) {
  return (
    <div>
      <h2>Workspace</h2>

      <button
        onClick={() =>
          setWorkspace(
            openPanel(workspace, "Chart", { strategyId: "S1" })
          )
        }
      >
        Open Chart S1
      </button>

      <button
        onClick={() =>
          setWorkspace(
            openPanel(workspace, "Run", { strategyId: "S2" })
          )
        }
      >
        Open Run S2
      </button>

      <hr />

      {Object.values(workspace.containers).map(container => (
        <ContainerView
          key={container.id}
          container={container}
          onCloseTab={(tabId) =>
            setWorkspace(closeTab(workspace, tabId))
          }
          onDetachTab={(tab) => {
            const { workspace: ws2 } = detachPanel(workspace, tab);
            setWorkspace(ws2);
          }}
        />
      ))}
    </div>
  );
}
