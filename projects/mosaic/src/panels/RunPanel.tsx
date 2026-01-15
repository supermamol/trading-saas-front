export function RunPanel({
    strategyId,
    nb,
  }: {
    strategyId: string;
    nb: number;
  }) {
    return (
      <div>
        <h3>Run {nb}</h3>
        <div>Strategy: {strategyId}</div>
      </div>
    );
  }
  