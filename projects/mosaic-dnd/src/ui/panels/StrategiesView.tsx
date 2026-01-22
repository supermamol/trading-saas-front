// src/ui/panels/StrategiesView.tsx
import type { PanelKind } from "../../model/workspace.panels";
import type { CreateDirection } from "../TabView";

type Props = {
  createPanel: (
    kind: PanelKind,
    context?: any,
    direction?: CreateDirection
  ) => void;
};

export function StrategiesView({ createPanel }: Props) {
  return (
    <>
      <h3>Strategies</h3>

      {["S1", "S2", "S3"].map((id) => (
        <button
          key={id}
          onClick={() =>
            createPanel(
              "StrategyDetail",
              { strategyId: id },
              "right"
            )
          }
        >
          Strat {id}
        </button>
      ))}
    </>
  );
}
