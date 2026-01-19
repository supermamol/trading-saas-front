import type { ContainerId } from "./ids";

let seq = 1000;
export function nextContainerId(): ContainerId {
  seq += 1;
  return `C${seq}`;
}

// utile en tests
export function __resetIds(n = 1000) {
  seq = n;
}
