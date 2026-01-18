// src/ui/WorkspaceMosaicView.tsx

import { useState, useEffect } from "react";
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

// Phase 0 : 1 container métier = 1 node Mosaic
type MosaicLayout = MosaicNode<string>;

/* ======================================================
 * Utils — layout minimal
 * ====================================================== */

/**
 * Génère un layout Mosaic minimal à partir des containers.
 * - 0 container → null
 * - 1 container → leaf
 * - n containers → split linéaire (ordre arbitraire)
 *
 * ⚠️ Aucune promesse de direction / position
 */
function buildInitialLayout(containerIds: string[]): MosaicLayout | null {
    if (containerIds.length === 0) {
        return null;
    }

    if (containerIds.length === 1) {
        return containerIds[0];
    }

    return containerIds.slice(1).reduce<MosaicLayout>(
        (acc, id) => ({
            direction: "row",
            first: acc,
            second: id,
        }),
        containerIds[0]
    );
}

/* ======================================================
 * Component
 * ====================================================== */

export function WorkspaceMosaicView({
    workspace,
    onWorkspaceChange,
}: {
    workspace: Workspace;
    onWorkspaceChange: (next: Workspace) => void;
}) {
    const containerIds = Object.keys(workspace.containers);

    /**
     * UI state pur : layout Mosaic
     * ⚠️ DÉRIVÉ du workspace, jamais source de vérité
     */
    const [layout, setLayout] = useState<MosaicLayout | null>(() =>
        buildInitialLayout(containerIds)
    );

    /**
     * 🔒 Règle Phase Mosaic 0
     * Si les containers changent, on reconstruit le layout.
     * (brutal mais sain à ce stade)
     */
    useEffect(() => {
        setLayout(buildInitialLayout(containerIds));
    }, [containerIds.join("|")]);

    /**
     * onChange(layout)
     * → géométrie UNIQUEMENT
     * → aucun impact métier
     */
    const handleLayoutChange = (nextLayout: MosaicLayout | null) => {
        setLayout(nextLayout);
    };

    /**
     * onRemove(containerId)
     * → fermeture visuelle
     * → PAS un detach
     */
    const handleRemove = (containerId: string) => {
        if (!workspace.containers[containerId]) return;

        onWorkspaceChange({
            ...workspace,
            containers: Object.fromEntries(
                Object.entries(workspace.containers).filter(
                    ([id]) => id !== containerId
                )
            ),
        });
    };

    /**
     * Rendu d’un container
     * Mosaic ne connaît QUE les containers
     */
    const renderTile = (containerId: string, path: any) => {
        const container: Container | undefined =
            workspace.containers[containerId];

        if (!container) {
            return null;
        }

        return (
            <MosaicWindow<string>
                path={path}
                title={null}
                renderToolbar={() => null}
            >
                <ContainerView
                    workspace={workspace}
                    container={container}
                    onWorkspaceChange={onWorkspaceChange}
                />
            </MosaicWindow>
        );
    };

    return (
        <Mosaic<string>
            value={layout}
            onChange={handleLayoutChange}
            renderTile={renderTile}
        />
    );
}
