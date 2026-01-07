import {
    getStrategies,
    addStrategy,
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
    }
  
    async load() {
      this.strategies = await getStrategies();
      this.renderList();
    }
  
    async onAdd() {
      const input = this.shadowRoot.getElementById("new-name");
      const name = input.value.trim();
      if (!name) return;
  
      await addStrategy(name);
      input.value = "";
      this.load();
    }
  
    async onDelete(id) {
        await deleteStrategy(id);
      
        // notifier le layout
        document.dispatchEvent(
          new CustomEvent("strategy-deleted", {
            detail: { strategyId: id }
          })
        );
      
        this.load();
      }
        
    onSelect(id) {
      // événement global → GoldenLayout écoutera
      document.dispatchEvent(
        new CustomEvent("open-strategy-detail", {
          detail: { strategyId: id }
        })
      );
    }
  
    renderList() {
      const list = this.shadowRoot.getElementById("list");
      list.innerHTML = "";
  
      this.strategies.forEach(s => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <span class="name">${s.name}</span>
          <div class="actions">
            <button class="open">↗</button>
            <button class="delete">🗑</button>
          </div>
        `;
  
        row.querySelector(".name").onclick = () => this.onSelect(s.id);
        row.querySelector(".open").onclick = () => this.onSelect(s.id);
        row.querySelector(".delete").onclick = () => this.onDelete(s.id);
  
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
          }
  
          .add {
            margin-top: 8px;
            display: flex;
            gap: 6px;
          }
  
          input {
            flex: 1;
          }
        </style>
  
        <div>
          <div id="list"></div>
  
          <div class="add">
            <input id="new-name" placeholder="Nouvelle stratégie" />
            <button id="add">➕</button>
          </div>
        </div>
      `;
  
      this.shadowRoot
        .getElementById("add")
        .onclick = () => this.onAdd();
    }
  }
  
  customElements.define("strategy-list", StrategyList);
  