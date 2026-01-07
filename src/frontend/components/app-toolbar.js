class AppToolbar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
  
    connectedCallback() {
      this.render();
      this.bindEvents();
    }
  
    bindEvents() {
      this.shadowRoot
        .getElementById("toggle-theme")
        .addEventListener("click", () => {
          document.dispatchEvent(new CustomEvent("toggle-theme"));
        });
  
      // stubs (pour plus tard)
      this.shadowRoot
        .getElementById("save-layout")
        .addEventListener("click", () => {
          console.log("💾 save-layout (stub)");
        });
  
      this.shadowRoot
        .getElementById("reset-layout")
        .addEventListener("click", () => {
          console.log("🔄 reset-layout (stub)");
        });
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 42px;
            padding: 0 12px;
          }
  
          .left {
            font-weight: 600;
            font-size: 13px;
            opacity: 0.85;
          }
  
          .right {
            display: flex;
            gap: 8px;
          }
  
          button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            color: inherit;
          }
  
          button:hover {
            opacity: 0.8;
          }
        </style>
  
        <div class="toolbar">
          <div class="left">Trading SaaS</div>
          <div class="right">
            <button id="toggle-theme" title="Toggle theme">🌗</button>
            <button id="save-layout" title="Save layout">💾</button>
            <button id="reset-layout" title="Reset layout">🔄</button>
            <button title="Settings">⚙️</button>
            <button title="User">👤</button>
          </div>
        </div>
      `;
    }
  }
  
  customElements.define("app-toolbar", AppToolbar);
  