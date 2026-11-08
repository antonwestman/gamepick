import { useEffect, useEffectEvent, useReducer, useState, type FormEvent } from "react";
import {
  correctCount,
  currentWord,
  gameReducer,
  isTeamGame,
  NEW_GAME,
  nextTeam,
  ROUND_MS,
  teamScores,
  wordsForRound,
  type Answer,
  type Played,
  type Round,
} from "../lib/headsUp.ts";
import { DECKS, DIFFICULTIES, type Deck } from "../lib/headsUpDecks.ts";
import { useHeadsUpSettings, type Settings } from "../lib/headsUpSettings.ts";
import { requestTiltPermission, useTilt, useWakeLock } from "../lib/useTilt.ts";

type Playing = Extract<Round, { phase: "playing" }>;
type Done = Extract<Round, { phase: "done" }>;

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
  const [{ round, played }, dispatch] = useReducer(gameReducer, NEW_GAME);
  const [settings, setSettings] = useHeadsUpSettings();
  const [tiltAllowed, setTiltAllowed] = useState(true);
  const upNext = nextTeam(settings.teams, played);

  const start = async (deck: Deck) => {
    setTiltAllowed(await requestTiltPermission());
    const words = wordsForRound(deck, settings.difficulty, played);
    dispatch({ type: "start", deck, team: upNext, words, now: Date.now() });
  };

  const changeSettings = (next: Settings) => {
    // Scores are kept per team name, so new teams mean a new game.
    if (next.teams.join("\n") !== settings.teams.join("\n")) dispatch({ type: "resetScores" });
    setSettings(next);
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

  const quit = () => dispatch({ type: "quit" });

  return (
    <div className="headsup">
      {round === null && (
        <Setup
          settings={settings}
          onSettingsChange={changeSettings}
          played={played}
          upNext={upNext}
          onResetScores={() => dispatch({ type: "resetScores" })}
          onPick={start}
        />
      )}
      {round?.phase === "countdown" && <Countdown startsAt={round.startsAt} team={round.team} onQuit={quit} />}
      {playing && <PlayingScreen round={playing} tiltAllowed={tiltAllowed} onAnswer={answer} onQuit={quit} />}
      {round?.phase === "done" && (
        <Summary
          round={round}
          teams={settings.teams}
          played={played}
          upNext={upNext}
          onNext={() => void start(round.deck)}
          onPickDeck={quit}
        />
      )}
    </div>
  );
}

type SetupProps = {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  played: Played[];
  upNext: string | null;
  onResetScores: () => void;
  onPick: (deck: Deck) => void;
};

function Setup({ settings, onSettingsChange, played, upNext, onResetScores, onPick }: SetupProps) {
  const teamGame = isTeamGame(settings.teams);
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

      <h2 className="headsup__label">Svårighet</h2>
      <div className="headsup__segments" role="group" aria-label="Svårighet">
        {DIFFICULTIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="chip"
            aria-pressed={settings.difficulty === id}
            onClick={() => onSettingsChange({ ...settings, difficulty: id })}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className="headsup__label">Lag</h2>
      <TeamEditor teams={settings.teams} onChange={(teams) => onSettingsChange({ ...settings, teams })} />
      {teamGame && (
        <>
          {played.length > 0 && <Scoreboard teams={settings.teams} played={played} />}
          <div className="headsup__turn">
            <p>
              Nu spelar <strong>{upNext}</strong>
            </p>
            {played.length > 0 && (
              <button type="button" className="chip" onClick={onResetScores}>
                Nollställ poäng
              </button>
            )}
          </div>
        </>
      )}

      <h2 className="headsup__label">Välj kategori</h2>
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

function TeamEditor({ teams, onChange }: { teams: string[]; onChange: (teams: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const placeholder = `Lag ${teams.length + 1}`;

  const add = (event: FormEvent) => {
    event.preventDefault();
    const name = draft.trim() || placeholder;
    if (!teams.includes(name)) onChange([...teams, name]);
    setDraft("");
  };

  return (
    <>
      {teams.length > 0 && (
        <ul className="spinner__names headsup__teams" aria-label="Lag">
          {teams.map((team) => (
            <li key={team} className="tag">
              {team}
              <button
                type="button"
                className="spinner__remove"
                aria-label={`Ta bort ${team}`}
                onClick={() => onChange(teams.filter((t) => t !== team))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="spinner__add" onSubmit={add}>
        <input
          aria-label="Lagnamn"
          placeholder={placeholder}
          value={draft}
          maxLength={20}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="button">
          Lägg till lag
        </button>
      </form>
      <p className="headsup__note-small">
        {teams.length === 0 && "Utan lag spelar ni bara för skojs skull. Lägg till två eller fler för att räkna poäng."}
        {teams.length === 1 && "Lägg till ett lag till för att räkna poäng."}
        {isTeamGame(teams) && "Lagen turas om – poängen räknas ihop."}
      </p>
    </>
  );
}

function Scoreboard({ teams, played }: { teams: string[]; played: Played[] }) {
  const scores = teamScores(teams, played);
  const best = Math.max(...scores.map((s) => s.score));
  return (
    <table className="headsup__scores">
      <caption>Ställning</caption>
      <tbody>
        {scores.map(({ team, score }) => (
          <tr key={team} className={score === best && best > 0 ? "is-leading" : undefined}>
            <th scope="row">{team}</th>
            <td>{score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Countdown({ startsAt, team, onQuit }: { startsAt: number; team: string | null; onQuit: () => void }) {
  const now = useNow(true);
  return (
    <section className="headsup__screen" aria-label="Gör dig redo">
      <QuitButton onQuit={onQuit} />
      {team && <p className="headsup__team">{team}</p>}
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

  return (
    <section
      className={`headsup__screen headsup__screen--playing${seconds <= 10 ? " is-ending" : ""}`}
      aria-label="Spelar"
    >
      <QuitButton onQuit={onQuit} />
      <p className="headsup__timer" aria-label={`${seconds} sekunder kvar`}>
        {seconds}
      </p>
      <p className="headsup__word" aria-live="assertive">
        {currentWord(round)}
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

type SummaryProps = {
  round: Done;
  teams: string[];
  played: Played[];
  upNext: string | null;
  onNext: () => void;
  onPickDeck: () => void;
};

function Summary({ round, teams, played, upNext, onNext, onPickDeck }: SummaryProps) {
  const correct = correctCount(round.results);
  return (
    <section className="headsup__summary" aria-labelledby="headsup-score">
      <h1 id="headsup-score">{round.team ? `${round.team}: ${correct} rätt!` : `${correct} rätt!`}</h1>
      <p className="headsup__how">
        {round.deck.emoji} {round.deck.title}
      </p>
      {round.team && <Scoreboard teams={teams} played={played} />}
      <ul className="headsup__results" aria-label="Ord">
        {round.results.map((result, i) => (
          <li key={i} className={`headsup__result headsup__result--${result.answer}`}>
            <span aria-hidden="true">{result.answer === "correct" ? "✓" : "✗"}</span> {result.word}
            <span className="visually-hidden">{result.answer === "correct" ? " – rätt" : " – pass"}</span>
          </li>
        ))}
      </ul>
      <div className="headsup__actions">
        <button type="button" className="button button--primary" onClick={onNext}>
          {upNext ? `Nästa: ${upNext}` : "Spela igen"}
        </button>
        <button type="button" className="button" onClick={onPickDeck}>
          {upNext ? "Byt kategori / inställningar" : "Byt kategori"}
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
