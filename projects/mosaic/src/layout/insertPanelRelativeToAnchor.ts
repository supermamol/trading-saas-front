import type { MosaicNode } from "react-mosaic-component";
import type { TileId } from "./tilesToMosaic";
import type { Direction } from "./placeNewPanel";

export function insertPanelRelativeToAnchor(
  layout: MosaicNode<TileId>,
  anchorPanelKey: string,
  direction: Direction,
  newPanelKey: string
): MosaicNode<TileId> {
  const anchorId = `panel:${anchorPanelKey}` as TileId;
  const newId = `panel:${newPanelKey}` as TileId;

  function walk(node: MosaicNode<TileId>): MosaicNode<TileId> {
    if (node === anchorId) {
      if (direction === "left") {
        return { direction: "row", first: newId, second: node };
      }
      if (direction === "right") {
        return { direction: "row", first: node, second: newId };
      }
      if (direction === "top") {
        return { direction: "column", first: newId, second: node };
      }
      return { direction: "column", first: node, second: newId };
    }

    if (typeof node === "string") return node;

    return {
      ...node,
      first: walk(node.first),
      second: walk(node.second),
    };
  }

  return walk(layout);
}
