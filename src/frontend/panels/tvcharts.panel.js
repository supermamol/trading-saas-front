
  export function registerTVChartsPanel(layout) {
    layout.registerComponent("TVCharts", function (container, state) {
      const el = document.createElement("tv-chart");
      el.setAttribute("symbol", state?.symbol || "BINANCE:BTCUSDT");
      el.style.width = "100%";
      el.style.height = "100%";
  
      container.getElement().css({ width: "100%", height: "100%", padding: 0 });
      container.getElement().append(el);
    });
  }
  