// =========================
// Imports
// =========================

// Styles globaux
import "./styles/theme.css";
import "./styles/toolbar.css";

// Auth
import {
  isAuthenticated,
  initAuth,
} from "./services/auth.service.js";

// Views
import "./views/login-view.js";

// Components
import "./components/app-toolbar.js";
import "./components/strategy-list.js";

// Layout
import { createLayout, destroyLayout } from "./layout/layout.js";


// =========================
// DOM roots
// =========================

let toolbarEl = null;
let layoutStarted = false;


// =========================
// Bootstrap
// =========================

initAuth();          // initialise auth (token, listeners éventuels)
renderApp();         // point d’entrée unique


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
