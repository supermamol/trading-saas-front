import { describe, it, expect } from "vitest";
import type { Workspace } from "../workspace";
import type { Container } from "../container";
import type { Tab } from "../tab";
import { handleTabDrop } from "../dnd";

/* ======================================================
 * Helpers de test
 * ====================================================== */

function tab(id: string): Tab {
  return { id, kind: "test" };
}

function container(id: string, tabs: Tab[]): Container {
  return { id, tabs };
}

function workspace(containers: Container[]): Workspace {
  return {
    containers: Object.fromEntries(
      containers.map(c => [c.id, c])
    ),
    detached: [], // ✅ toujours initialisé
  };
}

/* ======================================================
 * Tests
 * ====================================================== */

describe("DnD tab-centric model", () => {

  it("tab → entête : groupement (auto-dissolution source)", () => {
    const ws = workspace([
      container("C1", [tab("A")]),
      container("C2", [tab("B")]),
    ]);

    const next = handleTabDrop(ws, "A", {
      type: "header",
      containerId: "C2",
    });

    // C1 a été auto-dissous
    expect(next.containers["C1"]).toBeUndefined();

    // C2 contient maintenant B + A
    expect(next.containers["C2"].tabs.map(t => t.id))
      .toEqual(["B", "A"]);

    // ✅ invariant
    expect(next.detached).toHaveLength(0);
  });

  it("tab → hors entête (container > 1) : isolation", () => {
    const ws = workspace([
      container("C1", [tab("A"), tab("B")]),
    ]);

    const next = handleTabDrop(ws, "B", {
      type: "outside",
    });

    const containers = Object.values(next.containers);
    expect(containers.length).toBe(2);

    const isolated = containers.find(c =>
      c.tabs.some(t => t.id === "B")
    )!;

    expect(isolated.tabs.map(t => t.id)).toEqual(["B"]);

    // ✅ invariant
    expect(next.detached).toHaveLength(0);
  });

  it("tab → hors entête (container = 1) : isolation (remplacement du container)", () => {
    const ws = workspace([
      container("C1", [tab("A")]),
    ]);

    const next = handleTabDrop(ws, "A", {
      type: "outside",
    });

    const containers = Object.values(next.containers);
    expect(containers.length).toBe(1);
    expect(containers[0].tabs.map(t => t.id)).toEqual(["A"]);

    // ✅ invariant
    expect(next.detached).toHaveLength(0);
  });

  it("container à 1 tab reste valide", () => {
    const ws = workspace([
      container("C1", [tab("A"), tab("B")]),
    ]);

    const next = handleTabDrop(ws, "B", {
      type: "outside",
    });

    const remaining = Object.values(next.containers)
      .find(c => c.tabs.some(t => t.id === "A"));

    expect(remaining).toBeDefined();
    expect(remaining!.tabs.map(t => t.id)).toEqual(["A"]);

    // ✅ invariant
    expect(next.detached).toHaveLength(0);
  });

});
