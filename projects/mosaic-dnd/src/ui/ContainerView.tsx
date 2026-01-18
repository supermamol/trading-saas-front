// src/ui/ContainerView.tsx

import { useState, type DragEvent } from "react";
import type { Container } from "../model/container";
import type { Workspace } from "../model/workspace";
import { closeTab } from "../model/workspace";
import { handleTabDrop } from "../model/dnd";
import { detachPanel } from "../model/workspace.panels";
import { TabView } from "./TabView";

/**
 * MIME type utilisé pour le Drag & Drop des tabs
 */
const MIME = "application/x-mosaic-tab";

/**
 * Payload transporté pendant le drag d'un tab
 */
type DragPayload = {
    tabId: string;
    sourceContainerId: string;
};

/**
 * Helper pour lire le payload DnD
 */
function readDragPayload(e: DragEvent): DragPayload | null {
    const raw = e.dataTransfer.getData(MIME);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as DragPayload;
    } catch {
        return null;
    }
}

export function ContainerView({
    workspace,
    container,
    onWorkspaceChange,
}: {
    workspace: Workspace;
    container: Container;
    onWorkspaceChange: (next: Workspace) => void;
}) {
    const [dragOver, setDragOver] = useState(false);

    return (
        <div
            className="container-panel"
            style={{
                background: dragOver ? "#eef2ff" : "#ffffff",
            }}
            onDragOver={(e) => {
                if (e.dataTransfer.types.includes(MIME)) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                }
            }}
            onDragEnter={() => setDragOver(true)}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                // Empêche le drop "outside" global
                e.stopPropagation();
                setDragOver(false);

                const payload = readDragPayload(e);
                if (!payload) return;

                // Ignorer le drop sur le même container
                if (payload.sourceContainerId === container.id) return;

                onWorkspaceChange(
                    handleTabDrop(workspace, payload.tabId, {
                        type: "header",
                        containerId: container.id,
                    })
                );
            }}
        >
            {/* ===============================
          HEADER DU CONTAINER (informatif)
         =============================== */}
            <div
                style={{
                    padding: "6px 8px",
                    marginBottom: 6,
                    background: "#e5e7eb",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    color: "#111827",
                }}
            >
                Container {container.id}
            </div>

            {/* ===============================
          LISTE DES TABS
         =============================== */}
            {container.tabs.map((tab) => (
                <div key={tab.id} style={{ marginBottom: 6 }}>
                    <TabView
                        tab={tab}
                        containerId={container.id}
                        onClose={(tabId) =>
                            onWorkspaceChange(closeTab(workspace, tabId))
                        }
                        onDetach={(tab) => {
                            const { workspace: next } = detachPanel(workspace, tab);
                            onWorkspaceChange(next);
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
