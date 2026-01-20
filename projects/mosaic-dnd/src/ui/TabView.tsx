import { useDraggable } from "@dnd-kit/core";
import type { Tab } from "../model/tab";
import type { ContainerId } from "../model/ids";

type Props = {
  tab: Tab;
  containerId: ContainerId;
  onDetach: (tab: Tab) => void;
  onClose: (tabId: string) => void;
};

export function TabView({
  tab,
  onClose,
  onDetach,
}: Props) {
  return (
    <div className="tab-view">

      {/* HEADER FIN */}
      <div className="tab-view-header">
        {/* Zone drag (future) */}
        <div className="tab-view-title">
          {tab.id}
        </div>

        {/* Actions */}
        <div className="tab-view-actions">
          <button onClick={() => onDetach(tab)}>detach</button>
          <button onClick={() => onClose(tab.id)}>×</button>
        </div>
      </div>

      {/* CONTENU */}
      <div className="tab-view-content">
        <h4>Contenu du Tab {tab.id}</h4>

        <p>
          Ici viendra le contenu métier spécifique à ce tab.
        </p>

        <div className="tab-view-placeholder">
          Charts / forms / lists / etc.
        </div>
      </div>

    </div>
  );
}