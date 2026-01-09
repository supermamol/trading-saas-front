import { createDatasource } from "../domain/datasource.js";
import { resolveDatasourceData } from "../domain/datasource-data.js";

const DATASOURCES = [
  createDatasource({
    id: "BTCUSDT",
    origin: "ticker",
    seriesType: "candlestick",
    color: "#f7931a",
  }),
  
  createDatasource({
    id: "BT-001",
    origin: "backtest",
    seriesType: "line",
    color: "#4caf50",
  }),
  
  createDatasource({
    id: "SIG-001",
    origin: "strategy",
    seriesType: "boolean",
    color: "#ff5252",
  }),
  
  createDatasource({
    id: "VOL-BTC",
    origin: "ticker",
    seriesType: "histogram",
    color: "#607d8b",
  }),
  ];

export function registerDatasourcesPanel(layout) {
  layout.registerComponent("Datasources", function (container) {
    const root = container.getElement()[0];
    root.style.padding = "10px";
    root.style.color = "#d1d4dc";

    // 🔑 UI générée depuis le modèle
    root.innerHTML = `
      <h3>Datasources</h3>
      ${DATASOURCES.map(
        ds => `
        <div class="ds" data-id="${ds.id}">
          ${ds.label} · ${ds.origin}
        </div>
      `
      ).join("")}
    `;

    root.querySelectorAll(".ds").forEach(el => {
      const ds = DATASOURCES.find(d => d.id === el.dataset.id);
      if (!ds) return;

      el.style.cursor = "pointer";
      el.style.padding = "6px";
      el.style.marginBottom = "6px";
      el.style.border = "1px solid #2b2b2b";
      el.style.borderRadius = "4px";

      el.setAttribute("draggable", "true");
      el.addEventListener("dragstart", e => {
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify(ds)
        );
      });

      el.addEventListener("click", () => {
        const chart = document.querySelector("lw-chart");
        if (!chart) return;

        chart.addDatasource(
          ds.id,
          resolveDatasourceData(ds),
          { type: ds.type, color: ds.color }
        );

      });
    });
  });
}

