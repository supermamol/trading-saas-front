// src/layout/tilesToMosaic.ts

import type { MosaicNode } from "react-mosaic-component";
import type { PanelKind } from "../model/panelModel";
import type { Tile } from "./panelGraphToTiles";

/**
 * Identifiant utilisé par Mosaic
 * - group:<kind>   -> fenêtre avec onglets internes
 * - panel:<key>    -> panel isolé
 */
export type TileId =
  | `group:${PanelKind}`
  | `panel:${string}`;

/**
 * Conversion Tile -> TileId
 */
function tileToId(tile: Tile): TileId {
  if (tile.type === "group") {
    return `group:${tile.groupKind}`;
  }
  return `panel:${tile.panelKey}`;
}

/**
 * Projection pure :
 * Tile[] -> MosaicNode
 *
 * AUCUNE logique métier
 * AUCUNE notion d’onglets
 * Layout volontairement simple (colonne)
 */
export function tilesToMosaic(
  tiles: Tile[]
): MosaicNode<TileId> | null {
  if (tiles.length === 0) {
    return null;
  }

  const ids = tiles.map(tileToId);

  if (ids.length === 1) {
    return ids[0];
  }

  // Empilement vertical déterministe
  let node: MosaicNode<TileId> = ids[0];

  for (let i = 1; i < ids.length; i++) {
    node = {
      direction: "column",
      first: node,
      second: ids[i],
    };
  }

  return node;
}
