import { describe, it, expect } from "vitest";
import type { Workspace } from "../workspace";
import type { Container } from "../container";
import type { Tab } from "../tab";
import { isolateTab } from "../workspace";

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
  };
}

/* ======================================================
 * Tests — isolateTab (métier pur)
 * ====================================================== */

describe("isolateTab", () => {

  it("isole un tab depuis un container à plusieurs tabs", () => {
    /**
     * Initial:
     * C1: [A, B]
     *
     * isolate A
     *
     * Attendu:
     * C1: [B]
     * Cx: [A]
     */

    const ws = workspace([
      container("C1", [tab("A"), tab("B")]),
    ]);

    const result = isolateTab(ws, "A");
    const next = result.workspace;

    const containers = Object.values(next.containers);
    expect(containers.length).toBe(2);

    const source = containers.find(c =>
      c.tabs.some(t => t.id === "B")
    );
    const isolated = containers.find(c =>
      c.tabs.some(t => t.id === "A")
    );

    expect(source).toBeDefined();
    expect(source!.tabs.map(t => t.id)).toEqual(["B"]);

    expect(isolated).toBeDefined();
    expect(isolated!.tabs.map(t => t.id)).toEqual(["A"]);
  });

  it("isole un tab depuis un container à 1 tab (remplacement du container)", () => {
    /**
     * Initial:
     * C1: [A]
     *
     * isolate A
     *
     * Attendu:
     * C1 supprimé
     * Cx: [A]
     */

    const ws = workspace([
      container("C1", [tab("A")]),
    ]);

    const result = isolateTab(ws, "A");
    const next = result.workspace;

    const containers = Object.values(next.containers);
    expect(containers.length).toBe(1);

    expect(containers[0].tabs.map(t => t.id)).toEqual(["A"]);
  });

});
