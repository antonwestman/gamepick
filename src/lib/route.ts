import { useSyncExternalStore } from "react";

/** Routes are hashes so they work on GitHub Pages without a 404 fallback. */
export const gameHref = (id: string) => `#/spel/${encodeURIComponent(id)}`;

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function useSelectedGameId(): string | null {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const match = hash.match(/^#\/spel\/(.+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function closeGame() {
  window.location.hash = "/";
}
