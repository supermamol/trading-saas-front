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
                { zone: "top", slot: "right" }
              )
            }
          >
            Strat {id}
          </button>
        ))}
      </>
    );
  }
  