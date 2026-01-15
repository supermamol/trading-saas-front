import type { Tile } from "./panelGraphToTiles";

export type Direction = "left" | "right" | "top" | "bottom";

export type Placement =
  | {
      kind: "tab";
      groupKind: string;
    }
  | {
      kind: "split";
      anchorPanelKey: string;
      direction: Direction;
    };

function defaultDirectionForPanel(kind: string): Direction {
  switch (kind) {
    case "strategyDetail":
      return "right";
    case "nodered":
      return "top";
    case "chart":
      return "bottom";
    case "run":
      return "right";
    default:
      return "right";
  }
}

export function placeNewPanel(args: {
  anchorPanelKey: string | null;
  newPanel: { panelKey: string; kind: string };
  tiles: Tile[];
}): Placement {
  const { anchorPanelKey, newPanel, tiles } = args;

  // 1️⃣ Si un groupe du même type existe déjà → ONGLET
  const hasGroup = tiles.some(
    (t) => t.type === "group" && t.groupKind === newPanel.kind
  );

  if (hasGroup) {
    return {
      kind: "tab",
      groupKind: newPanel.kind,
    };
  }

  // 2️⃣ Sinon → split par rapport à l’ancre
  if (anchorPanelKey) {
    return {
      kind: "split",
      anchorPanelKey,
      direction: defaultDirectionForPanel(newPanel.kind),
    };
  }

  // 3️⃣ Fallback ultime
  return {
    kind: "split",
    anchorPanelKey: "strategies",
    direction: defaultDirectionForPanel(newPanel.kind),
  };
}
