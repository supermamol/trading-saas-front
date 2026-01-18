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

function buildInitialLayout(containerIds: string[]): MosaicLayout | null {
  if (containerIds.length === 0) return null;
  if (containerIds.length === 1) return containerIds[0];

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
  onWorkspaceChange: (updater: (ws: Workspace) => Workspace) => void;
}) {
  const containerIds = Object.keys(workspace.containers).sort();

  /**
   * UI state pur : layout Mosaic
   * ⚠️ dérivé du workspace (Phase 0)
   */
  const [layout, setLayout] = useState<MosaicLayout | null>(() =>
    buildInitialLayout(containerIds)
  );

  /**
   * 🔁 Phase 0 :
   * dès que la structure métier change,
   * on reconstruit le layout
   */
  useEffect(() => {
    setLayout(buildInitialLayout(containerIds));
  }, [containerIds.join("|")]);

  /**
   * onChange(layout)
   * → géométrie UNIQUEMENT
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
    onWorkspaceChange((ws) => ({
      ...ws,
      containers: Object.fromEntries(
        Object.entries(ws.containers).filter(
          ([id]) => id !== containerId
        )
      ),
    }));
  };

  /**
   * Rendu d’un container
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
