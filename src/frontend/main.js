// Styles globaux
import "./styles/theme.css";
import "./styles/toolbar.css";
import "./styles/theme.js";

// Web Components
import "./components/app-toolbar.js";
import "./components/strategy-list.js";

// Layout
import { createLayout } from "./layout/layout.js";

// Inject toolbar
document.body.appendChild(document.createElement("app-toolbar"));

// Start app
createLayout();
