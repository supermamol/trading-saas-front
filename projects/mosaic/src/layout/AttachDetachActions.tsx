interface Props {
    isGrouped: boolean;
    onDetach: () => void;
    onAttach: () => void;
  }
  
  export function AttachDetachActions({
    isGrouped,
    onDetach,
    onAttach,
  }: Props) {
    return (
      <div style={{ marginBottom: 8 }}>
        {isGrouped ? (
          <button onClick={onDetach}>Detach this tab</button>
        ) : (
          <button onClick={onAttach}>Attach to group</button>
        )}
      </div>
    );
  }
  