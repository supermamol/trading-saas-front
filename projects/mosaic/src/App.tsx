import { useMemo, useState } from "react";
import { useEffect } from "react";

import { Mosaic, MosaicWindow } from "react-mosaic-component";
import type { MosaicNode } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import type { PanelGraph } from "./model/panelModel";
import { openPanel, detachPanel, attachPanel } from "./model/panelActions";

import { panelGraphToTiles } from "./layout/panelGraphToTiles";
import { tilesToMosaic } from "./layout/tilesToMosaic";
import type { TileId } from "./layout/tilesToMosaic";
import type { Tile } from "./layout/panelGraphToTiles";

/* -------------------------------------------------------
 * Helpers TileId (purs, ok hors App)
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
function collectIds(
  node: MosaicNode<TileId> | null,
  acc: Set<TileId>
) {
  if (!node) return;

  if (typeof node === "string") {
    acc.add(node);
    return;
  }

  collectIds(node.first, acc);
  collectIds(node.second, acc);
}
function insertRight(
  layout: MosaicNode<TileId>,
  id: TileId
): MosaicNode<TileId> {
  return {
    direction: "row",
    first: layout,
    second: id,
  };
}

/* -------------------------------------------------------
 * App
 * ----------------------------------------------------- */
export default function App() {
  const [graph, setGraph] = useState<PanelGraph>({ panels: {} });

  // pile d’activation par groupKind (dernier = actif)
  const [activeStacks, setActiveStacks] =
    useState<Record<string, string[]>>({});

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

  function activatePanel(groupKind: string, panelKey: string) {
    setActiveStacks((s) => ({
      ...s,
      [groupKind]: [
        ...(s[groupKind] ?? []).filter((k) => k !== panelKey),
        panelKey,
      ],
    }));
  }

  function removeFromStack(groupKind: string, panelKey: string) {
    setActiveStacks((s) => ({
      ...s,
      [groupKind]: (s[groupKind] ?? []).filter((k) => k !== panelKey),
    }));
  }

  function removeFromLayout(
    node: MosaicNode<TileId>,
    target: TileId
  ): MosaicNode<TileId> | null {

    console.log("removeFromLayout");

    if (node === target) return null;

    if (typeof node === "string") return node;

    const first = removeFromLayout(node.first, target);
    const second = removeFromLayout(node.second, target);

    if (!first) return second;
    if (!second) return first;

    return { ...node, first, second };
  }

  /* ------------------------------
   * Actions métier (POC)
   * ---------------------------- */
  function openStrategies() {
    setGraph((g) =>
      openPanel(g, {
        panelKey: "strategies",
        kind: "strategies",
      })
    );
  }

  function openStrategyDetail(strategyId: string) {
    const panelKey = `strategyDetail:${strategyId}`;

    setGraph((g) =>
      openPanel(g, {
        panelKey,
        kind: "strategyDetail",
        strategyId,
      })
    );

    activatePanel("strategyDetail", panelKey);
  }

  function openChart(strategyId: string, nb: number) {
    setGraph((g) =>
      openPanel(g, {
        panelKey: `chart:${strategyId}:${nb}`,
        kind: "chart",
        strategyId,
        instanceKey: String(nb),
      })
    );
  }

  function openRun(strategyId: string, nb: number) {
    setGraph((g) =>
      openPanel(g, {
        panelKey: `run:${strategyId}:${nb}`,
        kind: "run",
        strategyId,
        instanceKey: String(nb),
      })
    );
  }

  function openNodered(strategyId: string) {
    setGraph((g) =>
      openPanel(g, {
        panelKey: `nodered:${strategyId}`,
        kind: "nodered",
        strategyId,
      })
    );
  }

  function detachFromGroup(
    groupKind: string,
    panelKey: string
  ) {
    removeFromStack(groupKind, panelKey);
    setGraph((g) => detachPanel(g, panelKey));
  }

  // laissé en "any" car ton modèle exact de PanelKind/PanelNode n’est pas dans ce fichier
  function attachToGroup(
    groupKind: string,
    panelKey: string
  ) {
    setGraph((g) => attachPanel(g, panelKey, groupKind));
    activatePanel(groupKind, panelKey);
  }

  /* ------------------------------
   * Projection layout (tiles + layout)
   * ---------------------------- */
  const tiles = panelGraphToTiles(graph);
  const [layout, setLayout] = useState<MosaicNode<TileId> | null>(null);

  // Initialisation du layout
  useEffect(() => {
    if (layout === null && tiles.length > 0) {
      setLayout(tilesToMosaic(tiles));
    }
  }, [layout, tiles]);

  // SUPPRESSION des panels obsolètes 
  useEffect(() => {
    if (!layout) return;

    const layoutIds = new Set<TileId>();
    collectIds(layout, layoutIds);

    const expectedIds = new Set<TileId>(
      tiles.map((t) =>
        t.type === "group"
          ? (`group:${t.groupKind}` as TileId)
          : (`panel:${t.panelKey}` as TileId)
      )
    );

    const obsolete = [...layoutIds].filter(
      (id) => id.startsWith("panel:") && !expectedIds.has(id)
    );

    if (obsolete.length === 0) return;

    setLayout((l) =>
      l ? removeFromLayout(l, obsolete[0]) : l
    );
  }, [tiles, layout]);

  // AJOUT des ids manquants
  useEffect(() => {
    if (!layout) return;

    const layoutIds = new Set<TileId>();
    collectIds(layout, layoutIds);

    const tileIds = tiles.map((t) =>
      t.type === "group"
        ? (`group:${t.groupKind}` as TileId)
        : (`panel:${t.panelKey}` as TileId)
    );

    const missing = tileIds.filter(
      (id) => !layoutIds.has(id)
    );

    if (missing.length === 0) return;

    setLayout((l) =>
      l ? insertRight(l, missing[0]) : l
    );
  }, [tiles, layout]);

  // index pratique pour retrouver une tile group par kind
  const groupTileByKind = useMemo(() => {
    const map = new Map<string, Extract<Tile, { type: "group" }>>();
    for (const t of tiles) {
      if (t.type === "group") map.set(t.groupKind, t);
    }
    return map;
  }, [tiles]);

  /* ------------------------------
   * Render contenu métier d’un panel
   * ---------------------------- */
  function renderPanel(
    panelKey: string,
    options?: {
      isGrouped?: boolean;
      canDetach?: boolean;
    }
  ) {
    const isGrouped = options?.isGrouped === true;
    const canDetach = options?.canDetach === true;

    /* =========================
     * Strategies
     * ========================= */
    if (panelKey === "strategies") {
      return (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>
            Strategies
          </div>

          <button onClick={() => openStrategyDetail("S1")}>
            Open StrategyDetail S1
          </button>{" "}
          <button onClick={() => openStrategyDetail("S2")}>
            Open StrategyDetail S2
          </button>{" "}
          <button onClick={() => openStrategyDetail("S3")}>
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

      return (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>
            StrategyDetail {sid}
          </div>

          <button onClick={() => openChart(sid, 1)}>
            Open Chart {sid}:1
          </button>{" "}
          <button onClick={() => openChart(sid, 2)}>
            Open Chart {sid}:2
          </button>{" "}
          <button onClick={() => openRun(sid, 1)}>
            Open Run {sid}:1
          </button>{" "}
          <button onClick={() => openNodered(sid)}>
            Open Nodered {sid}
          </button>

          <div style={{ marginTop: 12 }}>
            {/* === RÈGLE 6.2 === */}
            {isGrouped ? (
              canDetach ? (
                <button
                  onClick={() =>
                    detachFromGroup("strategyDetail", panelKey)
                  }
                >
                  Detach this tab
                </button>
              ) : null
            ) : (
              <button
                onClick={() =>
                  attachToGroup("strategyDetail", panelKey)
                }
              >
                Attach to StrategyDetail
              </button>
            )}

          </div>
        </div>
      );
    }

    /* =========================
     * Autres panels (chart, run, nodered)
     * ========================= */
    return (
      <div>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>
          {panelKey}
        </div>

        {/* 6.2 : AUCUNE action Attach / Detach ici */}
      </div>
    );
  }
  /* ------------------------------
 * Tabs UI
 * ---------------------------- */
  function Tabs({ groupKind, panelKeys }: { groupKind: string; panelKeys: string[] }) {
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
        {panelKeys.map((key) => {
          const label = key.split(":").pop() ?? key;

          return (
            <button
              key={key}
              onClick={() => activatePanel(groupKind, key)}
              style={{
                fontWeight: key === active ? "bold" : "normal",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  /* ------------------------------
   * RenderTile Mosaic
   * ---------------------------- */
  function renderTile(id: TileId, path: any) {

    // GROUP => onglets visibles
    if (isGroupTile(id)) {
      const groupKind = groupKindFromId(id);
      const tile = groupTileByKind.get(groupKind);
      if (!tile) return null;

      const activePanelKey = getActivePanelKey(groupKind, tile.panelKeys);

      return (
        <MosaicWindow<TileId> path={path} title={titleForGroupKind(groupKind)} toolbarControls={[]}>
          <div style={{ padding: 8 }}>
            <Tabs groupKind={groupKind} panelKeys={tile.panelKeys} />
            {renderPanel(activePanelKey, {
              isGrouped: true,
              canDetach: tile.panelKeys.length > 1,
            })}
          </div>
        </MosaicWindow>
      );
    }

    // PANEL => contenu direct
    if (isPanelTile(id)) {
      const panelKey = panelKeyFromId(id);
      return (
        <MosaicWindow<TileId> path={path} title={panelKey} toolbarControls={[]}>
          <div style={{ padding: 8 }}>
            {renderPanel(panelKey, { isGrouped: false })}
          </div>
        </MosaicWindow>
      );
    }

    return null;
  }

  /* ------------------------------
   * UI always-visible (évite “No Windows Present” bloquant)
   * ---------------------------- */
  return (
    <div style={{ height: "100vh", width: "100vw", padding: 8 }}>
      {/* Bandeau toujours visible */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={openStrategies}>Open Strategies</button>
        <button style={{ marginLeft: 8 }} onClick={() => openStrategyDetail("S1")}>
          Open StrategyDetail S1
        </button>
        <button style={{ marginLeft: 8 }} onClick={() => openStrategyDetail("S2")}>
          Open StrategyDetail S2
        </button>
      </div>

      {/* Zone Mosaic */}
      <div style={{ height: "calc(100% - 40px)", width: "100%" }}>
        {layout ? (
          <Mosaic<TileId> value={layout} onChange={setLayout} renderTile={renderTile} />
        ) : (
          <div
            style={{
              height: "100%",
              border: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
              fontSize: 16,
            }}
          >
            Aucun panel ouvert — clique sur “Open Strategies”
          </div>
        )}
      </div>
    </div>
  );
}
