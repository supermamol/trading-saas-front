import { useDraggable } from "@dnd-kit/core";

type Props = {
  tabId: string;
  containerId: string;
  isActive: boolean;
  onSelect: () => void;
};

export function XorTab({ tabId, containerId, isActive, onSelect }: Props) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id: `tab-${tabId}`,
    data: { type: "tab", tabId, fromContainerId: containerId },
    disabled: !isActive,                 // ✅ XOR robuste
    activationConstraint: { distance: 5 } // ✅ évite les micro-drags
  });

  return (
    <div
      ref={setNodeRef}
      className={`tab ${isActive ? "tab--active" : ""}`}
      // ✅ click toujours OK ; si actif => ça ne change rien, si inactif => select
      onClick={() => {
        if (!isActive) onSelect();
      }}
      // ✅ listeners/attributes uniquement utiles si actif (car disabled sinon)
      {...listeners}
      {...attributes}
      style={{
        cursor: isActive ? "grab" : "pointer",
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      {tabId}
    </div>
  );
}
