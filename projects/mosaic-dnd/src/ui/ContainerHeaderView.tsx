import { useRef } from "react";
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

  // ✅ ORDRE VISUEL STABLE (snapshot initial)
  const orderedTabsRef = useRef<string[]>(
    tabs.map(t => t.id)
  );

  // 🔁 synchronise si nouveaux tabs (open / close)
  orderedTabsRef.current = orderedTabsRef.current.filter(id =>
    tabs.some(t => t.id === id)
  );
  tabs.forEach(t => {
    if (!orderedTabsRef.current.includes(t.id)) {
      orderedTabsRef.current.push(t.id);
    }
  });

  const orderedTabs = orderedTabsRef.current
    .map(id => tabs.find(t => t.id === id)!)
    .filter(Boolean);

  return (
    <div className="container-header">
      <div className="tablist">
        {orderedTabs.map((tab) => (
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
        <button onClick={() => onDetachTab(activeTab)}>↗</button>
        <button onClick={() => onCloseTab(activeTab.id)}>×</button>
      </div>
    </div>
  );
}
