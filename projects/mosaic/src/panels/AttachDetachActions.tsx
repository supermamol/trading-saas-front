type Props = {
    groupKind: string;
    panelKey: string;
    isGrouped: boolean;
    canDetach: boolean;
    onAttach: () => void;
    onDetach: () => void;
  };
  
  export function AttachDetachActions({
    groupKind,
    isGrouped,
    canDetach,
    onAttach,
    onDetach,
  }: Props) {
    if (isGrouped) {
      if (!canDetach) return null;
      return (
        <div style={{ marginTop: 12 }}>
          <button onClick={onDetach}>Detach this tab</button>
        </div>
      );
    }
  
    return (
      <div style={{ marginTop: 12 }}>
        <button onClick={onAttach}>
          Attach to {groupKind}
        </button>
      </div>
    );
  }
  