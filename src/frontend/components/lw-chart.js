import {
    createChart,
    LineSeries,
    HistogramSeries,
    CandlestickSeries,
  } from "lightweight-charts";
  
  import { resolveDatasourceData } from "../domain/datasource-data.js";
  
  /**
   * <lw-chart>
   *
   * Renderer pur de Datasources
   * - ne connaît pas l'origine
   * - ne génère pas de données
   * - rend selon seriesType
   */
  export class LWChart extends HTMLElement {
    constructor() {
      super();
  
      this._chart = null;
      this._seriesMap = new Map(); // id -> ISeries
      this._resizeObserver = null;
    }
  
    /* ======================
     * Lifecycle
     * ====================== */
  
    connectedCallback() {
      this.style.display = "block";
      this.style.width = "100%";
      this.style.height = "100%";
  
      requestAnimationFrame(() => {
        this._initChart();
        this._initResizeObserver();
      });
  
      // Drag & Drop (DROP ONLY)
      this.addEventListener("dragover", e => e.preventDefault());
  
      this.addEventListener("drop", e => {
        e.preventDefault();
  
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
  
        const ds = JSON.parse(raw);
  
        this.addDatasource(
          ds.id,
          resolveDatasourceData(ds),
          {
            seriesType: ds.seriesType,
            color: ds.color,
          }
        );
      });
    }
  
    disconnectedCallback() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
  
      if (this._chart) {
        this._chart.remove();
        this._chart = null;
      }
  
      this._seriesMap.clear();
    }
  
    /* ======================
     * PUBLIC API
     * ====================== */
  
    addDatasource(id, data, options) {
      if (!this._chart) return;
      if (this._seriesMap.has(id)) return;
  
      const series = this._createSeries(options);
      series.setData(data);
  
      this._seriesMap.set(id, series);
  
      this.dispatchEvent(
        new CustomEvent("datasource-added", {
          detail: { id },
          bubbles: true,
        })
      );
    }
  
    removeDatasource(id) {
      const series = this._seriesMap.get(id);
      if (!series) return;
  
      this._chart.removeSeries(series);
      this._seriesMap.delete(id);
  
      this.dispatchEvent(
        new CustomEvent("datasource-removed", {
          detail: { id },
          bubbles: true,
        })
      );
    }
  
    clear() {
      for (const id of this._seriesMap.keys()) {
        this.removeDatasource(id);
      }
    }
  
    /* ======================
     * Internals
     * ====================== */
  
    _createSeries({ seriesType, color }) {
      switch (seriesType) {
        case "candlestick":
          return this._chart.addSeries(CandlestickSeries, {
            upColor: color,
            downColor: color,
            wickUpColor: color,
            wickDownColor: color,
            borderVisible: false,
          });
  
        case "histogram":
          return this._chart.addSeries(HistogramSeries, {
            color,
            priceFormat: { type: "volume" },
            priceScaleId: "",
          });
  
        case "boolean":
          return this._chart.addSeries(LineSeries, {
            color,
            lineWidth: 1,
            lineStyle: 2, // dashed
          });
  
        case "line":
        default:
          return this._chart.addSeries(LineSeries, {
            color,
            lineWidth: 2,
          });
      }
    }
  
    _initChart() {
      const rect = this.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(() => this._initChart());
        return;
      }
  
      this._chart = createChart(this, {
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        layout: {
          background: { color: "#1e1e1e" },
          textColor: "#d1d4dc",
        },
        grid: {
          vertLines: { color: "#2b2b2b" },
          horzLines: { color: "#2b2b2b" },
        },
        timeScale: {
          timeVisible: true,
        },
        rightPriceScale: {
          borderColor: "#2b2b2b",
        },
      });
    }
  
    _initResizeObserver() {
      this._resizeObserver = new ResizeObserver(entries => {
        if (!this._chart) return;
  
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          this._chart.applyOptions({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      });
  
      this._resizeObserver.observe(this);
    }
  }
  
  /* ======================
   * Custom Element define
   * ====================== */
  
  if (!customElements.get("lw-chart")) {
    customElements.define("lw-chart", LWChart);
  }
  