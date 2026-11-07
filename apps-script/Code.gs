/**
 * gamepick – spelkvällens gemensamma läge: röster, spelare och "Vem börjar?"-snurren.
 *
 * Sparas i flikarna "Röster", "Spelare" och "Snurr" i Gamepick-arket (skapas automatiskt).
 * Installera: i arket, Tillägg → Apps Script, klistra in den här filen,
 * Distribuera → Ny distribution → Webbapp, Kör som: Jag, Åtkomst: Alla.
 * Uppdatera: Distribuera → Hantera distributioner → ✏️ → Version: Ny version → Distribuera.
 *
 * GET → { votes: [{ gameId, voter }], players: [namn], spin: { id, winner, by } | null }
 * POST (text/plain, JSON) – svarar med samma som GET:
 *   { gameId, voter, vote: true|false }        rösta / ta bort röst
 *   { action: "addPlayer", name }
 *   { action: "removePlayer", name }
 *   { action: "spin", id, winner, by }         spara senaste snurren
 *
 * Nollställ inför nästa spelkväll genom att ta bort raderna i flikarna.
 */
const TABS = {
  votes: { name: "Röster", header: ["tid", "spel", "röstare"] },
  players: { name: "Spelare", header: ["namn"] },
  spin: { name: "Snurr", header: ["tid", "id", "vinnare", "snurrad av"] },
};

function tab_(config) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(config.name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(config.name);
    sheet.appendRow(config.header);
  }
  return sheet;
}

function rows_(sheet) {
  return sheet.getDataRange().getValues().slice(1);
}

function readState_() {
  const votes = rows_(tab_(TABS.votes))
    .filter((row) => row[1] !== "" && row[2] !== "")
    .map((row) => ({ gameId: String(row[1]), voter: String(row[2]) }));
  const players = rows_(tab_(TABS.players))
    .map((row) => String(row[0]).trim())
    .filter((name) => name !== "");
  const last = rows_(tab_(TABS.spin)).pop();
  const spin = last && last[1] ? { id: String(last[1]), winner: String(last[2]), by: String(last[3]) } : null;
  return { votes, players, spin };
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/** 1-based sheet rows (skipping the header) where `matches(row)` is true. */
function findRows_(sheet, matches) {
  const found = [];
  sheet.getDataRange().getValues().forEach((row, index) => {
    if (index > 0 && matches(row)) found.push(index + 1);
  });
  return found;
}

function deleteRows_(sheet, rowNumbers) {
  rowNumbers.reverse().forEach((row) => sheet.deleteRow(row)); // bottom-up keeps numbers valid
}

const clean_ = (value, max) => String(value || "").trim().slice(0, max);
const same_ = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

function vote_(body) {
  const gameId = clean_(body.gameId, 40);
  const voter = clean_(body.voter, 40);
  if (!gameId || !voter) throw new Error("gameId och voter krävs");
  const sheet = tab_(TABS.votes);
  const existing = findRows_(sheet, (row) => String(row[1]) === gameId && same_(row[2], voter));
  if (body.vote === true && existing.length === 0) sheet.appendRow([new Date(), gameId, voter]);
  if (body.vote === false) deleteRows_(sheet, existing);
}

function addPlayer_(body) {
  const name = clean_(body.name, 20);
  if (!name) throw new Error("name krävs");
  const sheet = tab_(TABS.players);
  if (findRows_(sheet, (row) => same_(row[0], name)).length === 0) sheet.appendRow([name]);
}

function removePlayer_(body) {
  const sheet = tab_(TABS.players);
  deleteRows_(sheet, findRows_(sheet, (row) => same_(row[0], body.name)));
}

function spin_(body) {
  const winner = clean_(body.winner, 20);
  if (!winner) throw new Error("winner krävs");
  const sheet = tab_(TABS.spin);
  // The client picks the id so every phone can tell this spin apart from the previous one.
  const id = clean_(body.id, 60) || Utilities.getUuid();
  sheet.appendRow([new Date(), id, winner, clean_(body.by, 40) || "någon"]);
  // Only the latest spin matters; keep the tab short.
  if (sheet.getLastRow() > 50) sheet.deleteRows(2, sheet.getLastRow() - 50);
}

const ACTIONS = { addPlayer: addPlayer_, removePlayer: removePlayer_, spin: spin_ };

function doGet() {
  return json_(readState_());
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const action = body.action ? ACTIONS[body.action] : vote_;
    if (!action) throw new Error(`Okänd action: ${body.action}`);
    action(body);
    return json_(readState_());
  } catch (error) {
    return json_({ error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}
