import { useEffect, useEffectEvent, useReducer, useState } from "react";
import { currentWord, ROUND_MS, roundReducer, shuffle, type Answer, type Round } from "../lib/headsUp.ts";
import { DECKS, type Deck } from "../lib/headsUpDecks.ts";
import { requestTiltPermission, useTilt, useWakeLock } from "../lib/useTilt.ts";

type Playing = Extract<Round, { phase: "playing" }>;

/** Re-renders every `ms` while active, for countdowns. */
function useNow(active: boolean, ms = 200): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
  return now;
}

/** Runs `onDue` at `at` (ms since epoch) while it is non-null. */
function useTimeout(at: number | null, onDue: () => void) {
  const due = useEffectEvent(onDue);
  useEffect(() => {
    if (at === null) return;
    const id = window.setTimeout(due, Math.max(0, at - Date.now()));
    return () => window.clearTimeout(id);
  }, [at]);
}

const secondsLeft = (until: number, now: number, max: number) =>
  Math.min(max, Math.max(0, Math.ceil((until - now) / 1000)));

export function HeadsUp() {
  const [round, dispatch] = useReducer(roundReducer, null);
  const [tiltAllowed, setTiltAllowed] = useState(true);

  const start = async (deck: Deck) => {
    setTiltAllowed(await requestTiltPermission());
    dispatch({ type: "start", deck, words: shuffle(deck.words), now: Date.now() });
  };

  const answer = (value: Answer) => {
    navigator.vibrate?.(value === "correct" ? 60 : [30, 40, 30]);
    dispatch({ type: "answer", answer: value, now: Date.now() });
  };

  const playing = round?.phase === "playing" ? round : null;
  useTilt(playing !== null && playing.flash === null, (direction) => answer(direction === "down" ? "correct" : "pass"));
  useWakeLock(round !== null && round.phase !== "done");

  useTimeout(round?.phase === "countdown" ? round.startsAt : null, () => dispatch({ type: "begin" }));
  useTimeout(playing?.endsAt ?? null, () => dispatch({ type: "timeUp" }));
  useTimeout(playing?.flash?.until ?? null, () => dispatch({ type: "unflash" }));

  return (
    <div className="headsup">
      {round === null && <DeckPicker onPick={start} />}
      {round?.phase === "countdown" && <Countdown startsAt={round.startsAt} onQuit={() => dispatch({ type: "quit" })} />}
      {playing && (
        <PlayingScreen
          round={playing}
          tiltAllowed={tiltAllowed}
          onAnswer={answer}
          onQuit={() => dispatch({ type: "quit" })}
        />
      )}
      {round?.phase === "done" && (
        <Summary
          round={round}
          onReplay={() => void start(round.deck)}
          onPickDeck={() => dispatch({ type: "quit" })}
        />
      )}
    </div>
  );
}

function DeckPicker({ onPick }: { onPick: (deck: Deck) => void }) {
  return (
    <section className="headsup__pick" aria-labelledby="headsup-title">
      <a className="headsup__back" href="#/">
        ‹ gamepick
      </a>
      <h1 id="headsup-title">Heads Up</h1>
      <p className="headsup__how">
        Håll telefonen på tvären mot pannan med skärmen utåt. Kompisarna förklarar ordet du ser – utan att säga det.
        <br />
        <strong>Luta nedåt</strong> när du gissat rätt, <strong>luta uppåt</strong> för att passa. 60 sekunder per runda.
      </p>
      <ul className="headsup__decks">
        {DECKS.map((deck) => (
          <li key={deck.id}>
            <button type="button" className="headsup__deck" onClick={() => onPick(deck)}>
              <span className="headsup__emoji" aria-hidden="true">
                {deck.emoji}
              </span>
              {deck.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Countdown({ startsAt, onQuit }: { startsAt: number; onQuit: () => void }) {
  const now = useNow(true);
  return (
    <section className="headsup__screen" aria-label="Gör dig redo">
      <QuitButton onQuit={onQuit} />
      <p className="headsup__hint">Sätt telefonen i pannan!</p>
      <p className="headsup__big" aria-live="polite">
        {Math.max(1, secondsLeft(startsAt, now, 3))}
      </p>
    </section>
  );
}

type PlayingProps = { round: Playing; tiltAllowed: boolean; onAnswer: (answer: Answer) => void; onQuit: () => void };

function PlayingScreen({ round, tiltAllowed, onAnswer, onQuit }: PlayingProps) {
  const now = useNow(true);
  const seconds = secondsLeft(round.endsAt, now, ROUND_MS / 1000);
  const word = currentWord(round);

  return (
    <section className={`headsup__screen headsup__screen--playing${seconds <= 10 ? " is-ending" : ""}`} aria-label="Spelar">
      <QuitButton onQuit={onQuit} />
      <p className="headsup__timer" aria-label={`${seconds} sekunder kvar`}>
        {seconds}
      </p>
      <p className="headsup__word" aria-live="assertive">
        {word}
      </p>
      <div className="headsup__taps">
        <button type="button" className="headsup__tap headsup__tap--pass" onClick={() => onAnswer("pass")}>
          Pass
        </button>
        <button type="button" className="headsup__tap headsup__tap--correct" onClick={() => onAnswer("correct")}>
          Rätt
        </button>
      </div>
      {!tiltAllowed && <p className="headsup__note">Rörelsesensorn är avstängd – tryck på skärmen i stället.</p>}
      {round.flash && (
        <div className={`headsup__flash headsup__flash--${round.flash.answer}`} role="status">
          {round.flash.answer === "correct" ? "Rätt!" : "Pass"}
        </div>
      )}
    </section>
  );
}

type SummaryProps = { round: Extract<Round, { phase: "done" }>; onReplay: () => void; onPickDeck: () => void };

function Summary({ round, onReplay, onPickDeck }: SummaryProps) {
  const correct = round.results.filter((r) => r.answer === "correct").length;
  return (
    <section className="headsup__summary" aria-labelledby="headsup-score">
      <h1 id="headsup-score">{correct} rätt!</h1>
      <p className="headsup__how">
        {round.deck.emoji} {round.deck.title}
      </p>
      <ul className="headsup__results">
        {round.results.map((result, i) => (
          <li key={i} className={`headsup__result headsup__result--${result.answer}`}>
            <span aria-hidden="true">{result.answer === "correct" ? "✓" : "✗"}</span> {result.word}
            <span className="visually-hidden">{result.answer === "correct" ? " – rätt" : " – pass"}</span>
          </li>
        ))}
      </ul>
      <div className="headsup__actions">
        <button type="button" className="button button--primary" onClick={onReplay}>
          Spela igen
        </button>
        <button type="button" className="button" onClick={onPickDeck}>
          Byt kategori
        </button>
      </div>
    </section>
  );
}

function QuitButton({ onQuit }: { onQuit: () => void }) {
  return (
    <button type="button" className="headsup__quit" onClick={onQuit} aria-label="Avbryt rundan">
      ✕
    </button>
  );
}
