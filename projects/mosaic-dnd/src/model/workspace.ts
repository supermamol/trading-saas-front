/* ======================================================
 * Workspace — modèle refactoré avec Detached
 * ====================================================== */

import type { Container } from "./container";
import { pushTab, removeTab } from "./container";
import type { TabId, ContainerId } from "./ids";
import type { Tab } from "./tab";
import { canGroup } from "./canGroup";

/* ======================================================
 * Types
 * ====================================================== */

export type DetachedPanel = {
  kind: Tab["kind"];
  context: Record<string, unknown>;
};

export interface Workspace {
  containers: Record<ContainerId, Container>;
  detached: DetachedPanel[];
}

/* ======================================================
 * Sélecteurs
 * ====================================================== */

export function findContainerByTab(
  workspace: Workspace,
  tabId: TabId
): Container | undefined {
  return Object.values(workspace.containers)
    .find(c => c.tabs.some(t => t.id === tabId));
}

/* ======================================================
 * Helpers internes
 * ====================================================== */

function removeContainer(
  workspace: Workspace,
  containerId: ContainerId
): Workspace {
  const { [containerId]: _, ...rest } = workspace.containers;
  return {
    ...workspace,
    containers: rest,
  };
}

function removeTabFromContainer(
  workspace: Workspace,
  source: Container,
  tabId: TabId
): Workspace {
  // container avec plusieurs tabs → simple retrait
  if (source.tabs.length > 1) {
    return {
      ...workspace,
      containers: {
        ...workspace.containers,
        [source.id]: removeTab(source, tabId),
      },
    };
  }

  // container à 1 tab → dissolution
  return removeContainer(workspace, source.id);
}

/* ======================================================
 * Opérations métier
 * ====================================================== */

/**
 * Déplace un tab vers un autre container (header)
 */
 export function moveTabToContainer(
  workspace: Workspace,
  tab: Tab,
  targetContainerId: ContainerId
): Workspace {
  const source = findContainerByTab(workspace, tab.id);
  if (!source) throw new Error("Source not found");

  const target = workspace.containers[targetContainerId];
  if (!target) throw new Error("Target not found");

  // 🔒 RÈGLE MÉTIER
  if (!canGroup(tab, target)) {
    return workspace; // no-op métier
  }

  const afterRemoval =
    removeTabFromContainer(workspace, source, tab.id);

  return {
    ...afterRemoval,
    containers: {
      ...afterRemoval.containers,
      [target.id]: pushTab(target, tab),
    },
  };
}


/**
 * Ferme un tab
 */
export function closeTab(
  workspace: Workspace,
  tabId: TabId
): Workspace {
  const source = findContainerByTab(workspace, tabId);
  if (!source) {
    throw new Error(`Tab ${tabId} not found`);
  }

  return removeTabFromContainer(workspace, source, tabId);
}

/**
 * Isole un tab dans un nouveau container
 */
export function isolateTab(
  workspace: Workspace,
  tabId: TabId
): {
  workspace: Workspace;
  newContainerId: ContainerId;
} {
  const source = findContainerByTab(workspace, tabId);
  if (!source) {
    throw new Error(`Source container not found for tab ${tabId}`);
  }

  const tab = source.tabs.find(t => t.id === tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found in source container`);
  }

  const newContainerId: ContainerId = `C_${crypto.randomUUID()}`;

  const afterRemoval =
    removeTabFromContainer(workspace, source, tabId);

  return {
    workspace: {
      ...afterRemoval,
      containers: {
        ...afterRemoval.containers,
        [newContainerId]: {
          id: newContainerId,
          tabs: [tab],
        },
      },
    },
    newContainerId,
  };
}

export function isolateTabById(
  workspace: Workspace,
  tabId: TabId
): Workspace {
  return isolateTab(workspace, tabId).workspace;
}

/**
 * Detach d’un tab (sortie du workspace)
 */
export function detachTab(
  workspace: Workspace,
  tabId: TabId
): Workspace {
  const source = findContainerByTab(workspace, tabId);
  if (!source) {
    throw new Error(`Tab ${tabId} not found`);
  }

  const tab = source.tabs.find(t => t.id === tabId)!;

  const afterRemoval =
    removeTabFromContainer(workspace, source, tabId);

  return {
    ...afterRemoval,
    detached: [
      ...afterRemoval.detached,
      {
        kind: tab.kind,
        payload: tab.payload,
      },
    ],
  };
}
