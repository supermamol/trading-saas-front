// src/ui/TabView.tsx
import type { PanelKind, PanelContext } from "../model/workspace.panels";
import type { Tab } from "../model/tab";

import { StrategiesView } from "./panels/StrategiesView";
import { StrategyDetailView } from "./panels/StrategyDetailView";
import { ChartView } from "./panels/ChartView";
import { RunView } from "./panels/RunView";
import { NoderedView } from "./panels/NoderedView";

export type CreatePanelFn = (
  kind: PanelKind,
  context?: PanelContext,
  placement?: any
) => void;

type Props = {
  tab: Tab;
  createPanel: (
    kind: PanelKind,
    context?: PanelContext,
    placement?: { zone: VerticalZone; slot: HorizontalSlot }
  ) => void;
};


export function TabView({ tab, createPanel }: Props) {
  switch (tab.kind) {
    case "Strategies":
      return <StrategiesView createPanel={createPanel} />;

    case "StrategyDetail":
      return (
        <StrategyDetailView
          strategyId={tab.payload?.strategyId as string}
          createPanel={createPanel}
        />
      );

    case "Run":
      return <RunView />;

    case "Chart":
      return <ChartView />;

    case "Nodered":
      return <NoderedView />;

    default:
      return <pre>{tab.kind}</pre>;
  }
}