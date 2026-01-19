import type { MosaicNode, MosaicParent } from "react-mosaic-component";

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
