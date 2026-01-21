import type { MosaicNode, MosaicParent } from "react-mosaic-component";

export type VerticalZone = "top" | "bottom";
export type HorizontalSlot = "left" | "center" | "right";

type Slot = "left" | "center" | "right";
const SLOT_ORDER: Slot[] = ["left", "center", "right"];

/**
 * Insère un container dans la zone verticale cible.
 * - priorité HAUT / BAS
 * - ne touche pas à l’autre zone
 */
export function insertInVerticalZone(
  layout: MosaicParent<string>,
  zone: VerticalZone,
  newContainerId: string
): MosaicParent<string> {
  const targetKey = zone === "top" ? "first" : "second";
  const otherKey = zone === "top" ? "second" : "first";

  const target = layout[targetKey];

  // zone vide → insertion directe
  if (!target) {
    return {
      ...layout,
      [targetKey]: newContainerId,
    };
  }

  // zone déjà occupée → split horizontal local
  return {
    ...layout,
    [targetKey]: {
      direction: "row",
      first: target,
      second: newContainerId,
    },
    [otherKey]: layout[otherKey],
  };
}

export function splitLayoutAtPath(
  layout: MosaicNode<string> | null,
  targetId: string,
  newId: string,
  direction: "row" | "column",
  insert: "before" | "after"
): MosaicNode<string> {
  if (!layout) return layout;

  // remplace la 1ère occurrence de targetId dans l'arbre
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

export function ensureVerticalRootLayout(
  layout: MosaicNode<string> | null
): MosaicParent<string> {
  // layout vide → top vide, bottom vide
  if (!layout) {
    return {
      direction: "column",
      first: null,
      second: null,
    };
  }

  // déjà un split vertical → OK
  if (
    typeof layout !== "string" &&
    layout.direction === "column"
  ) {
    return layout;
  }

  // layout existant non vertical → on le met en TOP par défaut
  return {
    direction: "column",
    first: layout,
    second: null,
  };
}

export function insertInZoneAndSlot(
  root: MosaicParent<string>,
  zone: VerticalZone,
  slot: HorizontalSlot,
  newId: string,
  getSlotForId: (id: string) => HorizontalSlot | null
): MosaicParent<string> {
  const zoneKey = zone === "top" ? "first" : "second";
  const zoneNode = root[zoneKey];

  // zone vide
  if (!zoneNode) {
    return {
      ...root,
      [zoneKey]: newId,
    };
  }

  // collect existing ids in zone (in order)
  const collect = (node: MosaicNode<string>, acc: string[]) => {
    if (typeof node === "string") {
      acc.push(node);
    } else {
      collect(node.first, acc);
      collect(node.second, acc);
    }
  };

  const ids: string[] = [];
  collect(zoneNode, ids);

  // trouver ancre selon slot
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

  // pas d’ancre → append à droite
  if (!anchor) {
    return {
      ...root,
      [zoneKey]: {
        direction: "row",
        first: zoneNode,
        second: newId,
      },
    };
  }

  // insertion relative
  return {
    ...root,
    [zoneKey]: splitLayoutAtPath(
      zoneNode,
      anchor,
      newId,
      "row",
      "before"
    ),
  };
}
