export function RunView() {
    return (
      <>
        <h3>Paramètres du Run</h3>
        {[
          "Ticker 1",
          "Ticker 2",
          "Backtest 1",
          "Backtest 2",
          "Backtest 3",
        ].map((b) => (
          <button key={b}>{b}</button>
        ))}
      </>
    );
  }
  