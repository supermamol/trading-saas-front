import type { Workspace } from "./workspace";

import type { TabId } from "./ids";
import type { ContainerId } from "./ids";

import {
  moveTabToContainer,
  isolateTab,
  findContainerByTab,
} from "./workspace";

/* ======================================================
 * Types DnD
 * ====================================================== */

export type SplitZone = "top" | "bottom" | "left" | "right";

export type DropTarget =
  | {
      type: "container";
      containerId: ContainerId;
    }
  | {
      type: "split";
      containerId: ContainerId;
      zone: SplitZone;
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
    return workspace; // 🔒 no-op safe
  }

  const tab = source.tabs.find(t => t.id === tabId);
  if (!tab) {
    return workspace; // 🔒 no-op safe
  }

  switch (target.type) {
    case "header": {
      // NO-OP si même container
      if (source.id === target.containerId) {
        return workspace;
      }
      return moveTabToContainer(
        workspace,
        tab,
        target.containerId
      );
    }

    case "outside": {
      const { workspace: next } = isolateTab(
        workspace,
        tab.id,
        generateContainerId()
      );
      return next;
    }
    
    default:
      return workspace; // 🔒 sécurité absolue
  }
}

let containerSeq = 0;

function generateContainerId(): ContainerId {
  containerSeq += 1;
  return `container-${containerSeq}`;
}

