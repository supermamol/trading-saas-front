export function registerLWChartPanel(layout) {
    layout.registerComponent("LWChart", function (container) {
      const root = container.getElement()[0];
      root.style.height = "100%";
      root.style.width = "100%";
  
      const chart = document.createElement("lw-chart");
      chart.style.width = "100%";
      chart.style.height = "100%";
  
      root.appendChild(chart);
    });
  }
  