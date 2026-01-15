import "react-mosaic-component/react-mosaic-component.css";
import { useMemo, useRef, useState } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import type { MosaicNode } from "react-mosaic-component";

import type { PanelGraph } from "../model/panelModel";
import { detachPanel as detachPanelFromGraph, attachPanel as attachPanelToGraph } from "../model/panelActions";

import type { Tile } from "./panelGraphToTiles";
import { panelGraphToTiles } from "./panelGraphToTiles";
import type { TileId } from "./tilesToMosaic";
import { buildBusinessLayout } from "./buildBusinessLayout";

import { StrategyDetailPanel } from "../panels/StrategyDetailPanel";
import { AttachDetachActions } from "../panels/AttachDetachActions";

/* -------------------------------------------------------
 * TileId helpers
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
 * Layout helpers
 * ----------------------------------------------------- */
function removeFromLayout(
  node: MosaicNode<TileId> | null,
  id: TileId
): MosaicNode<TileId> | null {
  if (!node) return null;
  if (node === id) return null;
  if (typeof node === "string") return node;

  const first = removeFromLayout(node.first, id);
  const second = removeFromLayout(node.second, id);

  if (!first) return second;
  if (!second) return first;

  return { ...node, first, second };
}

function layoutContainsId(
  node: MosaicNode<TileId> | null,
  id: TileId
): boolean {
  if (!node) return false;
  if (node === id) return true;
  if (typeof node === "string") return false;
  return layoutContainsId(node.first, id) || layoutContainsId(node.second, id);
}

/* -------------------------------------------------------
 * Props
 * ----------------------------------------------------- */
interface MosaicWorkspaceProps {
  graph: PanelGraph;
  setGraph: React.Dispatch<React.SetStateAction<PanelGraph>>;

  onOpenStrategyDetail: (strategyId: string) => void;
  onOpenChart: (strategyId: string, nb: number) => void;
  onOpenRun: (strategyId: string, nb: number) => void;
  onOpenNodered: (strategyId: string) => void;
}

/* -------------------------------------------------------
 * MosaicWorkspace (layout utilisateur souverain)
 * - Mosaic uncontrolled
 * - Layout stocké en ref
 * - On ne modifie le layout que sur apparition d’un NOUVEAU GROUPE
 * ----------------------------------------------------- */
export function MosaicWorkspace({
  graph,
  setGraph,
  onOpenStrategyDetail,
  onOpenChart,
  onOpenRun,
  onOpenNodered,
}: MosaicWorkspaceProps) {
  const tiles = useMemo<Tile[]>(() => panelGraphToTiles(graph), [graph]);

  // Map des groupes (groupKind -> tile group)
  const groupTileByKind = useMemo(() => {
    const map = new Map<string, Extract<Tile, { type: "group" }>>();
    for (const t of tiles) if (t.type === "group") map.set(t.groupKind, t);
    return map;
  }, [tiles]);

  // Tabs / focus par groupe
  const [activeStacks, setActiveStacks] = useState<Record<string, string[]>>(
    {}
  );

  function activatePanel(groupKind: string, panelKey: string) {
    setActiveStacks((s) => ({
      ...s,
      [groupKind]: [
        ...(s[groupKind] ?? []).filter((k) => k !== panelKey),
        panelKey,
      ],
    }));
  }

  function getActivePanelKey(groupKind: string, panelKeys: string[]) {
    const stack = activeStacks[groupKind];
    if (stack && stack.length) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const k = stack[i];
        if (panelKeys.includes(k)) return k;
      }
    }
    return panelKeys[0];
  }

  // Layout impératif (hors state)
  const layoutRef = useRef<MosaicNode<TileId> | null>(null);
  const [, forceRender] = useState(0);

  // Init layout UNE FOIS quand le 1er panel existe
  if (!layoutRef.current && tiles.length > 0) {
    layoutRef.current = buildBusinessLayout(tiles);
  }

  // Insère un GROUPE à droite de la racine (une seule fois)
  function ensureGroupVisibleRightOfRoot(groupKind: string) {
    if (!layoutRef.current) return;
    const groupId = `group:${groupKind}` as TileId;
    if (layoutContainsId(layoutRef.current, groupId)) return;

    layoutRef.current = {
      direction: "row",
      first: layoutRef.current,
      second: groupId,
    };
    forceRender((x) => x + 1);
  }

  /* -------------------------------------------------------
   * Attach / Detach (METIER + LAYOUT)
   * ----------------------------------------------------- */
  function detachPanelUI(panelKey: string, groupKind: string) {
    // 1) METIER : sortir du groupe (donc plus d’onglet)
    setGraph((g) => detachPanelFromGraph(g, panelKey));

    // 2) LAYOUT : ajouter comme panel isolé
    if (!layoutRef.current) return;
    const panelId = `panel:${panelKey}` as TileId;

    if (!layoutContainsId(layoutRef.current, panelId)) {
      layoutRef.current = {
        direction: "row",
        first: layoutRef.current,
        second: panelId,
      };
    }

    forceRender((x) => x + 1);
  }

  function attachPanelUI(panelKey: string, groupKind: string) {
    // 1) METIER : rattacher au groupe (donc onglet)
    setGraph((g) => attachPanelToGraph(g, panelKey, groupKind));

    // 2) LAYOUT : enlever la fenêtre isolée
    if (!layoutRef.current) return;
    const panelId = `panel:${panelKey}` as TileId;

    layoutRef.current = removeFromLayout(layoutRef.current, panelId);
    forceRender((x) => x + 1);
  }

  /* ------------------------------
   * UI: Tabs
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
   * Render contenu panel
   * ---------------------------- */
  function renderPanel(panelKey: string, options?: { isGrouped?: boolean }) {
    const tileContextIsGrouped = options?.isGrouped === true;

    /* =========================
     * Strategies (racine)
     * ========================= */
    if (panelKey === "strategies") {
      return (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Strategies</div>

          <button
            onClick={() => {
              const sid = "S1";
              const pk = `strategyDetail:${sid}`;
              onOpenStrategyDetail(sid);

              ensureGroupVisibleRightOfRoot("strategyDetail");
              activatePanel("strategyDetail", pk);
            }}
          >
            Open StrategyDetail S1
          </button>{" "}
          <button
            onClick={() => {
              const sid = "S2";
              const pk = `strategyDetail:${sid}`;
              onOpenStrategyDetail(sid);

              ensureGroupVisibleRightOfRoot("strategyDetail");
              activatePanel("strategyDetail", pk);
            }}
          >
            Open StrategyDetail S2
          </button>{" "}
          <button
            onClick={() => {
              const sid = "S3";
              const pk = `strategyDetail:${sid}`;
              onOpenStrategyDetail(sid);

              ensureGroupVisibleRightOfRoot("strategyDetail");
              activatePanel("strategyDetail", pk);
            }}
          >
            Open StrategyDetail S3
          </button>
        </div>
      );
    }

    /* =========================
     * StrategyDetail
     * ========================= */
    if (panelKey.startsWith("strategyDetail:")) {
      const sid = panelKey.split(":")[1];
      const groupKind = "strategyDetail";

      const groupTile = groupTileByKind.get(groupKind);
      const inGroup = groupTile?.panelKeys.includes(panelKey) ?? false;
      const groupSize = groupTile?.panelKeys.length ?? 0;

      // Règle: un groupe avec 1 seul panel => pas détachable
      const canDetach = tileContextIsGrouped && inGroup && groupSize > 1;

      return (
        <div>
          {/* Onglet dans un groupe: Detach seulement si groupSize > 1
              Panel détaché: bouton Attach */}
          {inGroup ? (
            canDetach ? (
              <AttachDetachActions
                isGrouped={true}
                onDetach={() => detachPanelUI(panelKey, groupKind)}
                onAttach={() => attachPanelUI(panelKey, groupKind)}
              />
            ) : null
          ) : (
            <AttachDetachActions
              isGrouped={false}
              onDetach={() => detachPanelUI(panelKey, groupKind)}
              onAttach={() => attachPanelUI(panelKey, groupKind)}
            />
          )}

          <StrategyDetailPanel
            sid={sid}
            onOpenChart={(nb) => onOpenChart(sid, nb)}
            onOpenRun={(nb) => onOpenRun(sid, nb)}
            onOpenNodered={() => onOpenNodered(sid)}
          />
        </div>
      );
    }

    /* =========================
     * Fallback
     * ========================= */
    return <div>{panelKey}</div>;
  }

  /* ------------------------------
   * renderTile Mosaic
   * ---------------------------- */
  function renderTile(id: TileId, path: any) {
    if (isGroupTile(id)) {
      const groupKind = groupKindFromId(id);
      const tile = groupTileByKind.get(groupKind);
      if (!tile) return null;

      const activePanelKey = getActivePanelKey(groupKind, tile.panelKeys);

      return (
        <MosaicWindow<TileId>
          path={path}
          title={titleForGroupKind(groupKind)}
          toolbarControls={[]}
        >
          <div style={{ padding: 8 }}>
            <Tabs groupKind={groupKind} panelKeys={tile.panelKeys} />
            {renderPanel(activePanelKey, { isGrouped: true })}
          </div>
        </MosaicWindow>
      );
    }

    if (isPanelTile(id)) {
      const panelKey = panelKeyFromId(id);
      return (
        <MosaicWindow<TileId> path={path} title={panelKey} toolbarControls={[]}>
          <div style={{ padding: 8 }}>{renderPanel(panelKey, { isGrouped: false })}</div>
        </MosaicWindow>
      );
    }

    return null;
  }

  /* ------------------------------
   * Empty state
   * ---------------------------- */
  if (!layoutRef.current) {
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
        Aucun panel ouvert — clique sur “Open Strategies”
      </div>
    );
  }

  /* ------------------------------
   * Mosaic uncontrolled
   * ---------------------------- */
  return <Mosaic<TileId> initialValue={layoutRef.current} renderTile={renderTile} />;
}
