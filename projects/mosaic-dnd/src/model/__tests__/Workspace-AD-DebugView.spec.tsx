import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, it, expect } from "vitest";

import { WorkspaceADDebugView } from "../../ui/Workspace-AD-DebugView";
import type { Workspace } from "../../model/workspace";

function TestHost() {
  const [workspace, setWorkspace] = useState<Workspace>({
    containers: {},
  });

  return (
    <WorkspaceADDebugView
      workspace={workspace}
      setWorkspace={setWorkspace}
    />
  );
}

describe("Workspace-AD-DebugView", () => {
  it("detaches a panel from its container", () => {
    render(<TestHost />);

    fireEvent.click(screen.getByText("Open Chart S1"));
    fireEvent.click(screen.getByText("Open Chart S1"));

    // on a bien 2 tabs
    expect(screen.getAllByText(/detach/i).length).toBe(2);

    // detach du premier
    fireEvent.click(screen.getAllByText("detach")[0]);

    // il n'en reste plus qu'un
    expect(screen.getAllByText(/detach/i).length).toBe(1);
  });
});
