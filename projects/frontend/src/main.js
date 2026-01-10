// =========================
// Global styles
// =========================
import "./styles/theme.css";
import "./styles/toolbar.css";

// =========================
// Custom Elements registry
// (DOIT être importé avant tout usage)
// =========================
import "./components/custom-elements.js";

// =========================
// Theme logic
// =========================
import "./ui/theme.js";

// =========================
// Auth
// =========================
import {
  isAuthenticated,
  initAuth,
} from "./services/auth.service.js";

// =========================
// Views
// =========================
import "./views/login-view.js";

// =========================
// Components (non web-components)
// =========================
import "./components/app-toolbar.js";
import "./components/strategy-list.js";

// =========================
// Layout
// =========================
import { createLayout, destroyLayout } from "./layout/layout.js";

// =========================
// (Temp) Debug Lightweight Charts presence
// =========================
import { createChart } from "lightweight-charts";
console.log(
  "[LW] Lightweight Charts loaded:",
  typeof createChart === "function"
);

// =========================
// DOM state
// =========================
let toolbarEl = null;
let layoutStarted = false;

// =========================
// Bootstrap
// =========================
initAuth();
renderApp();

// =========================
// Main render logic (Auth Gate)
// =========================
function renderApp() {
  clearApp();

  if (isAuthenticated()) {
    startAuthenticatedApp();
  } else {
    showLogin();
  }
}

// =========================
// Non-authenticated state
// =========================
function showLogin() {
  const login = document.createElement("login-view");
  document.body.appendChild(login);
}

// =========================
// Authenticated state
// =========================
function startAuthenticatedApp() {
  mountToolbar();
  startLayout();
}

// =========================
// Toolbar
// =========================
function mountToolbar() {
  toolbarEl = document.createElement("app-toolbar");
  document.body.appendChild(toolbarEl);
}

// =========================
// GoldenLayout
// =========================
function startLayout() {
  if (layoutStarted) return;

  createLayout();
  layoutStarted = true;
}

function stopLayout() {
  if (!layoutStarted) return;

  destroyLayout();
  layoutStarted = false;
}

// =========================
// Cleanup
// =========================
function clearApp() {
  stopLayout();

  document.body.innerHTML = "";
  toolbarEl = null;
}

// =========================
// Global auth change handling
// =========================
document.addEventListener("auth-changed", () => {
  renderApp();
});
