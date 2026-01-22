// src/ui/panels/StrategyDetailView.tsx
import type { PanelKind } from "../../model/workspace.panels";
import type { CreateDirection } from "../TabView";

type Props = {
  strategyId: string;
  createPanel: (
    kind: PanelKind,
    context?: any,
    direction?: CreateDirection
  ) => void;
};

export function StrategyDetailView({
  strategyId,
  createPanel,
}: Props) {
  return (
    <>
      <h3>StrategyDetail {strategyId}</h3>

      <h4>Charts</h4>
      {["C1", "C2", "C3"].map((c) => (
        <button
          key={c}
          onClick={() =>
            createPanel(
              "Chart",
              { strategyId, chartId: c },
              "top"
            )
          }
        >
          Chart {c}
        </button>
      ))}

      <h4>Runs</h4>
      {["R1", "R2", "R3"].map((r) => (
        <button
          key={r}
          onClick={() =>
            createPanel(
              "Run",
              { strategyId, runId: r },
              "right"
            )
          }
        >
          Run {r}
        </button>
      ))}

      <button
        onClick={() =>
          createPanel(
            "Nodered",
            { strategyId },
            "top"
          )
        }
      >
        Nodered
      </button>
    </>
  );
}
