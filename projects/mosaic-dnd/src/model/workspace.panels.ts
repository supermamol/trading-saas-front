/* ======================================================
 * Workspace Panels
 * ======================================================
 *
 * Couche d’orchestration métier AU‑DESSUS des tabs.
 *
 * Responsabilités :
 * - openPanel (logique métier + GroupKey)
 * - detachPanel (sortie vers fenêtre)
 * - retour via openPanel
 *
 * Ne gère PAS :
 * - layout
 * - Mosaic
 * - UI
 */

import type { Workspace } from "./workspace";
import type { Tab } from "./tab";
import type { ContainerId } from "./ids";

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

export type DetachedPanel = {
  kind: PanelKind;
  context: PanelContext;
};

/* ======================================================
 * API publique (à implémenter)
 * ====================================================== */

/**
 * Ouvre un panel selon les règles métier :
 * - calcul GroupKey
 * - regroupement ou création
 * - délègue aux opérations sur tabs
 */
 import { pushTab } from "./container";
 import type { Container } from "./container";
 import type { Tab } from "./tab";
 import type { ContainerId } from "./ids";
 
 let nextContainerId = 1;
 let nextTabId = 1;
 
 function makeTab(kind: PanelKind, context: PanelContext): Tab {
   return {
     id: `tab-${nextTabId++}` as any,
     kind,
     context,
   } as Tab;
 }
 
 function groupKeyFor(kind: PanelKind, context: PanelContext) {
   return {
     kind,
     strategyId: context.strategyId,
   };
 }
 
 export function openPanel(
   workspace: Workspace,
   kind: PanelKind,
   context: PanelContext
 ): Workspace {
   const tab = makeTab(kind, context);
   const groupKey = groupKeyFor(kind, context);
 
   // 1️⃣ chercher un container compatible
   const existing = Object.values(workspace.containers).find(
     c =>
       c.groupKey?.kind === groupKey.kind &&
       c.groupKey?.strategyId === groupKey.strategyId
   );
 
   if (existing) {
     const next = pushTab(existing, tab);
     return {
       containers: {
         ...workspace.containers,
         [existing.id]: next,
       },
     };
   }
 
   // 2️⃣ créer un nouveau container
   const containerId = `container-${nextContainerId++}` as ContainerId;
 
   const newContainer: Container = {
     id: containerId,
     groupKey,
     tabs: [tab],
   };
 
   return {
     containers: {
       ...workspace.containers,
       [containerId]: newContainer,
     },
   };
 }
 
 /**
 * Détache un panel :
 * - retire le tab du workspace
 * - ne laisse aucun container vide
 * - retourne la description métier du panel détaché
 */
  import { findContainerByTab, isolateTabById, closeTab } from "./workspace";
  import type { Tab } from "./tab";
  import type { Workspace } from "./workspace";
  
  export function detachPanel(
    workspace: Workspace,
    tab: Tab
  ): {
    workspace: Workspace;
    detached: { kind: any; context: any };
  } {
    const source = findContainerByTab(workspace, tab.id);
    if (!source) {
      throw new Error(`Tab ${tab.id} not found in workspace`);
    }
  
    // description métier du panel détaché
    const detached = {
      kind: tab.kind,
      context: tab.context,
    };
  
    // cas 1 : le container contient plusieurs tabs → isolation
    if (source.tabs.length > 1) {
      const nextWorkspace = isolateTabById(
        workspace,
        tab.id,
        `detached-${tab.id}` as any
      );
  
      // le container créé par isolateTab doit être supprimé
      const { [`detached-${tab.id}` as any]: _, ...rest } =
        nextWorkspace.containers;
  
      return {
        workspace: { containers: rest },
        detached,
      };
    }
  
    // cas 2 : le container ne contient qu’un tab → fermeture simple
    const nextWorkspace = closeTab(workspace, tab.id);
  
    return {
      workspace: nextWorkspace,
      detached,
    };
  }
  