import type { Game } from "../lib/game.ts";

type Props = { game: Game; className?: string; loading?: "lazy" | "eager" };

/** Box art, or a generated tile when BGG has no image. */
export function Cover({ game, className = "", loading = "lazy" }: Props) {
  if (game.image) {
    return <img className={`cover ${className}`} src={game.image} alt="" loading={loading} decoding="async" />;
  }
  const hue = [...game.id].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 360, 7);
  return (
    <div
      className={`cover cover--fallback ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 32%), hsl(${(hue + 50) % 360} 60% 16%))` }}
      aria-hidden="true"
    >
      <span>{game.name}</span>
    </div>
  );
}
