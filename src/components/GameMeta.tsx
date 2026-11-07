import type { Game } from "../lib/game.ts";
import { formatPlayers, formatPlayTime, weightLabel } from "../lib/format.ts";

/** "2–4 spelare · 30–60 min · Medel" */
export function GameMeta({ game }: { game: Game }) {
  const parts = [formatPlayers(game.players), formatPlayTime(game.playTime), weightLabel(game.weight)].filter(
    (part) => part !== null,
  );
  return <p className="meta">{parts.join(" · ")}</p>;
}
