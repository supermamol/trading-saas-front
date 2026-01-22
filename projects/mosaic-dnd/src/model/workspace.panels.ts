import type { ContainerId } from "./ids";
import type { Container } from "./container";
import { pushTab } from "./container";
import type { Workspace } from "./workspace";
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
    payload: context,
  };
}

function groupKeyFor(kind: PanelKind, context: PanelContext = {}): GroupKey {
  return {
    kind,
    strategyId: context.strategyId,
  };
}

/* ======================================================
 * Résultat CREATE (clé pour le layout)
 * ====================================================== */
export type OpenPanelResult = {
  workspace: Workspace;
  createdContainerId: ContainerId | null;
};

/* ======================================================
 * API CREATE — modèle pur (AUCUN layout ici)
 * ====================================================== */
export function openPanel(
  workspace: Workspace,
  kind: PanelKind,
  context: PanelContext = {}
): OpenPanelResult {
  const tab = makeTab(kind, context);
  const groupKey = groupKeyFor(kind, context);
  const containers = Object.values(workspace.containers);

  const sameExact = (t: Tab) =>
    t.kind === kind && t.payload?.strategyId === context.strategyId;

  const sameKind = (t: Tab) => t.kind === kind;

  // 1️⃣ container exact
  const exact = containers.find(c =>
    c.tabs.every(t => sameExact(t))
  );
  if (exact) {
    return {
      workspace: {
        ...workspace,
        containers: {
          ...workspace.containers,
          [exact.id]: pushTab(exact, tab),
        },
      },
      createdContainerId: null,
    };
  }

  // 2️⃣ container contenant exact
  const containsExact = containers.find(c =>
    c.tabs.some(t => sameExact(t))
  );
  if (containsExact) {
    return {
      workspace: {
        ...workspace,
        containers: {
          ...workspace.containers,
          [containsExact.id]: pushTab(containsExact, tab),
        },
      },
      createdContainerId: null,
    };
  }

  // 3️⃣ container contenant kind
  const containsKind = containers.find(c =>
    c.tabs.some(t => sameKind(t))
  );
  if (containsKind) {
    return {
      workspace: {
        ...workspace,
        containers: {
          ...workspace.containers,
          [containsKind.id]: pushTab(containsKind, tab),
        },
      },
      createdContainerId: null,
    };
  }

  // 4️⃣ création d’un nouveau container
  const containerId = `container-${nextContainerId++}` as ContainerId;

  const newContainer: ContainerWithGroupKey = {
    id: containerId,
    groupKey,
    tabs: [tab],
  };

  return {
    workspace: {
      ...workspace,
      containers: {
        ...workspace.containers,
        [containerId]: newContainer,
      },
    },
    createdContainerId: containerId,
  };
}
