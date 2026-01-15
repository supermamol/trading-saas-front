import "react-mosaic-component/react-mosaic-component.css";
import { useMemo, useState } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import type { MosaicNode } from "react-mosaic-component";

import type { PanelGraph } from "../model/panelModel";
import { detachPanel, attachPanel } from "../model/panelActions";

import { panelGraphToTiles } from "./panelGraphToTiles";
import type { Tile } from "./panelGraphToTiles";
import type { TileId } from "./tilesToMosaic";
import { buildBusinessLayout } from "./buildBusinessLayout";

import { StrategyDetailPanel } from "../panels/StrategyDetailPanel";
import { AttachDetachActions } from "../panels/AttachDetachActions";

/* -------------------------------------------------------
 * Helpers TileId
 * ----------------------------------------------------- */
function isGroupTile(id: TileId): id is `group:${string}` {
  return id.startsWith("group:");
}
function isPanelTile(id: TileId): id is `panel:${string}` {
  return id.startsWith("panel:");
}
function groupKindFromId(id: `group:${string}`) {
  return id.slice("group:".length);
}
function panelKeyFromId(id: `panel:${string}`) {
  return id.slice("panel:".length);
}
function titleForGroupKind(kind: string) {
  switch (kind) {
    case "strategyDetail":
      return "Strategy details";
    case "chart":
      return "Charts";
    case "run":
      return "Runs";
    case "nodered":
      return "Node-RED";
    default:
      return kind;
  }
}

/* -------------------------------------------------------
 * Props
 * ----------------------------------------------------- */
export interface MosaicWorkspaceProps {
  graph: PanelGraph;
  setGraph: React.Dispatch<React.SetStateAction<PanelGraph>>;

  onOpenStrategyDetail: (strategyId: string) => void;
  onOpenChart: (strategyId: string, nb: number) => void;
  onOpenRun: (strategyId: string, nb: number) => void;
  onOpenNodered: (strategyId: string) => void;
}

/* -------------------------------------------------------
 * MosaicWorkspace (UNCONTROLLED)
 * ----------------------------------------------------- */
export function MosaicWorkspace({
  graph,
  setGraph,
  onOpenStrategyDetail,
  onOpenChart,
  onOpenRun,
  onOpenNodered,
}: MosaicWorkspaceProps) {
  /* ------------------------------
   * Onglets / focus
   * ---------------------------- */
  const [activeStacks, setActiveStacks] = useState<Record<string, string[]>>(
    {}
  );

  function activatePanel(groupKind: string, panelKey: string) {
    setActiveStacks((s) => ({
      ...s,
      [groupKind]: [
        ...(s[groupKind] ?? []).filter((k) => k !== panelKey),
        panelKey, // dernier = actif
      ],
    }));
  }

  function getActivePanelKey(groupKind: string, panelKeys: string[]) {
    const stack = activeStacks[groupKind];
    if (stack && stack.length > 0) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const key = stack[i];
        if (panelKeys.includes(key)) return key;
      }
    }
    return panelKeys[0];
  }

  function removeFromStack(groupKind: string, panelKey: string) {
    setActiveStacks((s) => ({
      ...s,
      [groupKind]: (s[groupKind] ?? []).filter((k) => k !== panelKey),
    }));
  }

  /* ------------------------------
   * Tiles + layout INITIAL
   * ---------------------------- */
  const tiles = useMemo(() => panelGraphToTiles(graph), [graph]);

  /**
   * 🔥 Clé Mosaic
   * - change => remount complet
   * - utilisé pour attach / detach / reset
   */
  const [mosaicKey, setMosaicKey] = useState(0);

  const groupTileByKind = useMemo(() => {
    const map = new Map<string, Extract<Tile, { type: "group" }>>();
    for (const t of tiles) {
      if (t.type === "group") map.set(t.groupKind, t);
    }
    return map;
  }, [tiles]);

  const [floatingPanels, setFloatingPanels] = useState<string[]>([]);


  /* ------------------------------
   * Actions attach / detach
   * ---------------------------- */
  function detachFromGroup(groupKind: string, panelKey: string) {
    removeFromStack(groupKind, panelKey);
    setGraph((g) => detachPanel(g, panelKey));
  
    setFloatingPanels((p) =>
      p.includes(panelKey) ? p : [...p, panelKey]
    );
  
    // remount Mosaic
    setMosaicKey((k) => k + 1);
  }
  
  function attachToGroup(groupKind: string, panelKey: string) {
    setGraph((g) => attachPanel(g, panelKey, groupKind));
    activatePanel(groupKind, panelKey);
  
    setFloatingPanels((p) => p.filter((k) => k !== panelKey));
  
    setMosaicKey((k) => k + 1);
  }

  function groupKindFromPanelKey(panelKey: string): string | null {
    if (panelKey === "strategies") return "strategies";
    const idx = panelKey.indexOf(":");
    if (idx === -1) return null;
    return panelKey.slice(0, idx);
  }

  /* ------------------------------
   * Tabs UI
   * ---------------------------- */
  function Tabs({
    groupKind,
    panelKeys,
  }: {
    groupKind: string;
    panelKeys: string[];
  }) {
    const active = getActivePanelKey(groupKind, panelKeys);

    return (
      <div
        style={{
          display: "flex",
          gap: 6,
          borderBottom: "1px solid #ccc",
          marginBottom: 8,
          paddingBottom: 4,
          flexWrap: "wrap",
        }}
      >
        {panelKeys.map((key) => (
          <button
            key={key}
            onClick={() => activatePanel(groupKind, key)}
            style={{ fontWeight: key === active ? "bold" : "normal" }}
          >
            {key.split(":").pop() ?? key}
          </button>
        ))}
      </div>
    );
  }

  /* ------------------------------
   * Render contenu d’un panel
   * ---------------------------- */
  function renderPanel(
    panelKey: string,
    options?: { isGrouped?: boolean; canDetach?: boolean }
  ) {
    const isGrouped = options?.isGrouped === true;
    const canDetach = options?.canDetach === true;
    const groupKind = groupKindFromPanelKey(panelKey);

    // Strategies (racine)
    if (panelKey === "strategies") {
      return (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>
            Strategies
          </div>

          <button onClick={() => onOpenStrategyDetail("S1")}>
            Open StrategyDetail S1
          </button>{" "}
          <button onClick={() => onOpenStrategyDetail("S2")}>
            Open StrategyDetail S2
          </button>{" "}
          <button onClick={() => onOpenStrategyDetail("S3")}>
            Open StrategyDetail S3
          </button>
        </div>
      );
    }

    // StrategyDetail
    if (panelKey.startsWith("strategyDetail:")) {
      const sid = panelKey.split(":")[1];
      const gk = groupKind!;

      return (
        <StrategyDetailPanel
          sid={sid}
          onOpenChart={(nb) => onOpenChart(sid, nb)}
          onOpenRun={(nb) => onOpenRun(sid, nb)}
          onOpenNodered={() => onOpenNodered(sid)}
        >
          <AttachDetachActions
            groupKind={gk}
            isGrouped={isGrouped}
            canDetach={canDetach}
            onAttach={() => attachToGroup(gk, panelKey)}
            onDetach={() => detachFromGroup(gk, panelKey)}
          />
        </StrategyDetailPanel>
      );
    }

    // Fallback
    const isAttachable = groupKind !== null && panelKey !== "strategies";

    return (
      <div>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>
          {panelKey}
        </div>

        {isAttachable && (
          <AttachDetachActions
            groupKind={groupKind!}
            isGrouped={isGrouped}
            canDetach={canDetach}
            onAttach={() => attachToGroup(groupKind!, panelKey)}
            onDetach={() => detachFromGroup(groupKind!, panelKey)}
          />
        )}
      </div>
    );
  }

  /* ------------------------------
   * renderTile Mosaic
   * ---------------------------- */
  function renderTile(id: TileId, path: any) {
    if (isGroupTile(id)) {
      const groupKind = groupKindFromId(id);
      const tile = groupTileByKind.get(groupKind);
      if (!tile) return null;

      const activePanelKey = getActivePanelKey(
        groupKind,
        tile.panelKeys
      );

      return (
        <MosaicWindow<TileId>
          path={path}
          title={titleForGroupKind(groupKind)}
          toolbarControls={[]}
        >
          <div style={{ padding: 8 }}>
            <Tabs
              groupKind={groupKind}
              panelKeys={tile.panelKeys}
            />
            {renderPanel(activePanelKey, {
              isGrouped: true,
              canDetach: tile.panelKeys.length > 1,
            })}
          </div>
        </MosaicWindow>
      );
    }

    if (isPanelTile(id)) {
      const panelKey = panelKeyFromId(id);
      return (
        <MosaicWindow<TileId>
          path={path}
          title={panelKey}
          toolbarControls={[]}
        >
          <div style={{ padding: 8 }}>
            {renderPanel(panelKey)}
          </div>
        </MosaicWindow>
      );
    }

    return null;
  }

  /* ------------------------------
   * Render final
   * ---------------------------- */
  const baseLayout = buildBusinessLayout(tiles);

  function stackRight(
    layout: MosaicNode<TileId>,
    panelKey: string
  ): MosaicNode<TileId> {
    return {
      direction: "row",
      first: layout,
      second: `panel:${panelKey}`,
    };
  }
  
  const layout =
    baseLayout && floatingPanels.length > 0
      ? floatingPanels.reduce(
          (acc, key) => stackRight(acc, key),
          baseLayout
        )
      : baseLayout;
  
  if (!layout) {
    return (
      <div
        style={{
          height: "100%",
          border: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#777",
        }}
      >
        Aucun panel ouvert
      </div>
    );
  }
  
  return (
    <Mosaic<TileId>
      key={mosaicKey}
      initialValue={layout}
      renderTile={renderTile}
    />
  );  

}
