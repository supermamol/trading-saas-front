import React from "react";

type Props = {
  sid: string;
  children?: React.ReactNode;
  onOpenChart: (nb: number) => void;
  onOpenRun: (nb: number) => void;
  onOpenNodered: () => void;
};

export function StrategyDetailPanel({
  sid,
  onOpenChart,
  onOpenRun,
  onOpenNodered,
  children,
}: Props) {
    console.log("StrategyDetailPanel");
  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>
        StrategyDetail {sid}
      </div>

      <button onClick={() => onOpenChart(1)}>
        Open Chart {sid}:1
      </button>{" "}
      <button onClick={() => onOpenChart(2)}>
        Open Chart {sid}:2
      </button>{" "}
      <button onClick={() => onOpenRun(1)}>
        Open Run {sid}:1
      </button>{" "}
      <button onClick={onOpenNodered}>
        Open Nodered {sid}
      </button>

      {children}
    </div>
  );
}
