import { useSyncExternalStore } from "react";

/** Routes are hashes so they work on GitHub Pages without a 404 fallback. */
export const gameHref = (id: string) => `#/spel/${encodeURIComponent(id)}`;
export const PANNLAPPEN_HREF = "#/mobilspel/pannlappen";
/** Pannlappen used to be called Heads Up – old links and bookmarks still work. */
const OLD_PANNLAPPEN_HREF = "#/mobilspel/heads-up";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const useHash = () => useSyncExternalStore(subscribe, () => window.location.hash);

export function useSelectedGameId(): string | null {
  const match = useHash().match(/^#\/spel\/(.+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function useIsPannlappenRoute(): boolean {
  const hash = useHash();
  return hash === PANNLAPPEN_HREF || hash === OLD_PANNLAPPEN_HREF;
}

export function closeGame() {
  window.location.hash = "/";
}
