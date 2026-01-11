import './style.css';
import '@genesis-community/golden-layout/dist/css/goldenlayout-base.css';
import '@genesis-community/golden-layout/dist/css/themes/goldenlayout-light-theme.css';

import { GoldenLayout } from '@genesis-community/golden-layout';

const rootEl = document.getElementById('layout-root');
const STORAGE_KEY = 'workspace-test-v1';

/* ======================================================
   1) EXTRACTION LAYOUT ABSTRAIT
====================================================== */
function extractAbstractLayout(item) {
  if (!item) throw new Error('extractAbstractLayout: null');

  switch (item.type) {
    case 'stack':
      return {
        kind: 'stack',
        panels: item.contentItems
          .filter(ci => ci.type === 'component')
          .map(ci => {
            const id = ci.container.state.id;
            if (!id) throw new Error('panel without id');
            return id;
          })
      };

    case 'row':
    case 'column':
      return {
        kind: item.type,
        children: item.contentItems.map(extractAbstractLayout)
      };

    case 'component':
      return {
        kind: 'stack',
        panels: [item.container.state.id]
      };

    default:
      throw new Error('unsupported item type');
  }
}

/* ======================================================
   2) BUILD CONFIG GL DEPUIS SNAPSHOT
====================================================== */
function buildLayoutConfig(snapshot, panelsById) {
  switch (snapshot.kind) {
    case 'stack':
      return {
        type: 'stack',
        content: snapshot.panels.map(id => {
          const panel = panelsById[id];
          if (!panel) throw new Error(`unknown panel ${id}`);

          return {
            type: 'component',
            componentType: panel.type,
            title: panel.type,
            componentState: {
              id: panel.id,
              businessState: panel.state
            }
          };
        })
      };

    case 'row':
    case 'column':
      return {
        type: snapshot.kind,
        content: snapshot.children.map(c =>
          buildLayoutConfig(c, panelsById)
        )
      };

    default:
      throw new Error('unsupported snapshot kind');
  }
}

/* ======================================================
   3) COLLECTE DES PANELS (JSON SAFE)
====================================================== */
function collectPanels(item, acc = []) {
  if (!item) return acc;

  if (item.type === 'component') {
    const { id, businessState } = item.container.state;
    acc.push({
      id,
      type: item.componentType,
      state: businessState ?? {}
    });
  }

  if (item.contentItems) {
    item.contentItems.forEach(child => collectPanels(child, acc));
  }

  return acc;
}

/* ======================================================
   4) CREATE LAYOUT
====================================================== */
function createLayout(config) {
  const gl = new GoldenLayout(
    { settings: { showPopoutIcon: false }, ...config },
    rootEl
  );

  /* ---- Component A ---- */
  gl.registerComponentFactoryFunction('A', container => {
    container.element.innerHTML = `
      <div style="padding:10px">
        <h3>Component A</h3>
        <p>id: ${container.state.id}</p>
      </div>
    `;
  });

  /* ---- Component B ---- */
  gl.registerComponentFactoryFunction('B', container => {
    container.element.innerHTML = `
      <div style="padding:10px">
        <h3>Component B</h3>
        <p>id: ${container.state.id}</p>
      </div>
    `;
  });

  /* ---- HEAVY PANEL ---- */
  gl.registerComponentFactoryFunction('heavy', container => {
    const { id, businessState } = container.state;

    const root = document.createElement('div');
    root.style.padding = '10px';

    const h = document.createElement('h3');
    h.textContent = `Heavy Panel ${id}`;

    const info = document.createElement('div');
    info.textContent = `counter = ${businessState.counter}`;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 120;
    canvas.style.border = '1px solid #888';

    root.append(h, info, canvas);
    container.element.appendChild(root);

    // simulation charge
    const ctx = canvas.getContext('2d');
    let t = 0;

    const timer = setInterval(() => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#444';
      ctx.fillRect(0, 0, (t * 12) % canvas.width, 25);
    }, 200);

    container.on('destroy', () => {
      clearInterval(timer);
      console.log('🔥 heavy destroyed', id);
    });
  });

  gl.init();
  return gl;
}

/* ======================================================
   5) BOOTSTRAP INITIAL
====================================================== */
let layout = createLayout({
  root: {
    type: 'row',
    content: [
      {
        type: 'stack',
        content: [
          {
            type: 'component',
            componentType: 'A',
            componentState: {
              id: 'panel-A',
              businessState: {}
            }
          }
        ]
      }
    ]
  }
});

function logicalRoot() {
  return layout.rootItem.contentItems[0];
}

/* ======================================================
   6) API RUNTIME
====================================================== */
function openPanel(type, businessState = {}) {
  layout.addComponent(
    type,
    {
      id: crypto.randomUUID(),
      businessState
    },
    logicalRoot()
  );
}

window.addB = () => openPanel('B');
window.addHeavy = () =>
  openPanel('heavy', { counter: Math.floor(Math.random() * 100) });

/* ======================================================
   7) SAVE / LOAD
====================================================== */
window.saveWorkspace = () => {
  const snapshot = {
    version: 1,
    panels: collectPanels(layout.rootItem),
    layout: extractAbstractLayout(layout.rootItem)
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot, null, 2));
  console.log('WORKSPACE SAVED', snapshot);
  return snapshot;
};

window.loadWorkspace = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return console.warn('no workspace');

  const snapshot = JSON.parse(raw);
  const panelsById = Object.fromEntries(
    snapshot.panels.map(p => [p.id, p])
  );

  const newConfig = {
    root: buildLayoutConfig(snapshot.layout, panelsById)
  };

  layout.destroy();
  layout = createLayout(newConfig);

  console.log('WORKSPACE RESTORED', snapshot);
};

/* ======================================================
   8) SCÉNARIO DE TEST
====================================================== */
// addHeavy()
// addHeavy()
// move / stack / split
// saveWorkspace()
// F5
// loadWorkspace()
