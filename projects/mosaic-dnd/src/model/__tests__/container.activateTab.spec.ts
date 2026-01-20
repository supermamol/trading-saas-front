import { describe, it, expect } from "vitest";

import type { Tab } from "../tab";
import type { Container } from "../container";
import type { Workspace } from "../workspace";

import { activateTab } from "../container";

describe("CU Select Tab — modèle", () => {
  it("sélectionner un tab dans un container n'affecte pas les autres containers", () => {
    // Arrange
    const A: Tab = { id: "A", kind: "test" };
    const B: Tab = { id: "B", kind: "test" };
    const C: Tab = { id: "C", kind: "test" };
    const D: Tab = { id: "D", kind: "test" };

    const workspace: Workspace = {
      containers: {
        C1: {
          id: "C1",
          tabs: [A, B], // B actif
        },
        C2: {
          id: "C2",
          tabs: [C, D], // D actif
        },
      },
    };

    // Act
    const nextWorkspace: Workspace = {
      ...workspace,
      containers: {
        ...workspace.containers,
        C1: activateTab(workspace.containers.C1, "A"),
      },
    };

    // Assert — container cible
    expect(
      nextWorkspace.containers.C1.tabs.map(t => t.id)
    ).toEqual(["B", "A"]);

    // Assert — container non concerné
    expect(
      nextWorkspace.containers.C2.tabs.map(t => t.id)
    ).toEqual(["C", "D"]);

    // Assert — invariants globaux
    expect(Object.keys(nextWorkspace.containers)).toEqual(["C1", "C2"]);
  });
});
