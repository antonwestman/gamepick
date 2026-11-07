import { useUpdateAvailable } from "../lib/useUpdateCheck.ts";

/** Shown when a newer version of the site is live; one tap reloads. */
export function UpdateBanner() {
  const available = useUpdateAvailable();
  if (!available) return null;
  return (
    <button type="button" className="update-banner" onClick={() => window.location.reload()}>
      ✨ Ny version av Gamepick – tryck för att uppdatera
    </button>
  );
}
