import { useEffect, useState } from "react";
import type { GameLibrary } from "./game.ts";

export type LibraryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; library: GameLibrary };

export function useLibrary(url = `${import.meta.env.BASE_URL}games.json`): LibraryState {
  const [state, setState] = useState<LibraryState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    // "no-cache" revalidates, so a reload never shows yesterday's list (Pages caches files for 10 min).
    fetch(url, { signal: controller.signal, cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<GameLibrary>;
      })
      .then((library) => setState({ status: "ready", library }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
      });
    return () => controller.abort();
  }, [url]);

  return state;
}
