// src/model/panelActions.ts

import {
  isGroupable,
  canGroup,
  validatePanelGraph,
} from "./panelModel";

import type {
  PanelGraph,
  PanelNode,
  PanelKind,
} from "./panelModel";

/* -------------------------------------------------------
 * openPanel
 * ----------------------------------------------------- */
/**
 * Ouvre un panel :
 * - s’il existe déjà → no-op
 * - sinon → création avec container par défaut
 */
export function openPanel(
  graph: PanelGraph,
  panel: Omit<PanelNode, "container">
): PanelGraph {
  // Panel déjà présent → rien à faire
  if (graph.panels[panel.panelKey]) {
    return graph;
  }

  const container = isGroupable(panel.kind)
    ? { mode: "grouped", groupKind: panel.kind as PanelKind }
    : { mode: "floating" as const };

  const next: PanelGraph = {
    panels: {
      ...graph.panels,
      [panel.panelKey]: {
        ...panel,
        container,
      },
    },
  };

  validatePanelGraph(next);
  return next;
}

/* -------------------------------------------------------
 * detachPanel
 * ----------------------------------------------------- */
/**
 * Détache un panel (onglet → panel flottant)
 */
export function detachPanel(
  graph: PanelGraph,
  panelKey: string
): PanelGraph {
  const panel = graph.panels[panelKey];
  if (!panel) return graph;

  if (panel.container.mode === "floating") {
    return graph;
  }

  const next: PanelGraph = {
    panels: {
      ...graph.panels,
      [panelKey]: {
        ...panel,
        container: { mode: "floating" },
      },
    },
  };

  validatePanelGraph(next);
  return next;
}

/* -------------------------------------------------------
 * attachPanel
 * ----------------------------------------------------- */
/**
 * Rattache un panel flottant dans un groupe
 */
export function attachPanel(
  graph: PanelGraph,
  panelKey: string,
  targetGroupKind: PanelKind
): PanelGraph {
  const panel = graph.panels[panelKey];
  if (!panel) return graph;

  if (!canGroup(panel.kind, targetGroupKind)) {
    throw new Error(
      `Cannot attach panel ${panelKey} of kind ${panel.kind} to group ${targetGroupKind}`
    );
  }

  const next: PanelGraph = {
    panels: {
      ...graph.panels,
      [panelKey]: {
        ...panel,
        container: {
          mode: "grouped",
          groupKind: targetGroupKind,
        },
      },
    },
  };

  validatePanelGraph(next);
  return next;
}

/* -------------------------------------------------------
 * closePanel
 * ----------------------------------------------------- */
/**
 * Ferme définitivement un panel
 */
export function closePanel(
  graph: PanelGraph,
  panelKey: string
): PanelGraph {
  if (!graph.panels[panelKey]) {
    return graph;
  }

  const { [panelKey]: _, ...rest } = graph.panels;

  const next: PanelGraph = {
    panels: rest,
  };

  validatePanelGraph(next);
  return next;
}
