// src/ui/mosaicLayout.ts
import type { MosaicNode, MosaicParent } from "react-mosaic-component";

/* ======================================================
 * Types
 * ====================================================== */

export type CreateDirection = "top" | "bottom" | "left" | "right";
export type VerticalZone = "top" | "bottom";
export type HorizontalSlot = "left" | "center" | "right";

/* ======================================================
 * Helpers direction → Mosaic
 * ====================================================== */

export function directionToMosaic(
  direction: CreateDirection
): { axis: "row" | "column"; insert: "before" | "after" } {
  switch (direction) {
    case "left":
      return { axis: "row", insert: "before" };
    case "right":
      return { axis: "row", insert: "after" };
    case "top":
      return { axis: "column", insert: "before" };
    case "bottom":
      return { axis: "column", insert: "after" };
  }
}

/* ======================================================
 * Root layout helper (⬅️ CELUI QUI MANQUAIT)
 * ====================================================== */

/**
 * Garantit que le layout racine est un layout vertical (column).
 * - layout null      → column(null, null)
 * - layout string    → column(layout, null)
 * - layout column    → inchangé
 * - layout row       → enveloppé dans une column
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

  return {
    direction: "column",
    first: layout,
    second: null,
  };
}

/* ======================================================
 * Split bas niveau (autour d’un container précis)
 * ====================================================== */

/**
 * Split un layout Mosaic autour d’un container cible.
 * Si la cible n’existe PAS dans le layout → append à droite (safety net).
 */
export function splitLayoutAtPath(
  layout: MosaicNode<string> | null,
  targetId: string,
  newId: string,
  direction: "row" | "column",
  insert: "before" | "after"
): MosaicNode<string> {
  if (!layout) {
    return newId;
  }

  let found = false;

  const replace = (node: MosaicNode<string>): MosaicNode<string> => {
    if (node === targetId) {
      found = true;
      const first = insert === "before" ? newId : targetId;
      const second = insert === "before" ? targetId : newId;
      return { direction, first, second } as MosaicParent<string>;
    }

    if (typeof node === "string") {
      return node;
    }

    return {
      ...node,
      first: replace(node.first),
      second: replace(node.second),
    };
  };

  const next = replace(layout);

  // 🔐 SAFETY NET : cible absente → append à droite
  if (!found) {
    return {
      direction: "row",
      first: layout,
      second: newId,
    };
  }

  return next;
}

/* ======================================================
 * Insertion zonée (utilisée si TU le décides)
 * ====================================================== */

/**
 * Insère un container dans une zone verticale
 * et approximativement dans un slot horizontal.
 *
 * ⚠️ UI only — pas une règle métier.
 */
export function insertInZoneAndSlot(
  root: MosaicNode<string> | null,
  zone: VerticalZone,
  slot: HorizontalSlot,
  newId: string,
  getSlotForId: (id: string) => HorizontalSlot | null
): MosaicNode<string> {
  const verticalRoot = ensureVerticalRootLayout(root);
  const zoneKey = zone === "top" ? "first" : "second";
  const zoneNode = verticalRoot[zoneKey];

  if (!zoneNode) {
    return {
      ...verticalRoot,
      [zoneKey]: newId,
    };
  }

  const ids: string[] = [];
  const collect = (node: MosaicNode<string>) => {
    if (typeof node === "string") ids.push(node);
    else {
      collect(node.first);
      collect(node.second);
    }
  };
  collect(zoneNode);

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

  if (!anchor) {
    return {
      ...verticalRoot,
      [zoneKey]: {
        direction: "row",
        first: zoneNode,
        second: newId,
      },
    };
  }

  return {
    ...verticalRoot,
    [zoneKey]: splitLayoutAtPath(
      zoneNode,
      anchor,
      newId,
      "row",
      "before"
    ),
  };
}
