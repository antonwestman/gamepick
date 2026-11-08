import { PANNLAPPEN_HREF } from "../lib/route.ts";
import { RailFrame } from "./Rail.tsx";

/** Games played on the phone itself. They live on their own routes, not in the sheet. */
const MOBILE_GAMES = [
  { id: "pannlappen", name: "Pannlappen", emoji: "🤳", href: PANNLAPPEN_HREF, meta: "3+ spelare · telefonen i pannan" },
] as const;

export function MobileGamesRail() {
  return (
    <RailFrame title="Mobilspel">
      {MOBILE_GAMES.map((game) => (
        <li key={game.id}>
          <div className="card">
            <a className="card__link" href={game.href}>
              <div className="card__art">
                <div className="cover cover--fallback cover--mobile" aria-hidden="true">
                  <span>{game.emoji}</span>
                </div>
              </div>
              <h3 className="card__title">{game.name}</h3>
              <p className="meta">{game.meta}</p>
            </a>
          </div>
        </li>
      ))}
    </RailFrame>
  );
}
