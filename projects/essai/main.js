/* =========================================================
 Imports CSS
 ========================================================= */
 import './style.css';
 import '@genesis-community/golden-layout/dist/css/goldenlayout-base.css';
 import '@genesis-community/golden-layout/dist/css/themes/goldenlayout-light-theme.css';
 
 /* =========================================================
  Imports JS
  ========================================================= */
 import { GoldenLayout } from '@genesis-community/golden-layout';
 import { createLayoutAPI } from './api/layout-api';
 
 /* =========================================================
  Boot Étape 1
  ========================================================= */
 
 const host = document.getElementById('layout');
 const gl = new GoldenLayout(host);
 
 /* ---------------------------------------------------------
  Register components (stubs)
  --------------------------------------------------------- */
 
 // Strategies
 gl.registerComponent("strategies:main", (container) => {
   const el = document.createElement("div");
   el.style.padding = "10px";
 
   const title = document.createElement("h3");
   title.textContent = "STRATEGIES (stub)";
 
   const btn = document.createElement("button");
   btn.textContent = "Open S1";
   btn.style.marginTop = "10px";
 
   btn.onclick = () => {
     // 👉 CLIC STRATÉGIE S1
     layoutApi.openRight(
       "strategies",
       "strategyDetail:S1:main",
       { ifExists: "focus" }
     );
 
     layoutApi.openTop(
       { panelOf: "strategyDetail:S1:main" },
       "nodered:S1:main",
       { ifExists: "focus" }
     );
   };
 
   el.appendChild(title);
   el.appendChild(btn);
   container.element.appendChild(el);
 });
 
 // StrategyDetail S1
 gl.registerComponent("strategyDetail:S1:main", (container) => {
   const el = document.createElement("div");
   el.textContent = "STRATEGY DETAIL S1 (stub)";
   el.style.padding = "10px";
   el.style.background = "#eef";
   container.element.appendChild(el);
 });
 
 // NodeRed S1
 gl.registerComponent("nodered:S1:main", (container) => {
   const el = document.createElement("div");
   el.textContent = "NODERED S1 (stub)";
   el.style.padding = "10px";
   el.style.background = "#efe";
   container.element.appendChild(el);
 });
 
 /* ---------------------------------------------------------
  Init GL
  --------------------------------------------------------- */
 
 gl.init();
 
 /* ---------------------------------------------------------
  Étape 0 : layout initial (Strategies seul)
  --------------------------------------------------------- */
 
 gl.loadLayout({
   root: {
     type: "stack",
     content: [
       {
         type: "component",
         componentType: "strategies:main",
         title: "Strategies"
       }
     ]
   }
 });
 
 /* ---------------------------------------------------------
  API métier
  --------------------------------------------------------- */
 
 const layoutApi = createLayoutAPI(gl);
 
 // Debug
 window.gl = gl;
 window.layoutApi = layoutApi;
 