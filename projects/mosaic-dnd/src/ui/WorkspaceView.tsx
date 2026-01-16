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
      {containers.map(container => (
        <div
          key={container.id}
          style={{
            border: "1px solid #ccc",
            padding: 8,
            minWidth: 200,
          }}
        >
          <h3>Container {container.id}</h3>

          {container.tabs.map(tab => (
            <div
              key={tab.id}
              style={{
                border: "1px solid #999",
                padding: 4,
                marginBottom: 6,
              }}
            >
              <strong>Tab {tab.id}</strong>

              <div style={{ marginTop: 4 }}>
                {/* Simule tab → entête */}
                {containers
                  .filter(c => c.id !== container.id)
                  .map(target => (
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
                      style={{ marginRight: 4 }}
                    >
                      → header {target.id}
                    </button>
                  ))}

                {/* Simule tab → hors entête */}
                <button
                  onClick={() =>
                    onChange(
                      handleTabDrop(workspace, tab.id, {
                        type: "outside",
                      })
                    )
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
