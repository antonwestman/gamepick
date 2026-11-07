import { describe, expect, it } from "vitest";
import { parseCsv, parseSheet } from "./sheet.ts";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes, commas and newlines inside fields", () => {
    const csv = 'a,b\r\n"1,2","say ""hi""\nthere"\n';
    expect(parseCsv(csv)).toEqual([
      ["a", "b"],
      ["1,2", 'say "hi"\nthere'],
    ]);
  });
});

describe("parseSheet", () => {
  const header = "bgg_id,namn,samlingar,utvald,ägare,kommentar";

  it("reads our columns", () => {
    const [entry] = parseSheet(`${header}\n13,Catan,"Klassiker, Familj",ja,Anton,Alltid kul`);
    expect(entry).toEqual({
      bggId: 13,
      name: "Catan",
      collections: ["Klassiker", "Familj"],
      featured: true,
      owner: "Anton",
      comment: "Alltid kul",
    });
  });

  it("accepts a BGG url as id and skips empty rows", () => {
    const entries = parseSheet(`${header}\nhttps://boardgamegeek.com/boardgame/266192/wingspan,,,,,\n,,,,,`);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ bggId: 266192, name: null, featured: false, collections: [] });
  });

  it("keeps rows that only have a name, so the build can search BGG for them", () => {
    expect(parseSheet(`${header}\n,Azul,,,,`)[0]).toMatchObject({ bggId: null, name: "Azul" });
  });

  it("does not care about column order or header case", () => {
    expect(parseSheet("Namn,BGG_ID\nPatchwork,163412")[0]).toMatchObject({ bggId: 163412, name: "Patchwork" });
  });
});
