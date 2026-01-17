import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { WorkspaceView } from "../WorkspaceView";
import type { Workspace } from "../../model/workspace";
import type { Container } from "../../model/container";
import type { Tab } from "../../model/tab";

/* Helpers */
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

it("DnD outside isole le tab si le container a > 1 tab", () => {
    const ws = workspace([
      container("C1", [tab("A"), tab("B")]),
    ]);
  
    let nextWs: Workspace | undefined;
  
    render(
      <WorkspaceView
        workspace={ws}
        onChange={(w) => (nextWs = w)}
      />
    );
  
    // 👉 Simule un drop "outside" sur le tab A
    fireEvent.drop(
      document.querySelector("[style*='background: rgb(240, 240, 240)']")!,
      {
        dataTransfer: {
          getData: () =>
            JSON.stringify({
              tabId: "A",
              sourceContainerId: "C1",
            }),
          types: ["application/x-mosaic-tab"],
        },
      }
    );
  
    expect(nextWs).toBeDefined();
  
    const containers = Object.values(nextWs!.containers);
  
    // ➜ un container de plus
    expect(containers.length).toBe(2);
  
    const cWithA = containers.find(c =>
      c.tabs.some(t => t.id === "A")
    )!;
    const cWithB = containers.find(c =>
      c.tabs.some(t => t.id === "B")
    )!;
  
    expect(cWithA.tabs.map(t => t.id)).toEqual(["A"]);
    expect(cWithB.tabs.map(t => t.id)).toEqual(["B"]);
  });

  it("DnD outside est un no-op si le container a 1 seul tab", () => {
    const ws = workspace([
      container("C1", [tab("A")]),
    ]);
  
    let nextWs: Workspace | undefined;
  
    render(
      <WorkspaceView
        workspace={ws}
        onChange={(w) => (nextWs = w)}
      />
    );
  
    // 👉 drop outside sur A
    fireEvent.drop(
      document.querySelector("[style*='background: rgb(240, 240, 240)']")!,
      {
        dataTransfer: {
          getData: () =>
            JSON.stringify({
              tabId: "A",
              sourceContainerId: "C1",
            }),
          types: ["application/x-mosaic-tab"],
        },
      }
    );
  
    // ➜ aucune transition
    expect(nextWs).toBeUndefined();
  });
  
  