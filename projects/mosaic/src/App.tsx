import { useState } from "react";

import type { PanelGraph } from "./model/panelModel";
import { openPanel } from "./model/panelActions";

import { MosaicWorkspace } from "./layout/MosaicWorkspace";

export default function App() {
  const [graph, setGraph] = useState<PanelGraph>({ panels: {} });

  function openStrategies() {
    setGraph((g) =>
      openPanel(g, { panelKey: "strategies", kind: "strategies" })
    );
  }

  function openStrategyDetail(strategyId: string) {
    const panelKey = `strategyDetail:${strategyId}`;
    setGraph((g) =>
      openPanel(g, { panelKey, kind: "strategyDetail", strategyId })
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

  return (
    <div style={{ height: "100vh", width: "100vw", padding: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={openStrategies}>Open Strategies</button>
      </div>

      <div style={{ height: "calc(100% - 40px)", width: "100%" }}>
        <MosaicWorkspace
          graph={graph}
          setGraph={setGraph}
          onOpenStrategyDetail={openStrategyDetail}
          onOpenChart={openChart}
          onOpenRun={openRun}
          onOpenNodered={openNodered}
        />
      </div>
    </div>
  );
}
