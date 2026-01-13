import { useState } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import type { MosaicNode } from "react-mosaic-component";

import "react-mosaic-component/react-mosaic-component.css";

import { createPanelGraph, openPanel } from "./model/panelGraph";
import type { PanelGraph } from "./model/panelGraph";

import { panelGraphToMosaic } from "./layout/panelGraphToMosaic";

type TileId = string;

export default function App() {
  const [graph, setGraph] = useState<PanelGraph>(() => {
    let g = createPanelGraph();
    g = openPanel(g, { panelKey: "strategies", kind: "strategies" });
    return g;
  });

  const layout: MosaicNode<TileId> | null = panelGraphToMosaic(graph);

  /**
   * Helpers métier simulés (POC)
   * Ces fonctions seront déplacées plus tard
   * dans une vraie API métier (Itération 3+)
   */
  function selectStrategy(strategyId: string) {
    setGraph((g) => {
      let next = g;

      next = openPanel(next, {
        panelKey: `nodered:${strategyId}`,
        kind: "nodered",
        strategyId,
      });

      next = openPanel(next, {
        panelKey: `strategyDetail:${strategyId}`,
        kind: "strategyDetail",
        strategyId,
      });

      return next;
    });
  }

  function openChart(strategyId: string) {
    setGraph((g) =>
      openPanel(g, {
        panelKey: `chart:${strategyId}:1`,
        kind: "chart",
        strategyId,
      })
    );
  }

  function openRun(strategyId: string) {
    setGraph((g) =>
      openPanel(g, {
        panelKey: `run:${strategyId}:1`,
        kind: "run",
        strategyId,
      })
    );
  }

  /**
   * Rendu d’un panel (stub volontaire)
   */
  function renderPanel(panelKey: string) {
    
    if (panelKey === "strategies") {
      return (
        <div>
          <h3>Choose a strategy</h3>
          <button onClick={() => selectStrategy("S1")}>
            Select strategy S1
          </button>
        </div>
      );
    }

    if (panelKey.startsWith("strategyDetail")) {
      return (
        <div>
          <h3>Strategy Detail</h3>
          <button onClick={() => openChart("S1")}>
            Open Chart
          </button>
          <button onClick={() => openRun("S1")}>
            Open Run
          </button>
        </div>
      );
    }

    if (panelKey.startsWith("nodered")) {
      return <h3>Nodered</h3>;
    }

    if (panelKey.startsWith("chart")) {
      return <h3>Chart</h3>;
    }

    if (panelKey.startsWith("run")) {
      return <h3>Run</h3>;
    }

    return <div>{panelKey}</div>;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Mosaic<TileId>
        value={layout}
        onChange={() => { }}
        renderTile={(id, path) => (
          <MosaicWindow<TileId> 
          title={id}
          path={path} toolbarControls={[]}>
            <div style={{ padding: 10 }}>
              {renderPanel(id)}
            </div>
          </MosaicWindow>
        )}
      />
    </div>
  );

}
