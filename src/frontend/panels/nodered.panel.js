export function registerNodeRedPanel(layout) {
    layout.registerComponent("NodeRed", function (container) {
      container.getElement().html(`
        <div style="padding:10px">
          <b>Node‑RED</b><br/>
          http://localhost:1880
        </div>
      `);
    });
  }
  