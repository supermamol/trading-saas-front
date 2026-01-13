import type { MosaicNode } from "react-mosaic-component";
import type { PanelGraph, PanelNode } from "../model/panelGraph";

export type TileId = string;

/**
 * Projection métier → layout Mosaic
 * SQUELETTE CANONIQUE
 */
export function panelGraphToMosaic(
  graph: PanelGraph
): MosaicNode<TileId> | null {

  if (graph.panels.length === 0) {
    return null;
  }

  // Helpers
  const find = (kind: string) =>
    graph.panels.find(p => p.kind === kind);

  const findAll = (kind: string) =>
    graph.panels.filter(p => p.kind === kind);

  const strategies = find("strategies");
  const nodered = find("nodered");
  const strategyDetail = find("strategyDetail");
  const charts = findAll("chart");
  const runs = findAll("run");

  // État 1 : démarrage (Strategies seul)
  if (strategies && graph.panels.length === 1) {
    return strategies.panelKey;
  }

  // LEFT column (fixe)
  const leftColumn: MosaicNode<TileId> = {
    direction: "column",
    first: nodered?.panelKey ?? "EMPTY",
    second: strategies?.panelKey ?? "EMPTY",
    splitPercentage: 75, // Nodered prioritaire
  };

  // RIGHT column (évolutive)
  const rightColumn = buildRightColumn(
    charts,
    strategyDetail,
    runs
  );

  return {
    direction: "row",
    first: leftColumn,
    second: rightColumn,
    splitPercentage: 30,
  };
}

/**
 * Construit la colonne droite :
 * Chart
 * StrategyDetail
 * Run
 */
function buildRightColumn(
  charts: PanelNode[],
  strategyDetail?: PanelNode,
  runs?: PanelNode[]
): MosaicNode<TileId> {

  // Chart : on prend la première instance pour l’itération 2
  const chart = charts[0];
  const run = runs?.[0];

  // Cas : seulement StrategyDetail
  if (!chart && !run && strategyDetail) {
    return strategyDetail.panelKey;
  }

  // Cas Chart + StrategyDetail
  if (chart && !run && strategyDetail) {
    return {
      direction: "column",
      first: chart.panelKey,
      second: strategyDetail.panelKey,
    };
  }

  // Cas StrategyDetail + Run
  if (!chart && run && strategyDetail) {
    return {
      direction: "column",
      first: strategyDetail.panelKey,
      second: run.panelKey,
    };
  }

  // Cas Chart + StrategyDetail + Run
  if (chart && run && strategyDetail) {
    return {
      direction: "column",
      first: chart.panelKey,
      second: {
        direction: "column",
        first: strategyDetail.panelKey,
        second: run.panelKey,
      },
    };
  }

  // Fallback sécurité
  return strategyDetail?.panelKey ?? "EMPTY";
}
