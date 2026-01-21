import type { Tab } from "../model/tab";

export function TabView({ tab }: { tab: Tab }) {
  return (
    <div className="tab-view-content">
      <h4>Tab kind</h4>

      <pre
        style={{
          marginTop: 8,
          padding: 8,
          background: "#f1f5f9",
          borderRadius: 4,
          fontSize: 13,
        }}
      >
        {tab.kind}
      </pre>

      {tab.payload && Object.keys(tab.payload).length > 0 && (
        <>
          <h4 style={{ marginTop: 12 }}>Context</h4>
          <pre
            style={{
              padding: 8,
              background: "#f8fafc",
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            {JSON.stringify(tab.payload, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
