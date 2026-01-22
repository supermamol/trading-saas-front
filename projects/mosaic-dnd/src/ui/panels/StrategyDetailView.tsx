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
                { zone: "top", slot: "center" }
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
                { zone: "top", slot: "right" }
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
              { zone: "top", slot: "left" }
            )
          }
        >
          Nodered
        </button>
      </>
    );
  }
  