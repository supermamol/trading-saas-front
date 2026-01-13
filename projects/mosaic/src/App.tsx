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

  // onglet actif par groupKind => panelKey
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  // helper UI (DOIT être dans App car lit activeTabs)
  function getActivePanelKey(groupKind: string, panelKeys: string[]) {
    return activeTabs[groupKind] ?? panelKeys[0];
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
    setGraph((g) =>
      openPanel(g, {
        panelKey: `strategyDetail:${strategyId}`,
        kind: "strategyDetail",
        strategyId,
      })
    );
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

  function detach(panelKey: string) {
    setGraph((g) => detachPanel(g, panelKey));
  }

  // laissé en "any" car ton modèle exact de PanelKind/PanelNode n’est pas dans ce fichier
  function attach(panelKey: string, kind: any) {
    setGraph((g) => attachPanel(g, panelKey, kind));
  }

  /* ------------------------------
   * Projection layout (tiles + layout)
   * ---------------------------- */
  const tiles = panelGraphToTiles(graph);
  const [layout, setLayout] = useState<MosaicNode<TileId> | null>(null);

  /* ------------------------------
   * 5.1 — Initialisation du layout (UNE FOIS)
   * ---------------------------- */
  useEffect(() => {
    if (layout === null && tiles.length > 0) {
      setLayout(tilesToMosaic(tiles));
    }
  }, [layout, tiles]);
  
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
  
    // on insère UN seul panel à la fois (simple)
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
  function renderPanel(panelKey: string) {
    if (panelKey === "strategies") {
      return (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Strategies</div>
          <button onClick={() => openStrategyDetail("S1")}>Open StrategyDetail S1</button>{" "}
          <button onClick={() => openStrategyDetail("S2")}>Open StrategyDetail S2</button>
        </div>
      );
    }

    if (panelKey.startsWith("strategyDetail:")) {
      const sid = panelKey.split(":")[1] ?? "S1";
      return (
        <div>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>StrategyDetail {sid}</div>

          <button onClick={() => openChart(sid, 1)}>Open Chart {sid}:1</button>{" "}
          <button onClick={() => openChart(sid, 2)}>Open Chart {sid}:2</button>{" "}
          <button onClick={() => openRun(sid, 1)}>Open Run {sid}:1</button>{" "}
          <button onClick={() => openNodered(sid)}>Open Nodered {sid}</button>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => detach(panelKey)}>Detach this tab</button>
          </div>
        </div>
      );
    }

    // défaut (chart/run/nodered etc.)
    return (
      <div>
        <div style={{ marginBottom: 8, fontWeight: 700 }}>{panelKey}</div>
        <button onClick={() => detach(panelKey)}>Detach</button>
        {/* l’attach UI viendra en 4.2 : choix du groupKind cible */}
        {/* <button onClick={() => attach(panelKey, "chart")}>Attach to chart</button> */}
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
              onClick={() =>
                setActiveTabs((t) => ({
                  ...t,
                  [groupKind]: key,
                }))
              }
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
            {renderPanel(activePanelKey)}
          </div>
        </MosaicWindow>
      );
    }

    // PANEL => contenu direct
    if (isPanelTile(id)) {
      const panelKey = panelKeyFromId(id);
      return (
        <MosaicWindow<TileId> path={path} title={panelKey} toolbarControls={[]}>
          <div style={{ padding: 8 }}>{renderPanel(panelKey)}</div>
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
