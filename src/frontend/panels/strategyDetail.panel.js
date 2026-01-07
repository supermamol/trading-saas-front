export function registerStrategyDetailPanel(layout) {
    layout.registerComponent("StrategyDetail", function (container, state) {
      container.setTitle("Strategy: " + state.strategyId);
      container.getElement().html(`
        <div style="padding:10px">
          <b>Strategy Detail</b><br/>
          ${state.strategyId}
        </div>
      `);
    });
  }
  