function tileIdForGroup(groupKind: string): TileId {
    return `group:${groupKind}` as TileId;
}

function firstPresent(...nodes: Array<MosaicNode<TileId> | null>): MosaicNode<TileId> | null {
    for (const n of nodes) if (n) return n;
    return null;
}

function stackColumn(nodes: Array<MosaicNode<TileId> | null>): MosaicNode<TileId> | null {
    const present = nodes.filter(Boolean) as MosaicNode<TileId>[];
    if (present.length === 0) return null;
    let acc: MosaicNode<TileId> = present[0];
    for (let i = 1; i < present.length; i++) {
        acc = { direction: "column", first: acc, second: present[i] };
    }
    return acc;
}

export function buildBusinessLayout(tiles: Tile[]): MosaicNode<TileId> | null {
    const hasGroup = (kind: string) =>
        tiles.some((t) => t.type === "group" && t.groupKind === kind);

    const strategies =
        tiles.some((t) => t.type === "panel" && t.panelKey === "strategies")
            ? ("panel:strategies" as TileId)
            : hasGroup("strategies") 
                ? ("group:strategies" as TileId)
                : null;

    const nodered = hasGroup("nodered") ? tileIdForGroup("nodered") : null;

    const chart = hasGroup("chart") ? tileIdForGroup("chart") : null;
    const detail = hasGroup("strategyDetail") ? tileIdForGroup("strategyDetail") : null;
    const run = hasGroup("run") ? tileIdForGroup("run") : null;

    // Cas "Strategies seul" => plein écran
    const left = stackColumn([nodered, strategies]);
    const right = stackColumn([chart, detail, run]);

    // Si on n'a qu'un seul côté, on le retourne direct
    if (!left && !right) return null;
    if (left && !right) return left;
    if (!left && right) return right;

    // Layout standard gauche/droite
    return { direction: "row", first: left!, second: right! };
}
