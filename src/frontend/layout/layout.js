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
//import { registerTVChartsPanel } from "../panels/tvcharts.panel.js";
import { registerLWChartPanel } from "../panels/lwchart.panel.js";
import { registerDatasourcesPanel } from "../panels/datasources.panel.js";

function openStrategyDetail(layout, strategyId) {
    const id = "strategy-detail::" + strategyId;

    const existing = layout.root.getItemsById(id)[0];
    if (existing) {
        existing.parent.setActiveContentItem(existing);
        return;
    }

    layout.root.contentItems[0].addChild({
        type: "component",
        componentName: "StrategyDetail",
        componentState: { strategyId },
        title: "Strategy · " + strategyId,
        id
    });
}

function closeStrategyDetail(layout, strategyId) {
    const id = "strategy-detail::" + strategyId;

    const items = layout.root.getItemsById(id);
    items.forEach(item => {
        item.remove();
    });
}


export function createLayout() {
    const root = document.getElementById("layout");

    const layoutConfig = {
        content: [
          {
            type: "row",
            content: [
              {
                type: "column",
                width: 250,
                content: [
                  {
                    type: "component",
                    componentName: "NodeRed",
                    title: "Node‑RED",
                    width: 50,
                  }
                ],
              },
              {
                type: "column",
                content: [
                  {
                    type: "component",
                    componentName: "Strategies",
                    title: "Strategies",
                    height: 40,
                  },
                  {
                    type: "component",
                    componentName: "Datasources",
                    title: "Datasources",
                    width: 220
                  }
                ],
              },
            ],
          },
        ],
      };
      
    const layout = new GoldenLayout(layoutConfig, root);

    // Register panels
    registerNodeRedPanel(layout);
    //registerTVChartsPanel(layout);
    registerStrategiesPanel(layout);
    registerStrategyDetailPanel(layout);
    registerLWChartPanel(layout);
    registerDatasourcesPanel(layout);

    layout.init();

    // écoute des events venant des Web Components
    document.addEventListener("open-strategy-detail", e => {
        const { strategyId } = e.detail;
        openStrategyDetail(layout, strategyId);
    });

    document.addEventListener("strategy-deleted", e => {
        const { strategyId } = e.detail;
        closeStrategyDetail(layout, strategyId);
    });

    // expose pour debug / extensions futures
    window.__layout = layout;
}

export function destroyLayout() {
    if (window.__layout) {
        window.__layout.destroy();
        window.__layout = null;
    }
}
