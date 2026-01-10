import { logout } from "../services/auth.service.js";

class AppToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.menuOpen = false;

    // bind pour removeEventListener propre si besoin plus tard
    this.onThemeChanged = this.onThemeChanged.bind(this);
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.syncThemeIcon();

    // 🔔 écouter les changements globaux de thème
    document.addEventListener("theme-changed", this.onThemeChanged);
  }

  disconnectedCallback() {
    document.removeEventListener("theme-changed", this.onThemeChanged);
  }

  onThemeChanged(e) {
    this.syncThemeIcon(e?.detail?.theme);
  }

  syncThemeIcon(forcedTheme) {
    const icon = this.shadowRoot.getElementById("theme-icon");
    if (!icon) return;

    const theme =
      forcedTheme ||
      (document.body.classList.contains("theme-dark") ? "dark" : "light");

    icon.textContent = theme === "dark" ? "🌙" : "🌞";
  }

  bindEvents() {
    const userBtn = this.shadowRoot.getElementById("user-btn");
    const logoutBtn = this.shadowRoot.getElementById("logout");
    const themeBtn = this.shadowRoot.getElementById("theme-toggle");

    userBtn.addEventListener("click", () => this.toggleMenu());

    logoutBtn.addEventListener("click", () => {
      logout();
    });

    themeBtn.addEventListener("click", () => {
      // ❗ le composant NE change PAS le thème lui-même
      document.dispatchEvent(new Event("toggle-theme"));
    });

    // fermer le menu si clic extérieur
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.updateMenu();
  }

  closeMenu() {
    this.menuOpen = false;
    this.updateMenu();
  }

  updateMenu() {
    const menu = this.shadowRoot.getElementById("user-menu");
    menu.style.display = this.menuOpen ? "block" : "none";
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 40px;
          background: var(--toolbar-bg, #020617);
          color: white;
          font-family: system-ui, sans-serif;
          border-bottom: 1px solid #1e293b;
        }

        .toolbar {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
        }

        .left,
        .right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 14px;
        }

        button:hover {
          opacity: 0.8;
        }

        .user {
          position: relative;
        }

        .menu {
          position: absolute;
          top: 36px;
          right: 0;
          min-width: 140px;
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 6px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          display: none;
          z-index: 1000;
        }

        .menu-item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
        }

        .menu-item:hover {
          filter: brightness(1.3);
        }

        .divider {
          height: 1px;
          background: #1e293b;
          margin: 4px 0;
        }
      </style>

      <div class="toolbar">
        <div class="left">
          <strong>Trading SaaS</strong>
        </div>

        <div class="right">
          <button id="theme-toggle" title="Toggle theme">
            <span id="theme-icon">🌙</span>
          </button>

          <div class="user">
            <button id="user-btn" title="User menu">👤</button>

            <div id="user-menu" class="menu">
              <div class="menu-item">Utilisateur connecté</div>
              <div class="divider"></div>
              <div id="logout" class="menu-item">Logout</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("app-toolbar", AppToolbar);
