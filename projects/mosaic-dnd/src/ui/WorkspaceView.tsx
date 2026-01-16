import type { Workspace } from "../model/workspace";
import { handleTabDrop } from "../model/dnd";
import { TabView } from "./TabView";
import React from "react";

type Props = {
  workspace: Workspace;
  onChange: (ws: Workspace) => void;
};

const MIME = "application/x-mosaic-tab";

type DragPayload = {
  tabId: string;
  sourceContainerId: string;
};

function readDragPayload(
  e: React.DragEvent
): DragPayload | null {
  const raw = e.dataTransfer.getData(MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

export function WorkspaceView({ workspace, onChange }: Props) {
  const containers = Object.values(workspace.containers);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {containers.map((container) => (
        <div
          key={container.id}
          style={{
            border: "1px solid #ccc",
            padding: 8,
            minWidth: 240,
            background: "#fafafa",
          }}
        >
          {/* ===============================
              Header du container (DROP ZONE)
             =============================== */}
          <div
            style={{
              padding: 6,
              border: "1px dashed #bbb",
              marginBottom: 8,
              background: "#fff",
            }}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes(MIME)) {
                e.preventDefault(); // autorise le drop
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={(e) => {
              const payload = readDragPayload(e);
              if (!payload) return;

              // optionnel : ignorer drop sur même container
              if (payload.sourceContainerId === container.id) {
                return;
              }

              onChange(
                handleTabDrop(workspace, payload.tabId, {
                  type: "header",
                  containerId: container.id,
                })
              );
            }}
          >
            <h3 style={{ margin: 0 }}>
              Container {container.id}
            </h3>
          </div>

          {/* ===============================
              Tabs
             =============================== */}
          {container.tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                border: "1px solid #ddd",
                padding: 6,
                marginBottom: 8,
                background: "#fff",
              }}
            >
              {/* C2.1 — Tab draggable */}
              <TabView
                tab={tab}
                containerId={container.id}
              />

              {/* Boutons C1 (fallback / debug) */}
              <div style={{ marginTop: 6 }}>
                {containers
                  .filter((c) => c.id !== container.id)
                  .map((target) => (
                    <button
                      key={target.id}
                      onClick={() =>
                        onChange(
                          handleTabDrop(
                            workspace,
                            tab.id,
                            {
                              type: "header",
                              containerId: target.id,
                            }
                          )
                        )
                      }
                      style={{ marginRight: 6 }}
                    >
                      → header {target.id}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    onChange(
                      handleTabDrop(
                        workspace,
                        tab.id,
                        { type: "outside" }
                      )
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
