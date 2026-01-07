export function registerTVChartsPanel(layout) {
    layout.registerComponent("TVCharts", function (container) {
      container.getElement().html(`
        <div style="padding:10px">
          <b>TV Charts</b>
        </div>
      `);
    });
  }
  