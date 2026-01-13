// src/model/panelGraph.ts

export type PanelKind =
  | "strategies"
  | "strategyDetail"
  | "chart"
  | "run"
  | "nodered";

export type PanelNode = {
  panelKey: string;
  kind: PanelKind;
  strategyId?: string;
};

export type PanelGraph = {
  panels: PanelNode[];
};

export function createPanelGraph(): PanelGraph {
  return { panels: [] };
}

export function openPanel(
  graph: PanelGraph,
  panel: PanelNode
): PanelGraph {
  if (graph.panels.some(p => p.panelKey === panel.panelKey)) {
    return graph;
  }

  return {
    ...graph,
    panels: [...graph.panels, panel],
  };
}

export function closePanel(
  graph: PanelGraph,
  panelKey: string
): PanelGraph {
  return {
    ...graph,
    panels: graph.panels.filter(
      p => p.panelKey !== panelKey
    ),
  };
}
