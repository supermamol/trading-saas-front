import type { Container } from "./container";
import type { Tab } from "./tab";

export function getContainerKind(container: Container): Tab["kind"] {
  return container.tabs[0].kind;
}

export function assertValidContainer(container: Container): void {
    if (container.tabs.length === 0) {
      throw new Error("Container must not be empty");
    }
  
    if (!container.tabs.some(t => t.id === container.activeTabId)) {
      throw new Error("activeTabId must reference an existing tab");
    }
  
    const kind = container.tabs[0].kind;
    if (!container.tabs.every(t => t.kind === kind)) {
      throw new Error("All tabs in a container must share the same kind");
    }
  }

export function pickNextActiveTab(
  tabs: Tab[],
  removedTabId: Tab["id"]
): Tab["id"] {
  if (tabs.length === 0) {
    throw new Error("Cannot pick active tab from empty tab list");
  }

  const index = tabs.findIndex(t => t.id === removedTabId);

  // si le tab supprimé n'était pas actif → on garde l'actuel
  if (index === -1) {
    return tabs[0].id;
  }

  // priorité au tab suivant, sinon précédent
  const next = tabs[index] ?? tabs[index - 1];
  return next.id;
}


