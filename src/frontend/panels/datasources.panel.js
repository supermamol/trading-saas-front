import { createDatasource } from "../domain/datasource.js";

/**
 * Datasources panel
 * - catalogue de datasources
 * - singleton UI
 * - bouton "New chart"
 * - Drag & Drop uniquement
 */

const DATASOURCES = [
  createDatasource({
    id: "BTCUSDT",
    label: "BTCUSDT · ticker",
    origin: "ticker",
    seriesType: "candlestick",
    color: "#f7931a",
  }),
  createDatasource({
    id: "BT-001",
    label: "BT-001 · backtest",
    origin: "backtest",
    seriesType: "line",
    color: "#4caf50",
  }),
  createDatasource({
    id: "SIG-001",
    label: "SIG-001 · strategy",
    origin: "strategy",
    seriesType: "boolean",
    color: "#ff5252",
  }),
  createDatasource({
    id: "VOL-BTC",
    label: "VOL-BTC · ticker",
    origin: "ticker",
    seriesType: "histogram",
    color: "#2196f3",
  }),
];

let initialized = false;

export function registerDatasourcesPanel(layout) {
  // 🔒 Singleton Datasources panel
  if (initialized) return;
  initialized = true;

  layout.registerComponent("Datasources", function (container) {
    const root = container.getElement()[0];

    root.style.padding = "10px";
    root.style.color = "#d1d4dc";
    root.style.fontSize = "13px";

    root.innerHTML = `
      <h3 style="margin-top:0;">Datasources</h3>
      <button id="new-chart-btn">➕ New chart</button>
      <div id="datasource-list" style="margin-top:10px;"></div>
    `;

    /* ======================
     * New chart button
     * ====================== */

    const btn = root.querySelector("#new-chart-btn");
    btn.style.display = "inline-block";
    btn.style.padding = "4px 8px";
    btn.style.marginBottom = "10px";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", () => {
      const stacks = layout.root.getItemsByType("stack");
      if (!stacks.length) return;
    
      const stack = stacks[0];
      const parent = stack.parent;
    
      // 1️⃣ ajouter le chart
      parent.addChild({
        type: "component",
        componentName: "LWChart",
        title: `Chart ${Date.now().toString().slice(-4)}`,
      });
    
      // 2️⃣ activer le DERNIER item du stack (le nouveau)
      requestAnimationFrame(() => {
        const targetStack = layout.root.getItemsByType("stack")[0];
        const items = targetStack.getActiveContentItem
          ? targetStack.contentItems
          : [];
    
        const lastItem = items[items.length - 1];
        if (lastItem && targetStack.setActiveContentItem) {
          targetStack.setActiveContentItem(lastItem);
        }
      });
    });
        
    /* ======================
     * Datasource list
     * ====================== */

    const list = root.querySelector("#datasource-list");

    DATASOURCES.forEach(ds => {
      const el = document.createElement("div");
      el.textContent = ds.label;

      el.style.cursor = "grab";
      el.style.padding = "6px";
      el.style.marginBottom = "6px";
      el.style.border = "1px solid #2b2b2b";
      el.style.borderRadius = "4px";
      el.style.userSelect = "none";

      el.setAttribute("draggable", "true");

      el.addEventListener("dragstart", e => {
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify(ds)
        );
      });

      list.appendChild(el);
    });
  });
}
