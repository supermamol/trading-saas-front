export function ChartPanel({
    strategyId,
    nb,
  }: {
    strategyId: string;
    nb: number;
  }) {
    return (
      <div>
        <h3>Chart {nb}</h3>
        <div>Strategy: {strategyId}</div>
      </div>
    );
  }
  