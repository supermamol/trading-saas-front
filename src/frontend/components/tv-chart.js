class TvChart extends HTMLElement {
    connectedCallback() {
      // évite double init si GL remonte le DOM
      if (this.__inited) return;
      this.__inited = true;
  
      // container unique (important)
      this.__containerId = `tv_${Math.random().toString(36).slice(2)}`;
      this.style.display = "block";
      this.style.width = "100%";
      this.style.height = "100%";
  
      this.innerHTML = `<div id="${this.__containerId}" style="width:100%;height:100%"></div>`;
  
      const symbol = this.getAttribute("symbol") || "BINANCE:BTCUSDT";
      const interval = this.getAttribute("interval") || "60";
      const theme = document.body.classList.contains("theme-dark") ? "dark" : "light";
  
      if (!window.TradingView?.widget) {
        console.error("TradingView is not loaded (tv.js missing?)");
        return;
      }
  
      this.__widget = new window.TradingView.widget({
        container_id: this.__containerId,
        symbol,
        interval,
        autosize: true,
        theme,
        locale: "fr",
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: true,
      });
    }
  
    disconnectedCallback() {
      // GL 1.5 détruit/recrée parfois : on nettoie le DOM
      this.innerHTML = "";
      this.__widget = null;
      this.__inited = false;
    }
  }
  
  customElements.define("tv-chart", TvChart);
  