/**
 * gamepick – röster
 *
 * Ett litet API som sparar röster i fliken "Röster" i Gamepick-arket.
 * Installera: i arket, Tillägg → Apps Script, klistra in den här filen,
 * Distribuera → Ny distribution → Webbapp, Kör som: Jag, Åtkomst: Alla.
 *
 * GET              → { votes: [{ gameId, voter }] }
 * POST (text/plain) { gameId, voter, vote: true|false } → samma som GET
 *
 * Nollställ inför nästa spelkväll genom att ta bort raderna i fliken "Röster".
 */
const SHEET_NAME = "Röster";

function votesSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["tid", "spel", "röstare"]);
  }
  return sheet;
}

function readVotes_(sheet) {
  const rows = sheet.getDataRange().getValues().slice(1);
  return rows
    .filter((row) => row[1] !== "" && row[2] !== "")
    .map((row) => ({ gameId: String(row[1]), voter: String(row[2]) }));
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ votes: readVotes_(votesSheet_()) });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const gameId = String(body.gameId || "").trim();
  const voter = String(body.voter || "").trim().slice(0, 40);
  if (!gameId || !voter) return json_({ error: "gameId och voter krävs" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = votesSheet_();
    const values = sheet.getDataRange().getValues();
    const matches = [];
    values.forEach((row, index) => {
      if (index > 0 && String(row[1]) === gameId && String(row[2]).toLowerCase() === voter.toLowerCase()) {
        matches.push(index + 1); // 1-based sheet row
      }
    });

    if (body.vote === true && matches.length === 0) {
      sheet.appendRow([new Date(), gameId, voter]);
    }
    if (body.vote === false) {
      // Delete bottom-up so row numbers stay valid.
      matches.reverse().forEach((row) => sheet.deleteRow(row));
    }
    return json_({ votes: readVotes_(sheet) });
  } finally {
    lock.releaseLock();
  }
}
