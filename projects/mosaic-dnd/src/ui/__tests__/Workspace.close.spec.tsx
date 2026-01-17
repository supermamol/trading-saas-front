import { describe, it, expect } from "vitest";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WorkspaceView } from "../WorkspaceView";
import type { Workspace } from "../../model/workspace";
import type { Container } from "../../model/container";
import type { Tab } from "../../model/tab";

/* ======================================================
 * Helpers
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
 * Test Host (STATEFUL)
 * ====================================================== */

function TestHost({ initial }: { initial: Workspace }) {
    const [ws, setWs] = useState(initial);
    return (
        <WorkspaceView
            workspace={ws}
            onChange={setWs}
        />
    );
}

/* ======================================================
 * Tests
 * ====================================================== */

describe("WorkspaceView — Close (UI)", () => {
    it("retire le tab du workspace quand on clique sur ✕", () => {
        render(
            <TestHost
                initial={workspace([
                    container("C1", [tab("A"), tab("B")]),
                ])}
            />
        );

        // Précondition
        expect(screen.getByText("Tab A")).toBeDefined();
        expect(screen.getByText("Tab B")).toBeDefined();

        // Action
        const closeButtons = screen.getAllByLabelText("Close tab");
        fireEvent.click(closeButtons[0]);

        // Post-condition DOM
        expect(screen.queryByText("Tab A")).toBeNull();
        expect(screen.getByText("Tab B")).toBeDefined();
    });

    it.skip("retire le dernier tab quand on clique sur ✕", async () => {
        render(
          <TestHost
            initial={workspace([
              container("C1", [tab("A")]),
            ])}
          />
        );
      
        fireEvent.click(
          screen.getAllByLabelText("Close tab")[0]
        );
      
        await waitFor(() => {
          expect(screen.queryByText("Tab A")).toBeNull();
        });
      });
      
});
