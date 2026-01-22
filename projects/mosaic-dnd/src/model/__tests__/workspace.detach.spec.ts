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
  return {
    containers: {},
    detached: [], // ✅ toujours initialisé
  };
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

    // invariant
    expect(ws1.detached).toHaveLength(0);
  });

  it("regroupe les panels par GroupKey", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    expect(containerCount(ws)).toBe(1);
    expect(containers(ws)[0].tabs.length).toBe(2);
    expect(ws.detached).toHaveLength(0);
  });

});

/* =========================================================
 * Tests — detachPanel
 * ======================================================= */

describe("detachPanel", () => {

  it("retire le tab du workspace et l'ajoute à detached", () => {
    let ws = emptyWorkspace();
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    const tab = allTabs(ws)[0];

    const ws2 = detachPanel(ws, tab);

    // tab retiré du workspace
    expect(findTab(ws2, tab.id)).toBeUndefined();

    // detached alimenté
    expect(ws2.detached).toHaveLength(1);
    expect(ws2.detached[0].kind).toBe("Chart");
    expect(ws2.detached[0].context.strategyId).toBe("S1");
  });

  it("supprime le container s'il devient vide", () => {
    let ws = emptyWorkspace();
    ws = openPanel(ws, "Run", { strategyId: "S1" });

    const tab = allTabs(ws)[0];

    const ws2 = detachPanel(ws, tab);

    expect(containerCount(ws2)).toBe(0);
    expect(ws2.detached).toHaveLength(1);
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

    const ws2 = detachPanel(ws, tab);
    const detached = ws2.detached[0];

    const ws3 = openPanel(ws2, detached.kind, detached.context);

    expect(containerCount(ws3)).toBe(1);
    expect(containers(ws3)[0].tabs.length).toBe(1);

    // detached inchangé ici (rattach pas encore implémenté)
    expect(ws3.detached).toHaveLength(1);
  });
});
