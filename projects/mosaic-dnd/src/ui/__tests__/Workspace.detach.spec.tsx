import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useState } from "react";
import type { Workspace } from "../../model/workspace";
import type { Container } from "../../model/container";
import type { Tab } from "../../model/tab";
import { WorkspaceView } from "../WorkspaceView";

function initialWorkspace(): Workspace {
  const A: Tab = { id: "A", kind: "test" };
  const B: Tab = { id: "B", kind: "test" };
  const C1: Container = { id: "C1", tabs: [A, B] };
  return { containers: { C1 } };
}

function TestHost() {
  const [workspace, setWorkspace] =
    useState<Workspace>(initialWorkspace());

  return (
    <WorkspaceView
      workspace={workspace}
      onChange={setWorkspace}
    />
  );
}

describe("WorkspaceView — Detach (UI)", () => {
  it("retire le tab du workspace quand on clique sur detach", () => {
    render(<TestHost />);

    // Précondition
    expect(screen.getByText("Tab A")).toBeTruthy();
    expect(screen.getByText("Tab B")).toBeTruthy();

    // Action : click sur le bouton DETACH du tab A
    const detachButtons = screen.getAllByLabelText("Detach tab");
    fireEvent.click(detachButtons[0]);

    // Résultat
    expect(screen.queryByText("Tab A")).toBeNull();
    expect(screen.getByText("Tab B")).toBeTruthy();
  });
});
