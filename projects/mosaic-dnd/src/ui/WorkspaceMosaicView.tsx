// Interfaces attendues
// workspace.containers : Record<ContainerId, Container>
/*
type Workspace = {
    containers: Record<string, Container>;
  };
*/  

import { useState, useMemo } from "react";
import { Mosaic, MosaicWindow, type MosaicNode } from "react-mosaic-component";

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

  // split linéaire très simple
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

  // 🔹 UI state pur : layout Mosaic
  const [layout, setLayout] = useState<MosaicLayout | null>(() =>
    buildInitialLayout(containerIds)
  );

  /**
   * Important :
   * - onChange(layout) = géométrie uniquement
   * - AUCUN impact sur le workspace
   */
  const handleLayoutChange = (nextLayout: MosaicLayout | null) => {
    setLayout(nextLayout);
  };

  /**
   * Important :
   * - onRemove = fermeture visuelle
   * - PAS un detach
   */
  const handleRemove = (containerId: string) => {
    const container = workspace.containers[containerId];
    if (!container) return;

    // close container = close tous ses tabs
    // 👉 on délègue au modèle existant
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
  const renderTile = (containerId: string) => {
    const container: Container | undefined =
      workspace.containers[containerId];

    if (!container) {
      return null;
    }

    return (
      <MosaicWindow<string>
        path={[]}
        title={`Container ${containerId}`}
        onRemove={() => handleRemove(containerId)}
      >
        <ContainerView
          container={container}
          // close / detach / isolate restent gérés ici
          // et propagés via onWorkspaceChange
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
