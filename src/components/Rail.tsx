import { useId, useRef, type ReactNode } from "react";
import type { Rail as RailData } from "../lib/rails.ts";
import { GameCard } from "./GameCard.tsx";

export function Rail({ rail }: { rail: RailData }) {
  return (
    <RailFrame title={rail.title}>
      {rail.games.map((game) => (
        <li key={game.id}>
          <GameCard game={game} />
        </li>
      ))}
    </RailFrame>
  );
}

/** A titled, horizontally scrolling row. `children` are the `<li>` items. */
export function RailFrame({ title, children }: { title: string; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const titleId = useId(); // rail ids can contain spaces, which break aria-labelledby

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="rail" aria-labelledby={titleId}>
      <h2 className="rail__title" id={titleId}>
        {title}
      </h2>
      <div className="rail__viewport">
        <button className="rail__arrow rail__arrow--prev" onClick={() => scroll(-1)} aria-label="Bläddra bakåt">
          ‹
        </button>
        <ul className="rail__track" ref={trackRef}>
          {children}
        </ul>
        <button className="rail__arrow rail__arrow--next" onClick={() => scroll(1)} aria-label="Bläddra framåt">
          ›
        </button>
      </div>
    </section>
  );
}
