import { login } from "../services/auth.service.js";

class LoginView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    const form = this.shadowRoot.getElementById("login-form");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = this.shadowRoot.getElementById("email").value.trim();
      const password = this.shadowRoot.getElementById("password").value.trim();

      if (!email || !password) {
        this.showError("Veuillez renseigner tous les champs");
        return;
      }

      this.setLoading(true);
      this.clearError();

      try {
        await login({ email, password });
        // 🔔 auth-changed est dispatché par auth.service.js
        // main.js prendra automatiquement le relais
      } catch (err) {
        console.error(err);
        this.showError("Identifiants invalides");
        this.setLoading(false);
      }
    });
  }

  setLoading(loading) {
    const btn = this.shadowRoot.getElementById("submit");
    btn.disabled = loading;
    btn.textContent = loading ? "Connexion..." : "Se connecter";
  }

  showError(msg) {
    this.shadowRoot.getElementById("error").textContent = msg;
  }

  clearError() {
    this.shadowRoot.getElementById("error").textContent = "";
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: system-ui, sans-serif;
          background: #0f172a;
          color: white;
        }

        .login {
          width: 320px;
          padding: 24px;
          border-radius: 8px;
          background: #020617;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }

        h1 {
          margin: 0 0 16px;
          font-size: 18px;
          text-align: center;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #334155;
          background: #020617;
          color: white;
        }

        button {
          padding: 8px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        button:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .error {
          font-size: 13px;
          color: #f87171;
          text-align: center;
          min-height: 16px;
        }
      </style>

      <div class="login">
        <h1>Trading SaaS</h1>

        <form id="login-form">
          <input
            id="email"
            type="text"
            placeholder="Email"
            autocomplete="email"
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
          />

          <button id="submit" type="submit">
            Se connecter
          </button>

          <div id="error" class="error"></div>
        </form>
      </div>
    `;
  }
}

customElements.define("login-view", LoginView);
