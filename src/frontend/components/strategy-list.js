import {
    getStrategies,
    createStrategy,
    deleteStrategy
  } from "../services/strategies.api.js";
  
  class StrategyList extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.strategies = [];
    }
  
    connectedCallback() {
      this.render();
      this.load();
  
      // Invalidation générique backend-safe
      document.addEventListener("entity-changed", e => {
        if (e.detail?.type === "strategy") {
          this.load();
        }
      });
    }
  
    /* =========================
       READ
    ========================= */
  
    async load() {
      try {
        this.clearError();
        this.strategies = await getStrategies();
        this.renderList();
      } catch (err) {
        console.error(err);
        this.showError("Impossible de charger les stratégies");
      }
    }
  
    /* =========================
       CREATE
    ========================= */
  
    async onCreate() {
      const input = this.shadowRoot.getElementById("new-name");
      const name = input.value.trim();
      if (!name) return;
  
      try {
        await createStrategy(name);
        input.value = "";
  
        // Invalidation globale (backend = source de vérité)
        document.dispatchEvent(
          new CustomEvent("entity-changed", {
            detail: { type: "strategy" }
          })
        );
      } catch (err) {
        console.error(err);
        this.showError("Erreur lors de la création de la stratégie");
      }
    }
  
    /* =========================
       DELETE
    ========================= */
  
    async onDelete(id) {
      if (!confirm("Supprimer cette stratégie ?")) return;
  
      try {
        await deleteStrategy(id);
  
        // Invalidation globale
        document.dispatchEvent(
          new CustomEvent("entity-changed", {
            detail: { type: "strategy", id }
          })
        );
      } catch (err) {
        console.error(err);
        this.showError("Erreur lors de la suppression");
      }
    }
  
    /* =========================
       SELECT (open detail)
    ========================= */
  
    onSelect(id) {
      document.dispatchEvent(
        new CustomEvent("open-strategy-detail", {
          detail: { strategyId: id }
        })
      );
    }
  
    /* =========================
       RENDER
    ========================= */
  
    renderList() {
      const list = this.shadowRoot.getElementById("list");
      list.innerHTML = "";
  
      if (!this.strategies.length) {
        list.innerHTML = `<em>Aucune stratégie</em>`;
        return;
      }
  
      this.strategies.forEach(strategy => {
        const row = document.createElement("div");
        row.className = "row";
  
        row.innerHTML = `
          <span class="name">${strategy.name}</span>
          <div class="actions">
            <button class="open" title="Ouvrir">↗</button>
            <button class="delete" title="Supprimer">🗑</button>
          </div>
        `;
  
        row.querySelector(".name").onclick = () =>
          this.onSelect(strategy.id);
  
        row.querySelector(".open").onclick = () =>
          this.onSelect(strategy.id);
  
        row.querySelector(".delete").onclick = () =>
          this.onDelete(strategy.id);
  
        list.appendChild(row);
      });
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: system-ui, sans-serif;
          }
  
          .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
  
          .name {
            cursor: pointer;
          }
  
          .actions button {
            margin-left: 6px;
            background: none;
            border: none;
            cursor: pointer;
          }
  
          .add {
            margin-top: 8px;
            display: flex;
            gap: 6px;
          }
  
          input {
            flex: 1;
          }
  
          .error {
            color: #ef4444;
            margin-top: 6px;
            font-size: 12px;
          }
        </style>
  
        <div>
          <div id="list"></div>
  
          <div class="add">
            <input id="new-name" placeholder="Nouvelle stratégie" />
            <button id="add">➕</button>
          </div>
  
          <div id="error" class="error"></div>
        </div>
      `;
  
      this.shadowRoot
        .getElementById("add")
        .onclick = () => this.onCreate();
    }
  
    /* =========================
       ERRORS
    ========================= */
  
    showError(msg) {
      this.shadowRoot.getElementById("error").textContent = msg;
    }
  
    clearError() {
      this.shadowRoot.getElementById("error").textContent = "";
    }
  }
  
  customElements.define("strategy-list", StrategyList);
  