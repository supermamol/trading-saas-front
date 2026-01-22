export type SplitZone = "top" | "bottom" | "left" | "right";

/**
 * Détection radiale locale dans un container
 * relX / relY ∈ [0..1]
 */
export function detectSplitZone(
  relX: number,
  relY: number
): SplitZone {
  const dx = relX - 0.5;
  const dy = relY - 0.5;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? "left" : "right";
  }
  return dy < 0 ? "top" : "bottom";
}
