// workspace.detach.spec.ts
import { describe, it, expect } from "vitest";
import { openPanel, detachPanel } from "../workspace.panels";

import type { Workspace } from "../workspace";
import type { Container } from "../container";
import type { Tab } from "../tab";

/* =========================================================
 * Helpers de test (alignés modèle réel)
 * ======================================================= */

function emptyWorkspace(): Workspace {
  return { containers: {} };
}

function containers(ws: Workspace): Container[] {
  return Object.values(ws.containers);
}

function containerCount(ws: Workspace): number {
  return containers(ws).length;
}

function allTabs(ws: Workspace): Tab[] {
  return containers(ws).flatMap(c => c.tabs);
}

function findTab(ws: Workspace, tabId: string): Tab | undefined {
  return allTabs(ws).find(t => t.id === tabId);
}

/* =========================================================
 * Tests — openPanel
 * ======================================================= */

describe("openPanel", () => {
  it("crée un container si aucun compatible n'existe", () => {
    const ws0 = emptyWorkspace();

    const ws1 = openPanel(ws0, "Chart", { strategyId: "S1" });

    expect(containerCount(ws1)).toBe(1);

    const c = containers(ws1)[0];
    expect(c.tabs.length).toBe(1);
    expect(c.groupKey).toEqual({
      kind: "Chart",
      strategyId: "S1",
    });
  });

  it("regroupe les panels par GroupKey", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    expect(containerCount(ws)).toBe(1);
    expect(containers(ws)[0].tabs.length).toBe(2);
  });

  it("ne mélange pas des panels de contextes différents", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Chart", { strategyId: "S2" });

    expect(containerCount(ws)).toBe(2);
  });
});

/* =========================================================
 * Tests — detachPanel
 * ======================================================= */

describe("detachPanel", () => {
  it("retire le tab du workspace", () => {
    let ws = emptyWorkspace();
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    const tab = allTabs(ws)[0];

    const result = detachPanel(ws, tab);
    const ws2 = result.workspace;

    expect(findTab(ws2, tab.id)).toBeUndefined();
    expect(result.detached.kind).toBe("Chart");
    expect(result.detached.context.strategyId).toBe("S1");
  });

  it("supprime le container s'il devient vide", () => {
    let ws = emptyWorkspace();
    ws = openPanel(ws, "Run", { strategyId: "S1" });

    const tab = allTabs(ws)[0];

    const { workspace: ws2 } = detachPanel(ws, tab);

    expect(containerCount(ws2)).toBe(0);
  });
});

/* =========================================================
 * Tests — retour d'un panel détaché
 * ======================================================= */

describe("return detached panel", () => {
  it("revient via openPanel (pas de restauration de position)", () => {
    let ws = emptyWorkspace();
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    const tab = allTabs(ws)[0];
    const { workspace: ws2, detached } = detachPanel(ws, tab);

    const ws3 = openPanel(ws2, detached.kind, detached.context);

    expect(containerCount(ws3)).toBe(1);
    expect(containers(ws3)[0].tabs.length).toBe(1);
  });
});
