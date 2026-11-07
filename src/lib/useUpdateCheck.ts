import { useEffect, useState } from "react";

const CHECK_EVERY_MS = 60_000;

async function fetchLiveVersion(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { version?: unknown };
    return typeof body.version === "string" ? body.version : null;
  } catch {
    return null; // offline etc. – try again later
  }
}

/**
 * True once a newer build than the one running is live.
 * Checks every minute and whenever the app comes back to the foreground –
 * the moment a home screen app is most likely to be stale.
 */
export function useUpdateAvailable(
  currentVersion: string = __APP_VERSION__,
  url = `${import.meta.env.BASE_URL}version.json`,
): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (available) return;
    let cancelled = false;
    const check = () => {
      if (document.visibilityState === "hidden") return;
      void fetchLiveVersion(url).then((live) => {
        if (!cancelled && live !== null && live !== currentVersion) setAvailable(true);
      });
    };

    check();
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [available, currentVersion, url]);

  return available;
}
