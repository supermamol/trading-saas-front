import { describe, it, expect } from "vitest";
import { canGroup } from "../canGroup";
import type { Tab } from "../tab";
import type { Container } from "../container";

function tab(id: string, kind: string): Tab {
  return { id, kind };
}

function container(kind: string): Container {
  return {
    id: "C1",
    tabs: [
      { id: "T1", kind }, // tab de référence
    ],
  };
}

describe("canGroup — R1 compatibilité de type", () => {
  it("autorise le groupement si les kinds sont identiques", () => {
    const t = tab("A", "Chart");
    const c = container("Chart");

    expect(canGroup(t, c)).toBe(true);
  });

  it("refuse le groupement si les kinds sont différents", () => {
    const t = tab("A", "Run");
    const c = container("Chart");

    expect(canGroup(t, c)).toBe(false);
  });
});
