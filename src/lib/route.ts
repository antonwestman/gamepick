import { useSyncExternalStore } from "react";

/** Routes are hashes so they work on GitHub Pages without a 404 fallback. */
export const gameHref = (id: number) => `#/spel/${id}`;

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useSelectedGameId(): number | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const match = hash.match(/^#\/spel\/(\d+)$/);
  return match?.[1] ? Number(match[1]) : null;
}

export function closeGame() {
  window.location.hash = "/";
}
