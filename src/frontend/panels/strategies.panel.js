export function registerStrategiesPanel(layout) {
    layout.registerComponent("Strategies", function (container) {
      const el = document.createElement("strategy-list");
      el.style.padding = "10px";
      container.getElement().append(el);
    });
  }
  