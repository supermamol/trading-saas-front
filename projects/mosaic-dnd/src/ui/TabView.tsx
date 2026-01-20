import type { Tab } from "../model/tab";

export function TabView({ tab }: { tab: Tab }) {
  return (
    <div className="tab-view-content">
      <h4>Contenu du Tab {tab.id}</h4>
      <p>Ici viendra le contenu métier spécifique à ce tab.</p>
      <div className="tab-view-placeholder">
        Charts / forms / lists / etc.
      </div>
    </div>
  );
}
