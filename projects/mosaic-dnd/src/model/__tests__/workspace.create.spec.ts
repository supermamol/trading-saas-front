import { describe, it, expect } from "vitest";
import { openPanel } from "../workspace.panels";
import type { Workspace } from "../workspace";
import type { Container } from "../container";
import type { Tab } from "../tab";

/* ======================================================
 * Helpers
 * ====================================================== */

function emptyWorkspace(): Workspace {
  return {
    containers: {},
    detached: [],
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

/* ======================================================
 * Tests — CU CREATE (openPanel)
 * ====================================================== */

describe("CU CREATE — openPanel", () => {
  it("crée un container si aucun compatible n'existe", () => {
    const ws0 = emptyWorkspace();

    const ws1 = openPanel(ws0, "Chart", { strategyId: "S1" });

    expect(containerCount(ws1)).toBe(1);

    const c = containers(ws1)[0];
    expect(c.tabs).toHaveLength(1);
    expect(c.tabs[0].kind).toBe("Chart");
    expect(c.groupKey).toEqual({
      kind: "Chart",
      strategyId: "S1",
    });

    // invariant
    expect(ws1.detached).toHaveLength(0);
  });

  it("regroupe dans le même container si GroupKey identique", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    expect(containerCount(ws)).toBe(1);

    const c = containers(ws)[0];
    expect(c.tabs).toHaveLength(2);
    expect(c.tabs.map(t => t.kind)).toEqual(["Chart", "Chart"]);

    // dernier tab actif
    expect(c.tabs[c.tabs.length - 1].kind).toBe("Chart");

    expect(ws.detached).toHaveLength(0);
  });

  it("ne regroupe pas si le kind est différent", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Run", { strategyId: "S1" });

    expect(containerCount(ws)).toBe(2);

    const kinds = containers(ws).map(c => c.groupKey?.kind).sort();
    expect(kinds).toEqual(["Chart", "Run"]);

    expect(ws.detached).toHaveLength(0);
  });

  it("ne regroupe pas si le context (strategyId) est différent", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Chart", { strategyId: "S2" });

    expect(containerCount(ws)).toBe(2);

    const keys = containers(ws).map(c => c.groupKey);
    expect(keys).toEqual(
      expect.arrayContaining([
        { kind: "Chart", strategyId: "S1" },
        { kind: "Chart", strategyId: "S2" },
      ])
    );

    expect(ws.detached).toHaveLength(0);
  });

  it("crée toujours un tab actif (dernier de pile)", () => {
    let ws = emptyWorkspace();

    ws = openPanel(ws, "Chart", { strategyId: "S1" });
    ws = openPanel(ws, "Chart", { strategyId: "S1" });

    const c = containers(ws)[0];
    const active = c.tabs[c.tabs.length - 1];

    expect(active).toBeDefined();
    expect(active.kind).toBe("Chart");
  });
});
