import { useDroppable } from "@dnd-kit/core";
import type { Container } from "../model/container";
import { TabView } from "./TabView";

import { closeTab } from "../model/workspace";
import { detachPanel } from "../model/workspace.panels";
import type { Workspace } from "../model/workspace";

export function ContainerView({
    container,
    workspace,
    onWorkspaceChange,
}: {
    container: Container;
    workspace: Workspace;
    onWorkspaceChange: (ws: Workspace) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `container-${container.id}`,
        data: {
            type: "container",
            containerId: container.id,
        },
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                border: "1px solid #ccc",
                padding: 8,
                height: "100%",
                background: isOver ? "#e6f2ff" : "#fafafa",
            }}
        >
            {container.tabs.map(tab => (
                <TabView
                    key={tab.id}
                    tab={tab}
                    containerId={container.id}
                    onDetach={(tab) => {
                        const { workspace: next } = detachPanel(workspace, tab);
                        onWorkspaceChange(next);
                    }}
                    onClose={(tabId) => {
                        const next = closeTab(workspace, tabId);
                      
                        console.group(`[CLOSE TAB ${tabId}]`);
                      
                        console.log("workspace === next ?", workspace === next);
                      
                        console.log(
                          "before",
                          Object.fromEntries(
                            Object.entries(workspace.containers).map(([id, c]) => [
                              id,
                              c.tabs.map(t => t.id),
                            ])
                          )
                        );
                      
                        console.log(
                          "after",
                          Object.fromEntries(
                            Object.entries(next.containers).map(([id, c]) => [
                              id,
                              c.tabs.map(t => t.id),
                            ])
                          )
                        );
                      
                        console.groupEnd();
                      
                        onWorkspaceChange(next);
                      }}
                                      />
            ))}
        </div>
    );
}
