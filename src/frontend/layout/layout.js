import $ from "jquery";
window.$ = window.jQuery = $;

import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-dark-theme.css";

const GLModule = await import("golden-layout");
const GoldenLayout = GLModule.default || GLModule;

// Panels
import { registerStrategiesPanel } from "../panels/strategies.panel.js";
import { registerStrategyDetailPanel } from "../panels/strategyDetail.panel.js";
import { registerNodeRedPanel } from "../panels/nodered.panel.js";
import { registerTVChartsPanel } from "../panels/tvcharts.panel.js";

export function createLayout() {
  const root = document.getElementById("layout");

  const layoutConfig = {
    content: [
      {
        type: "row",
        content: [
          {
            type: "component",
            componentName: "NodeRed",
            title: "Node‑RED",
            width: 50
          },
          {
            type: "column",
            width: 50,
            content: [
              {
                type: "component",
                componentName: "TVCharts",
                title: "TV Charts",
                height: 60
              },
              {
                type: "component",
                componentName: "Strategies",
                title: "Strategies",
                height: 40
              }
            ]
          }
        ]
      }
    ]
  };

  const layout = new GoldenLayout(layoutConfig, root);

  // Register panels
  registerNodeRedPanel(layout);
  registerTVChartsPanel(layout);
  registerStrategiesPanel(layout);
  registerStrategyDetailPanel(layout);

  layout.init();

  // expose pour debug / extensions futures
  window.__layout = layout;
}
