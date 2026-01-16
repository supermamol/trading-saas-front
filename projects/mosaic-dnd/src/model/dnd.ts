import type { Workspace } from "./workspace";

import type { TabId } from "./ids";
import type { ContainerId } from "./ids";

import {
  moveTabToContainer,
  isolateTab,
  closeTab,
  findContainerByTab,
} from "./workspace";

/* ======================================================
 * Types DnD
 * ====================================================== */

export type DropTarget =
  | {
      type: "header";
      containerId: ContainerId;
    }
  | {
      type: "outside";
    };

/* ======================================================
 * Intention DnD → Action métier
 * ====================================================== */

/**
 * Point d’entrée UNIQUE pour le Drag & Drop
 *
 * Le DnD exprime une intention,
 * le modèle décide de l’effet réel.
 */
export function handleTabDrop(
  workspace: Workspace,
  tabId: TabId,
  target: DropTarget
): Workspace {
  const source = findContainerByTab(workspace, tabId);
  if (!source) {
    throw new Error(`Source container not found for tab ${tabId}`);
  }

  const tab = source.tabs.find(t => t.id === tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found`);
  }

  switch (target.type) {
    case "header": {
      // tab -> entête
      return moveTabToContainer(
        workspace,
        tab,
        target.containerId
      );
    }

    case "outside": {
      // tab -> hors entête
      // le modèle décide : isolation OU fermeture
      return isolateTab(
        workspace,
        tab,
        generateContainerId()
      );
    }
  }
}

let containerSeq = 0;

function generateContainerId(): ContainerId {
  containerSeq += 1;
  return `container-${containerSeq}`;
}

