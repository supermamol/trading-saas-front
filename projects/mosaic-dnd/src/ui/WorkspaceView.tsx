import { TabView } from "./TabView";
import type { Workspace } from "../model/workspace";
import { handleTabDrop } from "../model/dnd";

type Props = {
  workspace: Workspace;
  onChange: (ws: Workspace) => void;
};

export function WorkspaceView({ workspace, onChange }: Props) {
  const containers = Object.values(workspace.containers);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {containers.map((container) => (
        <div
          key={container.id}
          style={{ border: "1px solid #ccc", padding: 8, minWidth: 220 }}
        >
          <h3>Container {container.id}</h3>

          {container.tabs.map((tab) => (
            <div key={tab.id} style={{ border: "1px solid #ddd", padding: 6, marginBottom: 8 }}>
              {/* ✅ C2.1: Tab draggable */}
              <TabView tab={tab} containerId={container.id} />

              {/* Boutons C1 (tu peux les garder pour l’instant) */}
              <div style={{ marginTop: 6 }}>
                {containers
                  .filter((c) => c.id !== container.id)
                  .map((target) => (
                    <button
                      key={target.id}
                      onClick={() =>
                        onChange(
                          handleTabDrop(workspace, tab.id, {
                            type: "header",
                            containerId: target.id,
                          })
                        )
                      }
                      style={{ marginRight: 6 }}
                    >
                      → header {target.id}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    onChange(handleTabDrop(workspace, tab.id, { type: "outside" }))
                  }
                >
                  → outside
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
