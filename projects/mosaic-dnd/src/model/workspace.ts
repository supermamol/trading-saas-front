/* ======================================================
 * Invariants Workspace
 * ======================================================
 *
 * - un TabId n’existe que dans un seul container
 * - un container ne peut pas être vide
 * - un container avec 1 tab est valide
 * - toute opération est atomique
 */

import type { Container } from "./container";
import { pushTab, removeTab } from "./container";

import type { TabId, ContainerId } from "./ids";
import type { Tab } from "./tab";

/**
 * Workspace
 * ---
 * État global du système de tabs
 */
export interface Workspace {
    containers: Record<ContainerId, Container>;
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
 * Opérations métier (atomiques)
 * ====================================================== */

/**
 * Déplace un tab d’un container source vers un container cible
 * (tab -> entête)
 */
 export function moveTabToContainer(
    workspace: Workspace,
    tab: Tab,
    targetContainerId: ContainerId
  ): Workspace {
    const source = findContainerByTab(workspace, tab.id);
    if (!source) {
      throw new Error(`Source container not found for tab ${tab.id}`);
    }
  
    const target = workspace.containers[targetContainerId];
    if (!target) {
      throw new Error(`Target container ${targetContainerId} not found`);
    }
  
    const nextTarget = pushTab(target, tab);
  
    // Cas 1️⃣ : le container source avait > 1 tab
    if (source.tabs.length > 1) {
      const nextSource = removeTab(source, tab.id);
  
      return {
        containers: {
          ...workspace.containers,
          [source.id]: nextSource,
          [target.id]: nextTarget,
        },
      };
    }
  
    // Cas 2️⃣ : le container source avait 1 tab → auto‑dissolution
    const { [source.id]: _, ...rest } = workspace.containers;
  
    return {
      containers: {
        ...rest,
        [target.id]: nextTarget,
      },
    };
  }
  

/**
 * Isole un tab
 * (tab -> hors entête)
 *
 * - crée un nouveau container
 * - retire le tab de son container source
 */
function removeContainer(
    workspace: Workspace,
    containerId: ContainerId
): Workspace {
    const { [containerId]: _, ...rest } = workspace.containers;
    return { containers: rest };
}

/**
 * Ferme un tab
 *
 * - si le container contient > 1 tab → retrait simple
 * - si le container contient 1 tab → destruction du container
 */
export function closeTab(
    workspace: Workspace,
    tabId: TabId
): Workspace {
    const source = findContainerByTab(workspace, tabId);
    if (!source) {
        throw new Error(`Tab ${tabId} not found`);
    }

    if (source.tabs.length > 1) {
        const nextSource = removeTab(source, tabId);
        return {
            containers: {
                ...workspace.containers,
                [source.id]: nextSource,
            },
        };
    }

    // source.tabs.length === 1
    return removeContainer(workspace, source.id);
}

/**
 * Isole un tab
 *
 * - si le container source contient > 1 tab → isolation
 * - sinon → fermeture du tab
 */
 export function isolateTab(
    workspace: Workspace,
    tab: Tab,
    newContainerId: ContainerId
  ): Workspace {
    const source = findContainerByTab(workspace, tab.id);
    if (!source) {
      throw new Error(`Source container not found for tab ${tab.id}`);
    }
  
    if (source.tabs.length === 1) {
      // isolation impossible → fermeture
      return closeTab(workspace, tab.id);
    }
  
    const nextSource = removeTab(source, tab.id);
  
    const newContainer: Container = {
      id: newContainerId,
      tabs: [tab],
    };
  
    return {
      containers: {
        ...workspace.containers,
        [source.id]: nextSource,
        [newContainerId]: newContainer,
      },
    };
  }

