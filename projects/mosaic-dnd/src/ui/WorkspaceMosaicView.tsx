import {
    Mosaic,
    MosaicWindow,
    type MosaicNode,
} from "react-mosaic-component";

import type { Workspace } from "../model/workspace";
import type { Container } from "../model/container";
import { ContainerView } from "./ContainerView";

/* ======================================================
 * Types
 * ====================================================== */
export type Layout = MosaicNode<string>;

export type WorkspaceState = {
    workspace: Workspace;
    layout: MosaicNode<string> | null;
};

type Props = {
    state: WorkspaceState;
    onStateChange: (updater: (s: WorkspaceState) => WorkspaceState) => void;
};

/* ======================================================
 * Utils
 * ====================================================== */
export function buildInitialLayout(containerIds: string[]): Layout | null {
    if (containerIds.length === 0) return null;
    if (containerIds.length === 1) return containerIds[0];

    return containerIds.slice(1).reduce<Layout>(
        (acc, id) => ({
            direction: "row",
            first: acc,
            second: id,
        }),
        containerIds[0]
    );
}

function pruneLayout(
    node: MosaicNode<string> | null,
    validIds: Set<string>
): MosaicNode<string> | null {
    if (!node) return null;

    if (typeof node === "string") {
        return validIds.has(node) ? node : null;
    }

    const first = pruneLayout(node.first, validIds);
    const second = pruneLayout(node.second, validIds);

    if (!first && !second) return null;
    if (!first) return second;
    if (!second) return first;

    return { ...node, first, second };
}

/* ======================================================
 * Component
 * ====================================================== */
export function WorkspaceMosaicView({
    state,
    onStateChange,
}: Props) {
    const { workspace, layout } = state;

    /**
     * Layout change = géométrie uniquement
     */
    const handleLayoutChange = (next: Layout | null) => {
        onStateChange(s => ({ ...s, layout: next }));
    };

    /**
     * Suppression visuelle d’un container (Mosaic ✕)
     * ⚠️ PAS un detach
     */
    const handleRemove = (containerId: string) => {
        onStateChange(s => {
            const nextWorkspace: Workspace = {
                containers: Object.fromEntries(
                    Object.entries(s.workspace.containers)
                        .filter(([id]) => id !== containerId)
                ),
            };

            const validIds = new Set(Object.keys(nextWorkspace.containers));

            return {
                ...s,
                workspace: nextWorkspace,
                layout: pruneLayout(s.layout, validIds),
            };
        });
    };

    /**
     * Rendu d’un tile
     */
    const renderTile = (containerId: string, path: any) => {
        const container: Container | undefined =
            workspace.containers[containerId];

        if (!container) {
            return (
                <MosaicWindow<string> path={path} title={null}>
                    <div />
                </MosaicWindow>
            );
        }

        return (
            <MosaicWindow<string>
                path={path}
                title={`Container ${containerId}`}
                onRemove={() => handleRemove(containerId)}
            >
                <ContainerView
                    container={container}
                    workspace={workspace}
                    onWorkspaceChange={(ws) =>
                        onStateChange(s => {
                            const validIds = new Set(Object.keys(ws.containers));
                            return {
                                ...s,
                                workspace: ws,
                                layout: pruneLayout(s.layout, validIds),
                            };
                        })
                    }
                />
            </MosaicWindow>
        );
    };

    const validIds = new Set(Object.keys(workspace.containers));
    const effectiveLayout = pruneLayout(layout, validIds);

    return (
        <Mosaic<string>
            value={effectiveLayout}
            onChange={handleLayoutChange}
            renderTile={renderTile}
        />
    );
}
