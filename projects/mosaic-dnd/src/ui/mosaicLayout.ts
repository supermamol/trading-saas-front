// src/ui/mosaicLayout.ts
import type { MosaicNode, MosaicParent } from "react-mosaic-component";

/** Zones verticales (root column: top/bottom) */
export type VerticalZone = "top" | "bottom";
/** Slots horizontaux dans une zone (left/center/right) */
export type HorizontalSlot = "left" | "center" | "right";

type Slot = "left" | "center" | "right";
const SLOT_ORDER: Slot[] = ["left", "center", "right"];

/**
 * Split un layout Mosaic autour d’un container cible.
 * Utilisé par :
 * - CREATE(direction) (si tu fais du placement relatif)
 * - SPLIT DnD
 */
export function splitLayoutAtPath(
  layout: MosaicNode<string> | null,
  targetId: string,
  newId: string,
  direction: "row" | "column",
  insert: "before" | "after"
): MosaicNode<string> | null {
  if (!layout) return layout;

  const replace = (node: MosaicNode<string>): MosaicNode<string> => {
    if (node === targetId) {
      const first = insert === "before" ? newId : targetId;
      const second = insert === "before" ? targetId : newId;
      return { direction, first, second } as MosaicParent<string>;
    }
    if (typeof node === "string") return node;

    return {
      ...node,
      first: replace(node.first),
      second: replace(node.second),
    } as MosaicParent<string>;
  };

  return replace(layout);
}

/**
 * Garantit un root layout vertical (column).
 * - layout vide => column(first:null, second:null)
 * - layout non vertical => on le met en TOP par défaut
 */
export function ensureVerticalRootLayout(
  layout: MosaicNode<string> | null
): MosaicParent<string> {
  if (!layout) {
    return { direction: "column", first: null, second: null };
  }

  if (typeof layout !== "string" && layout.direction === "column") {
    return layout;
  }

  return { direction: "column", first: layout, second: null };
}

/**
 * Insertion "zonée" : place un container dans (top/bottom) et approx (left/center/right)
 * en se basant sur une fonction getSlotForId(id).
 *
 * Important : c’est un placement *UI*, pas métier.
 */
export function insertInZoneAndSlot(
  root: MosaicParent<string>,
  zone: VerticalZone,
  slot: HorizontalSlot,
  newId: string,
  getSlotForId: (id: string) => HorizontalSlot | null
): MosaicParent<string> {
  const zoneKey = zone === "top" ? "first" : "second";
  const zoneNode = root[zoneKey];

  // Zone vide => insertion directe
  if (!zoneNode) {
    return { ...root, [zoneKey]: newId };
  }

  // Collecte des ids existants dans la zone (ordre DFS)
  const collect = (node: MosaicNode<string>, acc: string[]) => {
    if (typeof node === "string") acc.push(node);
    else {
      collect(node.first, acc);
      collect(node.second, acc);
    }
  };

  const ids: string[] = [];
  collect(zoneNode, ids);

  // Trouver une ancre : 1er id dont le slot >= slot cible
  const order: HorizontalSlot[] = ["left", "center", "right"];
  const targetIndex = order.indexOf(slot);

  let anchor: string | null = null;
  for (const id of ids) {
    const s = getSlotForId(id);
    if (s && order.indexOf(s) >= targetIndex) {
      anchor = id;
      break;
    }
  }

  // Pas d’ancre => append à droite
  if (!anchor) {
    return {
      ...root,
      [zoneKey]: { direction: "row", first: zoneNode, second: newId },
    };
  }

  // Insertion avant l’ancre (row)
  return {
    ...root,
    [zoneKey]: splitLayoutAtPath(zoneNode, anchor, newId, "row", "before"),
  } as MosaicParent<string>;
}
