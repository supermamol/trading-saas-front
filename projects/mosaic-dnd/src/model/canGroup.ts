// src/model/canGroup.ts
import type { Tab } from "./tab";
import type { Container } from "./container";

/**
 * R1 — Compatibilité de type
 *
 * Un tab peut rejoindre un container
 * uniquement si son kind est identique
 * à celui du container.
 */
export function canGroup(
  tab: Tab,
  container: Container
): boolean {
  // invariant : container.tabs.length >= 1
  return tab.kind === container.tabs[0].kind;
}
