import type { ContainerId } from "./ids";
import type { Container } from "./container";
import { pushTab } from "./container";

import type { Workspace } from "./workspace";
import { findContainerByTab, closeTab } from "./workspace";

import type { Tab } from "./tab";

/* ======================================================
 * Types métier Panels
 * ====================================================== */

export type PanelKind =
  | "Strategies"
  | "StrategyDetail"
  | "Chart"
  | "Run"
  | "Nodered";

export type PanelContext = {
  strategyId?: string;
};

type GroupKey = {
  kind: PanelKind;
  strategyId?: string;
};

// Tant que `Container` n’expose pas (encore) `groupKey` dans son type
type ContainerWithGroupKey = Container & { groupKey?: GroupKey };

/* ======================================================
 * Id generators (dev)
 * ====================================================== */

let nextContainerId = 1;
let nextTabId = 1;

function makeTab(kind: PanelKind, context: PanelContext = {}): Tab {
  return {
    id: `tab-${nextTabId++}` as any,
    kind,
    payload: context, // ✅ aligné sur Tab.payload
  };
}

function groupKeyFor(kind: PanelKind, context: PanelContext = {}): GroupKey {
  return {
    kind,
    strategyId: context.strategyId,
  };
}

/* ======================================================
 * API publique
 * ====================================================== */

/**
 * Ouvre un panel selon les règles métier :
 * - calcul GroupKey
 * - regroupement ou création
 * - délègue aux opérations sur tabs
 */
 export function openPanel(
  workspace: Workspace,
  kind: PanelKind,
  context: PanelContext = {}
): Workspace {
  const tab = makeTab(kind, context);
  const targetStrategyId = context.strategyId;

  const containers = Object.values(workspace.containers)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));

  // helpers
  const sameGroupKey = (t: Tab) =>
    t.kind === kind &&
    t.payload?.strategyId === targetStrategyId;

  const sameKind = (t: Tab) =>
    t.kind === kind;

  // 1️⃣ container "pur exact"
  const pureExact = containers.find(c =>
    c.tabs.every(t => sameGroupKey(t))
  );
  if (pureExact) {
    return {
      ...workspace,
      containers: {
        ...workspace.containers,
        [pureExact.id]: pushTab(pureExact, tab),
      },
    };
  }

  // 2️⃣ container "contient exact"
  const containsExact = containers.find(c =>
    c.tabs.some(t => sameGroupKey(t))
  );
  if (containsExact) {
    return {
      ...workspace,
      containers: {
        ...workspace.containers,
        [containsExact.id]: pushTab(containsExact, tab),
      },
    };
  }

  // 3️⃣ container "contient kind"
  const containsKind = containers.find(c =>
    c.tabs.some(t => sameKind(t))
  );
  if (containsKind) {
    return {
      ...workspace,
      containers: {
        ...workspace.containers,
        [containsKind.id]: pushTab(containsKind, tab),
      },
    };
  }

  // 4️⃣ aucun container compatible → nouveau container
  const containerId = `container-${nextContainerId++}` as ContainerId;

  const newContainer: ContainerWithGroupKey = {
    id: containerId,
    groupKey: {
      kind,
      strategyId: targetStrategyId,
    },
    tabs: [tab],
  };

  return {
    ...workspace,
    containers: {
      ...workspace.containers,
      [containerId]: newContainer,
    },
  };
}

/**
 * DETACH = sortie hors workspace → ajout dans workspace.detached[]
 * (la fenêtre / UI est gérée ailleurs)
 */
 export function detachPanel(
  workspace: Workspace,
  tab: Tab
): Workspace {
  const source = findContainerByTab(workspace, tab.id);
  if (!source) {
    throw new Error(`Tab ${tab.id} not found in workspace`);
  }

  const detachedPanel = {
    kind: tab.kind as PanelKind,
    context: tab.payload ?? {},   // ✅ FIX CRITIQUE
  };

  const nextWorkspace = closeTab(workspace, tab.id);

  return {
    ...nextWorkspace,
    detached: [...nextWorkspace.detached, detachedPanel],
  };
}

