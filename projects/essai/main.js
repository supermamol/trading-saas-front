import './style.css';
import '@genesis-community/golden-layout/dist/css/goldenlayout-base.css';
import '@genesis-community/golden-layout/dist/css/themes/goldenlayout-light-theme.css';

import { GoldenLayout } from '@genesis-community/golden-layout';
import { PANEL_RULES } from './panelRules';

const rootEl = document.getElementById('layout-root');

/* ======================================================
   MOCK DATA
====================================================== */

const STRATEGIES = [
  { strategyId: 'S1', name: 'Strategy 1' },
  { strategyId: 'S2', name: 'Strategy 2' },
  { strategyId: 'S3', name: 'Strategy 3' }
];

/* ======================================================
   LAYOUT
====================================================== */

const layout = new GoldenLayout(
  {
    root: {
      type: 'row',
      content: [
        {
          type: 'stack',
          content: [
            {
              type: 'component',
              componentType: 'strategies',
              title: 'Strategies'
            }
          ]
        }
      ]
    }
  },
  rootEl
);

/* ======================================================
   COMPONENTS
====================================================== */

layout.registerComponentFactoryFunction('strategies', container => {
  const root = document.createElement('div');
  root.style.padding = '10px';

  const h = document.createElement('h3');
  h.textContent = 'Strategies';
  root.appendChild(h);

  STRATEGIES.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = `Open ${s.name}`;
    btn.style.display = 'block';
    btn.style.marginBottom = '6px';

    // ✅ APPEL DE openPanel (et plus openStrategyDetail)
    btn.onclick = () =>
      openPanel('strategyDetail', { strategyId: s.strategyId });

    root.appendChild(btn);
  });

  container.element.appendChild(root);
});

layout.registerComponentFactoryFunction('strategyDetail', container => {
  const root = document.createElement('div');
  root.style.padding = '10px';

  const h = document.createElement('h3');
  h.textContent = 'Strategy Detail';

  const p = document.createElement('p');
  p.textContent = `strategyId = ${container.state.strategyId}`;

  root.appendChild(h);
  root.appendChild(p);

  container.element.appendChild(root);
});

layout.init();

/* ======================================================
   OPEN PANEL (piloté par PANEL_RULES)
====================================================== */

function openPanel(type, state) {
  const rule = PANEL_RULES[type];
  if (!rule) {
    console.warn('Unknown panel type:', type);
    return;
  }

  const key = rule.key ? rule.key(state) : type;
  const stack = findMainStack();
  if (!stack) return;

  const existing = findExisting(type, key);
  if (existing) {
    existing.parent.setActiveContentItem(existing);
    return;
  }

  layout.addComponent(
    type,
    { ...state, __panelKey: key },
    stack
  );
}

/* ======================================================
   HELPERS GLv2
====================================================== */

function findMainStack() {
  let found = null;

  function walk(item) {
    if (!item || found) return;
    if (item.isStack) {
      found = item;
      return;
    }
    if (item.contentItems) item.contentItems.forEach(walk);
  }

  walk(layout.rootItem);
  return found;
}

function findExisting(type, key) {
  let found = null;

  function walk(item) {
    if (!item || found) return;

    if (
      item.type === 'component' &&
      item.componentType === type &&
      item.container?.state?.__panelKey === key
    ) {
      found = item;
      return;
    }

    if (item.contentItems) item.contentItems.forEach(walk);
  }

  walk(layout.rootItem);
  return found;
}
