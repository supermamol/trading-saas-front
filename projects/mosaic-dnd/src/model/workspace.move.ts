import type { Workspace } from "./workspace";
import type { Tab } from "./tab";
import type { ContainerId, TabId } from "./ids";

export function moveTab(
  workspace: Workspace,
  tabId: TabId,
  targetContainerId: ContainerId
): Workspace {
  let sourceContainerId: ContainerId | null = null;
  let tabToMove: Tab | null = null;

  for (const [cid, container] of Object.entries(workspace.containers)) {
    const found = container.tabs.find(t => t.id === tabId);
    if (found) {
      sourceContainerId = cid as ContainerId;
      tabToMove = found;
      break;
    }
  }

  if (!sourceContainerId || !tabToMove) {
    throw new Error(`Tab ${tabId} not found`);
  }

  const source = workspace.containers[sourceContainerId];
  const target = workspace.containers[targetContainerId];

  const nextSourceTabs = source.tabs.filter(t => t.id !== tabId);

  const nextContainers = {
    ...workspace.containers,
    [targetContainerId]: {
      ...target,
      tabs: [...target.tabs, tabToMove], // push → actif
    },
  };

  if (nextSourceTabs.length === 0) {
    delete nextContainers[sourceContainerId];
  } else {
    nextContainers[sourceContainerId] = {
      ...source,
      tabs: nextSourceTabs,
    };
  }

  return {
    ...workspace,
    containers: nextContainers,
  };
}
