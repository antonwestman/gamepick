/** Reads our game list from the Google Sheet (exported as CSV). */

export type SheetEntry = {
  bggId: number | null;
  name: string | null;
  collections: string[];
  featured: boolean;
  owner: string | null;
  comment: string | null;
};

/** RFC 4180-ish CSV parser: quoted fields, "" escapes, newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const TRUTHY = new Set(["ja", "j", "x", "yes", "y", "true", "1", "✓", "✔"]);

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

/** Accepts a bare id ("13") or a BGG url (".../boardgame/13/catan"). */
export function parseBggId(value: string | undefined): number | null {
  const match = value?.trim().match(/(?:boardgame(?:expansion)?\/)?(\d+)/);
  return match?.[1] ? Number(match[1]) : null;
}

export function parseSheet(csv: string): SheetEntry[] {
  const [header, ...rows] = parseCsv(csv);
  if (!header) return [];

  const columns = header.map((h) => h.trim().toLowerCase());
  const column = (name: string) => columns.indexOf(name);
  const idCol = column("bgg_id");
  const nameCol = column("namn");
  const collectionsCol = column("samlingar");
  const featuredCol = column("utvald");
  const ownerCol = column("ägare");
  const commentCol = column("kommentar");

  if (idCol === -1 && nameCol === -1) {
    throw new Error(`The sheet needs a "bgg_id" or "namn" column, found: ${header.join(", ")}`);
  }

  return rows
    .map((cells): SheetEntry => {
      const cell = (index: number) => (index === -1 ? undefined : cells[index]);
      return {
        bggId: parseBggId(cell(idCol)),
        name: blankToNull(cell(nameCol)),
        collections: (cell(collectionsCol) ?? "")
          .split(/[,;]/)
          .map((c) => c.trim())
          .filter((c) => c !== ""),
        featured: TRUTHY.has((cell(featuredCol) ?? "").trim().toLowerCase()),
        owner: blankToNull(cell(ownerCol)),
        comment: blankToNull(cell(commentCol)),
      };
    })
    .filter((entry) => entry.bggId !== null || entry.name !== null);
}
