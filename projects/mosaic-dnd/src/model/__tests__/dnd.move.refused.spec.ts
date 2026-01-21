import { describe, it, expect } from "vitest";
import { handleTabDrop } from "../dnd";
import type { Workspace } from "../workspace";
import type { Container } from "../container";
import type { Tab } from "../tab";

function tab(id: string, kind: string): Tab {
  return { id, kind };
}

function container(id: string, tabs: Tab[]): Container {
  return { id, tabs };
}

function workspace(containers: Container[]): Workspace {
  return {
    containers: Object.fromEntries(containers.map(c => [c.id, c])),
    detached: [],
  };
}

describe("DnD MOVE refusé si canGroup=false", () => {
  it("refuse le move si kinds différents (workspace inchangé)", () => {
    const ws = workspace([
      container("C1", [tab("A", "Run")]),
      container("C2", [tab("B", "Chart")]),
    ]);

    const next = handleTabDrop(ws, "A", {
      type: "header",
      containerId: "C2",
    });

    // inchangé
    expect(next).toEqual(ws);
  });
});
