class StrategyList extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: system-ui, sans-serif;
          }
        </style>
  
        <div>
          <b>Strategies</b><br/>
          <em>(Web Component prêt)</em>
        </div>
      `;
    }
  }
  
  customElements.define("strategy-list", StrategyList);
  