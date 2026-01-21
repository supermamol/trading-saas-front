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
  const groupKey = groupKeyFor(kind, context);

  // 1️⃣ chercher un container compatible
  const existing = Object.values(workspace.containers).find((c) => {
    const cg = (c as ContainerWithGroupKey).groupKey;
    return cg?.kind === groupKey.kind && cg?.strategyId === groupKey.strategyId;
  }) as ContainerWithGroupKey | undefined;

  if (existing) {
    return {
      ...workspace,
      containers: {
        ...workspace.containers,
        [existing.id]: pushTab(existing, tab),
      },
    };
  }

  // 2️⃣ créer un nouveau container
  const containerId = `container-${nextContainerId++}` as ContainerId;

  const newContainer: ContainerWithGroupKey = {
    id: containerId,
    groupKey,
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

