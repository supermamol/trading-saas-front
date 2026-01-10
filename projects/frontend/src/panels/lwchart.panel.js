import { resolveDatasourceData } from "../domain/datasource-data.js";

export function registerLWChartPanel(layout) {
  layout.registerComponent("LWChart", function (container) {
    const root = container.getElement()[0];

    const getPanelState = () => (container.getState?.() || {});
    const setPanelState = (next) => container.setState?.(next);

    // Init state
    const state = getPanelState();
    if (!Array.isArray(state.datasources)) {
      state.datasources = [];
      setPanelState(state);
    }

    // DOM
    root.innerHTML = "";
    const chart = document.createElement("lw-chart");
    chart.style.width = "100%";
    chart.style.height = "100%";
    root.appendChild(chart);

    // Restore (rebuild from DESCRIPTORS)
    const restore = () => {
      const st = getPanelState();
      const dsList = Array.isArray(st.datasources) ? st.datasources : [];

      dsList.forEach((ds) => {
        chart.addDatasource(
          ds.id,
          resolveDatasourceData(ds),
          { seriesType: ds.seriesType, color: ds.color }
        );
      });
    };

    // Wait for custom element + its internal chart init
    customElements.whenDefined("lw-chart").then(() => {
      // lw-chart initChart is requestAnimationFrame -> wait one frame
      requestAnimationFrame(restore);
    });

    // Persist add (DESCRIPTORS ONLY)
    chart.addEventListener("datasource-added", (e) => {
      const ds = e.detail; // { id, origin, seriesType, color } (no data)
      const cur = getPanelState();
      cur.datasources = Array.isArray(cur.datasources) ? cur.datasources : [];

      if (cur.datasources.some((d) => d.id === ds.id)) return;

      cur.datasources.push({
        id: ds.id,
        origin: ds.origin,
        seriesType: ds.seriesType,
        color: ds.color,
      });

      setPanelState(cur);
    });

    // Persist remove
    chart.addEventListener("datasource-removed", (e) => {
      const { id } = e.detail;
      const cur = getPanelState();
      cur.datasources = Array.isArray(cur.datasources) ? cur.datasources : [];
      cur.datasources = cur.datasources.filter((d) => d.id !== id);
      setPanelState(cur);
    });
  });
}
