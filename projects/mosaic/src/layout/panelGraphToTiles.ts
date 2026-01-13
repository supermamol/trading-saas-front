// src/layout/panelGraphToTiles.ts

import type { PanelGraph, PanelKind } from "../model/panelModel";

/**
 * Une Tile représente UNE fenêtre Mosaic potentielle
 * - group  : fenêtre avec onglets internes
 * - panel  : fenêtre isolée
 */
export type Tile =
  | {
      type: "group";
      groupKind: PanelKind;
      panelKeys: string[];
    }
  | {
      type: "panel";
      panelKey: string;
    };

/**
 * Projection pure :
 * PanelGraph (métier) -> Tile[] (spatial abstrait)
 *
 * AUCUNE logique UI ici
 * AUCUNE dépendance Mosaic
 */
export function panelGraphToTiles(
  graph: PanelGraph
): Tile[] {
  const grouped: Record<PanelKind, string[]> = {} as any;
  const floating: string[] = [];

  for (const panel of Object.values(graph.panels)) {
    if (panel.container.mode === "floating") {
      floating.push(panel.panelKey);
    } else {
      const kind = panel.container.groupKind;
      grouped[kind] ??= [];
      grouped[kind].push(panel.panelKey);
    }
  }

  const tiles: Tile[] = [];

  // 1) Une tile par groupe (même avec 1 seul onglet)
  for (const [kind, panelKeys] of Object.entries(grouped)) {
    console.log(
      "[GROUP TILE]",
      kind,
      panelKeys
    );
    tiles.push({
      type: "group",
      groupKind: kind as PanelKind,
      panelKeys,
    });
  }  

  // 2) Une tile par panel flottant
  for (const panelKey of floating) {
    tiles.push({
      type: "panel",
      panelKey,
    });
  }

  return tiles;
}
