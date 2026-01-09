class StrategyList extends HTMLElement {
    constructor() {
        super();
        this._strategies = [];
    }

    connectedCallback() {
        this.render();
        this._loadStrategies();
    }

    async _loadStrategies() {
        // ⚠️ mock temporaire (à brancher sur API plus tard)
        this._strategies = [
            { id: "ARTG", name: "ARTG" },
            { id: "TSLA", name: "TSLA" },
            { id: "APPL", name: "APPL" },
        ];

        this.render();
    }

    render() {
        this.innerHTML = `
        <div class="strategy-list">
          <ul>
            ${this._strategies
                .map(
                    s => `
                <li data-id="${s.id}">
                  <span class="name">${s.name}</span>
                  <button class="open">🔍</button>
                </li>
              `
                )
                .join("")}
          </ul>
  
          <div class="new-strategy">
            <input type="text" placeholder="Nouvelle stratégie" />
            <button class="add">+</button>
          </div>
        </div>
      `;

        this._bindEvents();
    }

    _bindEvents() {
        this.querySelectorAll("li .open").forEach(btn => {
            btn.addEventListener("click", e => {
                const li = e.target.closest("li");
                const strategyId = li.dataset.id;

                this.dispatchEvent(
                    new CustomEvent("open-strategy-detail", {
                        bubbles: true,
                        detail: { strategyId },
                    })
                );
            });
        });

        const addBtn = this.querySelector(".add");
        const input = this.querySelector("input");

        if (addBtn && input) {
            addBtn.addEventListener("click", () => {
                const name = input.value.trim();
                if (!name) return;

                this._strategies.push({ id: name, name });
                input.value = "";
                this.render();
            });
        }
    }
}

customElements.define("strategy-list", StrategyList);
