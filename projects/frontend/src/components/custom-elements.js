import { LWChart } from "./lw-chart.js";

// Garde de sécurité (dev + HMR)
if (!customElements.get("lw-chart")) {
  customElements.define("lw-chart", LWChart);
}

