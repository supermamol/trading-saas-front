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
import { ContainerView, type SplitTarget } from "./ContainerView";

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

  hoveredContainerId: string | null;

  // 🔑 ajouté
  onSplitZoneChange: (split: SplitTarget) => void;
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
  hoveredContainerId,
  onSplitZoneChange,
}: Props) {
  const { workspace, layout } = state;

  const handleLayoutChange = (next: Layout | null) => {
    onStateChange(s => ({ ...s, layout: next }));
  };

  const handleRemove = (containerId: string) => {
    onStateChange((s) => {
      const { [containerId]: _, ...remaining } = s.workspace.containers;
      const validIds = new Set(Object.keys(remaining));
      const nextLayout = pruneLayout(s.layout, validIds);
      return {
        ...s,
        workspace: { ...s.workspace, containers: remaining },
        layout: nextLayout,
      };
    });
  };

  const renderTile = (containerId: string, path: any) => {
    const container: Container | undefined = workspace.containers[containerId];

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
            {props.onRemove && <button onClick={props.onRemove}>×</button>}
          </div>
        )}
      >
        <ContainerView
          container={container}
          hoveredContainerId={hoveredContainerId}
          onSplitZoneChange={onSplitZoneChange}
          onSelectTab={(cid, tabId) =>
            onStateChange((s) => {
              const c = s.workspace.containers[cid];
              return {
                ...s,
                workspace: {
                  ...s.workspace,
                  containers: {
                    ...s.workspace.containers,
                    [cid]: activateTab(c, tabId),
                  },
                },
              };
            })
          }
          onCloseTab={(tabId) =>
            onStateChange((s) => {
              const next = closeTab(s.workspace, tabId);
              const validIds = new Set(Object.keys(next.containers));
              return {
                ...s,
                workspace: next,
                layout: pruneLayout(s.layout, validIds),
              };
            })
          }
          onDetachTab={(tab) =>
            onStateChange((s) => ({
              ...s,
              workspace: detachPanel(s.workspace, tab),
            }))
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
