import type { Tab } from "../model/tab";
import { XorTab } from "./XorTab";

type Props = {
  tabs: Tab[];
  activeTab: Tab;
  containerId: string;
  onSelectTab: (tabId: string) => void;
  onDetachTab: (tab: Tab) => void;
  onCloseTab: (tabId: string) => void;
};

export function ContainerHeaderView({
  tabs,
  activeTab,
  containerId,
  onSelectTab,
  onDetachTab,
  onCloseTab,
}: Props) {
  return (
    <div className="container-header">
      <div className="tablist">
        {tabs.map((tab) => (
          <XorTab
            key={tab.id}
            tabId={tab.id}
            containerId={containerId}
            isActive={tab.id === activeTab.id}
            onSelect={() => onSelectTab(tab.id)}
          />
        ))}
      </div>

      <div className="tab-actions">
        <button onClick={() => onDetachTab(activeTab)}>detach</button>
        <button onClick={() => onCloseTab(activeTab.id)}>×</button>
      </div>
    </div>
  );
}
