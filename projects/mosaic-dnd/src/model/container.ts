import type { TabId, ContainerId } from "./ids";
import type { Tab } from "./tab";

/**
 * ContainerId
 * ---
 * Identifiant stable d’un container
 */

/**
 * Container
 * ---
 * - contient une pile LIFO de tabs
 * - possède toujours un tab actif
 */
export interface Container {
  id: ContainerId;

  /**
   * Pile LIFO des tabs
   * - dernier élément = tab actif
   */
  tabs: Tab[];
}

/* ======================================================
 * Invariants (documentaires, non codés ici)
 * ======================================================
 *
 * - tabs.length >= 1
 * - tabs[tabs.length - 1] est le tab actif
 * - un TabId n’apparaît qu’une seule fois dans le workspace
 */

/* ======================================================
 * Opérations pures sur Container
 * ====================================================== */

/**
 * Ajoute un tab en haut de pile (devient actif)
 */
export function pushTab(
  container: Container,
  tab: Tab
): Container {
  return {
    ...container,
    tabs: [...container.tabs, tab],
  };
}

/**
 * Retire un tab du container
 * (peut être le tab actif ou non)
 */
export function removeTab(
  container: Container,
  tabId: TabId
): Container {
  const nextTabs = container.tabs.filter(t => t.id !== tabId);

  if (nextTabs.length === 0) {
    throw new Error(
      `Invariant violation: container ${container.id} cannot be empty`
    );
  }

  return {
    ...container,
    tabs: nextTabs,
  };
}

/**
 * Active un tab existant
 * (LIFO: on le remonte en haut de pile)
 */
export function activateTab(
  container: Container,
  tabId: TabId
): Container {
  const tab = container.tabs.find(t => t.id === tabId);
  if (!tab) {
    throw new Error(`Tab ${tabId} not found in container ${container.id}`);
  }

  const without = container.tabs.filter(t => t.id !== tabId);

  return {
    ...container,
    tabs: [...without, tab],
  };
}
