// src/model/panelModel.ts

export type PanelKind =
  | "strategies"
  | "strategyDetail"
  | "chart"
  | "run"
  | "nodered";

export type PanelContainer =
  | { mode: "grouped"; groupKind: PanelKind }
  | { mode: "floating" };

export type PanelNode = {
  panelKey: string;
  kind: PanelKind;
  strategyId?: string;
  instanceKey?: string;
  container: PanelContainer;
};

export type PanelGraph = {
  panels: Record<string, PanelNode>;
};

export function isGroupable(kind: PanelKind): boolean {
  return kind !== "strategies";
}

export function canGroup(
  panelKind: PanelKind,
  groupKind: PanelKind
): boolean {
  return panelKind === groupKind;
}

export function validatePanelGraph(_: PanelGraph): void {
  // no-op pour l’instant
}
