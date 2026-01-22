// src/ui/panels/NoderedView.tsx
export function NoderedView() {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "4px 8px",
            fontWeight: 600,
            borderBottom: "1px solid #ccc",
          }}
        >
        </div>
  
        <iframe
          src="http://localhost:1880"
          title="Node-RED"
          style={{
            flex: 1,
            border: "none",
            width: "100%",
          }}
        />
      </div>
    );
  }
  