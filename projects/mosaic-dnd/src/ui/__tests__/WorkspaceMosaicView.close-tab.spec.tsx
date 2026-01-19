import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useState } from "react";

import { WorkspaceMosaicView } from "../WorkspaceMosaicView";
import type { Workspace } from "../../model/workspace";

/* ======================================================
 * Hosts
 * ====================================================== */

function HostTwoTabs() {
  const [state, setState] = useState({
    workspace: {
      containers: {
        C1: {
          id: "C1",
          tabs: [
            { id: "A", kind: "test" },
            { id: "B", kind: "test" },
          ],
        },
      },
    } as Workspace,
    layout: "C1",
  });

  return (
    <WorkspaceMosaicView
      state={state}
      onStateChange={(updater) => setState(updater)}
    />
  );
}

function HostSingleTab() {
  const [state, setState] = useState({
    workspace: {
      containers: {
        C1: {
          id: "C1",
          tabs: [{ id: "A", kind: "test" }],
        },
      },
    } as Workspace,
    layout: "C1",
  });

  return (
    <WorkspaceMosaicView
      state={state}
      onStateChange={(updater) => setState(updater)}
    />
  );
}

/* ======================================================
 * Tests UI — Close Tab
 * ====================================================== */

describe("WorkspaceMosaicView — close tab", () => {

  it("retire un tab sans supprimer le container", () => {
    render(<HostTwoTabs />);

    // état initial
    expect(screen.getAllByText("Tab A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tab B").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Container C1/).length).toBeGreaterThan(0);

    // close B
    fireEvent.click(screen.getAllByLabelText("Close tab")[1]);

    // B a disparu
    expect(screen.queryAllByText("Tab B").length).toBe(0);

    // A toujours là
    expect(screen.getAllByText("Tab A").length).toBeGreaterThan(0);

    // container toujours présent
    expect(screen.getAllByText(/Container C1/).length).toBeGreaterThan(0);
  });
      
});
