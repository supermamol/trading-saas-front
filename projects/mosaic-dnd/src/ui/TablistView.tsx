import type { Tab } from "../model/tab";
import type { TabId } from "../model/ids";

/* ======================================================
 * Props
 * ====================================================== */
type Props = {
  tabs: Tab[];
  onSelectTab: (tabId: TabId) => void;
};

export function TablistView({ tabs, onSelectTab }: Props) {
  if (tabs.length === 0) {
    return null;
  }

  // Modèle LIFO : le dernier est actif
  const activeTabId = tabs[tabs.length - 1].id;

  return (
    <div className="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={isActive ? "tab tab--active" : "tab"}
            onClick={() => onSelectTab(tab.id)}
          >
            {tab.id}
          </div>
        );
      })}
    </div>
  );
}
