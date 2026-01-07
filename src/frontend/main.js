/*************************
 * jQuery GLOBAL (GL v1)
 *************************/
 import $ from "jquery";
 window.$ = window.jQuery = $;
 
 /*************************
  * GoldenLayout CSS
  *************************/
 import "golden-layout/src/css/goldenlayout-base.css";
 import "golden-layout/src/css/goldenlayout-dark-theme.css";
 
 /*************************
  * Theme CSS (inline)
  *************************/
 const style = document.createElement("style");
 style.textContent = `
 /* ===== THEME DARK ===== */
 body.theme-dark .lm_root {
   background: #1e1e1e;
 }
 body.theme-dark .lm_content {
   background: #1f2428;
   color: #e6e6e6;
 }
 body.theme-dark .lm_tabs {
   background: #252a2f;
 }
 body.theme-dark .lm_tab {
   background: #2b3036;
   color: #bfc7cf;
 }
 body.theme-dark .lm_tab.lm_active {
   background: #323842;
   color: #ffffff;
 }
 body.theme-dark .lm_splitter {
   background: #3a3f45;
 }
 
 /* ===== THEME LIGHT ===== */
 body.theme-light .lm_root {
   background: #f3f4f6;
 }
 body.theme-light .lm_content {
   background: #ffffff;
   color: #111827;
 }
 body.theme-light .lm_tabs {
   background: #e5e7eb;
 }
 body.theme-light .lm_tab {
   background: #d1d5db;
   color: #1f2937;
 }
 body.theme-light .lm_tab.lm_active {
   background: #ffffff;
   color: #000000;
   font-weight: 600;
 }
 body.theme-light .lm_splitter {
   background: #cbd5e1;
 }
 
 /* ===== BUTTONS ===== */
 button {
   background: #3b82f6;
   border: none;
   border-radius: 6px;
   color: white;
   padding: 6px 10px;
   font-size: 13px;
   cursor: pointer;
 }
 button:hover {
   background: #2563eb;
 }
 
 /* ===== THEME TOGGLE BUTTON ===== */
 #theme-toggle {
    position: fixed;
    top: 26px;      /* ↓ descend un peu */
    right: 18px;    /* ← décale à gauche */
    z-index: 9999;
    background: #111827;
    color: white;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 14px;
  }
   body.theme-light #theme-toggle {
   background: #e5e7eb;
   color: #111827;
 }
 `;
 document.head.appendChild(style);
 
 /*************************
  * Theme logic
  *************************/
 const savedTheme = localStorage.getItem("theme") || "dark";
 document.body.classList.add(`theme-${savedTheme}`);
 
 const toggleBtn = document.createElement("button");
 toggleBtn.id = "theme-toggle";
 toggleBtn.textContent = savedTheme === "dark" ? "🌙 Dark" : "☀️ Light";
 toggleBtn.onclick = () => {
   const isDark = document.body.classList.contains("theme-dark");
   document.body.classList.toggle("theme-dark", !isDark);
   document.body.classList.toggle("theme-light", isDark);
   const newTheme = isDark ? "light" : "dark";
   localStorage.setItem("theme", newTheme);
   toggleBtn.textContent = newTheme === "dark" ? "🌙 Dark" : "☀️ Light";
 };
 document.body.appendChild(toggleBtn);
 
 /*************************
  * GoldenLayout import
  *************************/
 const GLModule = await import("golden-layout");
 const GoldenLayout = GLModule.default || GLModule;
 
 /*************************
  * ROOT
  *************************/
 const root = document.getElementById("layout");
 
 /*************************
  * LAYOUT
  *************************/
 const layoutConfig = {
   content: [
     {
       type: "row",
       content: [
         {
           type: "component",
           componentName: "NodeRed",
           title: "Node‑RED",
           width: 50
         },
         {
           type: "column",
           width: 50,
           content: [
             {
               type: "component",
               componentName: "TVCharts",
               title: "TV Charts",
               height: 60
             },
             {
               type: "component",
               componentName: "Strategies",
               title: "Strategies",
               height: 40
             }
           ]
         }
       ]
     }
   ]
 };
 
 const myLayout = new GoldenLayout(layoutConfig, root);
 
 /*************************
  * COMPONENTS (GL v1)
  *************************/
 myLayout.registerComponent("NodeRed", function (container) {
   container.getElement().html(`
     <div style="padding:10px">
       <b>Node‑RED</b><br/>
       http://localhost:1880
     </div>
   `);
 });
 
 myLayout.registerComponent("TVCharts", function (container) {
   container.getElement().html(`
     <div style="padding:10px">
       <b>TV Charts</b>
     </div>
   `);
 });
 
 myLayout.registerComponent("Strategies", function (container) {
   const el = document.createElement("div");
   el.style.padding = "10px";
   el.innerHTML = "<b>Strategies</b><br/><br/>";
 
   ["Alpha", "Breakout", "Momentum", "VWAP"].forEach(function (name) {
     const btn = document.createElement("button");
     btn.textContent = name;
     btn.style.display = "block";
     btn.style.marginBottom = "6px";
     btn.onclick = function () {
       openStrategyDetail(name);
     };
     el.appendChild(btn);
   });
 
   container.getElement().append(el);
 });
 
 myLayout.registerComponent("StrategyDetail", function (container, state) {
   container.setTitle("Strategy: " + state.strategyId);
   container.getElement().html(`
     <div style="padding:10px">
       <b>Strategy Detail</b><br/>
       ${state.strategyId}
     </div>
   `);
 });
 
 /*************************
  * OPEN DETAIL PANELS
  *************************/
 function openStrategyDetail(strategyId) {
   const id = "strategy-detail::" + strategyId;
 
   const existing = myLayout.root.getItemsById(id)[0];
   if (existing) {
     existing.parent.setActiveContentItem(existing);
     return;
   }
 
   myLayout.root.contentItems[0].addChild({
     type: "component",
     componentName: "StrategyDetail",
     componentState: { strategyId },
     title: "Strategy: " + strategyId,
     id: id
   });
 }
 
 /*************************
  * START
  *************************/
 myLayout.init();
 