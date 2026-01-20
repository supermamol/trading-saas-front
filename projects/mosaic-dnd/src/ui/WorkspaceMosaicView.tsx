import {
    Mosaic,
    MosaicWindow,
    type MosaicNode,
  } from "react-mosaic-component";
  
  import type { Workspace } from "../model/workspace";
  import type { Container } from "../model/container";
  import { activateTab } from "../model/container";
  import { closeTab } from "../model/workspace";
  import { detachPanel } from "../model/workspace.panels";
  import { ContainerView } from "./ContainerView";
  
  /* ======================================================
   * Types
   * ====================================================== */
  export type Layout = MosaicNode<string>;
  
  export type WorkspaceState = {
    workspace: Workspace;
    layout: MosaicNode<string> | null;
  };
  
  type Props = {
    state: WorkspaceState;
    onStateChange: (updater: (s: WorkspaceState) => WorkspaceState) => void;
  };
  
  /* ======================================================
   * Utils
   * ====================================================== */
  export function buildInitialLayout(containerIds: string[]): Layout | null {
    if (containerIds.length === 0) return null;
    if (containerIds.length === 1) return containerIds[0];
  
    return containerIds.slice(1).reduce<Layout>(
      (acc, id) => ({
        direction: "row",
        first: acc,
        second: id,
      }),
      containerIds[0]
    );
  }
  
  function pruneLayout(
    node: MosaicNode<string> | null,
    validIds: Set<string>
  ): MosaicNode<string> | null {
    if (!node) return null;
  
    if (typeof node === "string") {
      return validIds.has(node) ? node : null;
    }
  
    const first = pruneLayout(node.first, validIds);
    const second = pruneLayout(node.second, validIds);
  
    if (!first && !second) return null;
    if (!first) return second;
    if (!second) return first;
  
    return { ...node, first, second };
  }
  
  /* ======================================================
   * Component
   * ====================================================== */
  export function WorkspaceMosaicView({
    state,
    onStateChange,
  }: Props) {
    const { workspace, layout } = state;
  
    /* Layout change = géométrie uniquement */
    const handleLayoutChange = (next: Layout | null) => {
      onStateChange(s => ({ ...s, layout: next }));
    };
  
    /* Suppression visuelle d’un container (Mosaic ✕)
       ⚠️ PAS un detach métier */
    const handleRemove = (containerId: string) => {
      onStateChange(s => ({
        ...s,
        layout: pruneLayout(
          s.layout,
          new Set(
            Object.keys(s.workspace.containers)
              .filter(id => id !== containerId)
          )
        ),
      }));
    };
  
    /* Rendu d’un tile */
    const renderTile = (containerId: string, path: any) => {
      const container: Container | undefined =
        workspace.containers[containerId];
  
      if (!container) {
        return (
          <MosaicWindow<string> path={path} title={null}>
            <div />
          </MosaicWindow>
        );
      }
  
      return (
        <MosaicWindow<string>
          path={path}
          onRemove={() => handleRemove(containerId)}
          renderToolbar={(props) => (
            <div
              className="my-toolbar"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "0 6px",
              }}
            >
              <span>{`Container ${containerId}`}</span>
              {props.onRemove && (
                <button onClick={props.onRemove}>×</button>
              )}
            </div>
          )}
        >
          <ContainerView
            container={container}
  
            /* =============================
             * SELECT TAB (CU)
             * ============================= */
            onSelectTab={(containerId, tabId) =>
              onStateChange((s) => {
                const container = s.workspace.containers[containerId];
                const nextContainer = activateTab(container, tabId);
  
                return {
                  ...s,
                  workspace: {
                    ...s.workspace,
                    containers: {
                      ...s.workspace.containers,
                      [containerId]: nextContainer,
                    },
                  },
                };
              })
            }
  
            /* =============================
             * CLOSE TAB (CU)
             * ============================= */
            onCloseTab={(tabId) =>
              onStateChange((s) => {
                const nextWorkspace = closeTab(s.workspace, tabId);
                const validIds = new Set(Object.keys(nextWorkspace.containers));
  
                return {
                  ...s,
                  workspace: nextWorkspace,
                  layout: pruneLayout(s.layout, validIds),
                };
              })
            }
  
            /* =============================
             * DETACH TAB (CU)
             * ============================= */
            onDetachTab={(tab) =>
              onStateChange((s) => {
                const { workspace: nextWs } = detachPanel(s.workspace, tab);
                const validIds = new Set(Object.keys(nextWs.containers));
  
                return {
                  ...s,
                  workspace: nextWs,
                  layout: pruneLayout(s.layout, validIds),
                };
              })
            }
          />
        </MosaicWindow>
      );
    };
  
    const validIds = new Set(Object.keys(workspace.containers));
    const effectiveLayout = pruneLayout(layout, validIds);
  
    return (
      <Mosaic<string>
        value={effectiveLayout}
        onChange={handleLayoutChange}
        renderTile={renderTile}
      />
    );
  }
  