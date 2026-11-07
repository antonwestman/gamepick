import { describe, expect, it } from "vitest";
import { decodeEntities, parseSearch, parseThings } from "./bgg.ts";

const thingXml = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="13">
    <thumbnail>https://cf.geekdo-images.com/catan_t.jpg</thumbnail>
    <image>https://cf.geekdo-images.com/catan.jpg</image>
    <name type="primary" sortindex="1" value="CATAN" />
    <name type="alternate" sortindex="1" value="Settlers of Catan" />
    <description>Trade &amp;amp; build.&amp;#10;&amp;#10;Roads &amp;mdash; cities.</description>
    <yearpublished value="1995" />
    <minplayers value="3" />
    <maxplayers value="4" />
    <playingtime value="120" />
    <minplaytime value="60" />
    <maxplaytime value="120" />
    <minage value="10" />
    <link type="boardgamecategory" id="1021" value="Economic" />
    <link type="boardgamemechanic" id="2072" value="Dice Rolling" />
    <link type="boardgamedesigner" id="11" value="Klaus Teuber" />
    <statistics page="1">
      <ratings>
        <usersrated value="120000" />
        <average value="7.09" />
        <ranks>
          <rank type="subtype" id="1" name="boardgame" friendlyname="Board Game Rank" value="560" bayesaverage="6.9" />
          <rank type="family" id="5497" name="strategygames" friendlyname="Strategy Game Rank" value="400" bayesaverage="6.9" />
        </ranks>
        <averageweight value="2.29" />
      </ratings>
    </statistics>
  </item>
  <item type="boardgame" id="99">
    <name type="primary" value="Unranked thing" />
    <minplayers value="0" />
    <maxplayers value="0" />
    <statistics page="1"><ratings><average value="0" /><ranks><rank name="boardgame" value="Not Ranked" /></ranks><averageweight value="0" /></ratings></statistics>
  </item>
</items>`;

describe("parseThings", () => {
  it("maps a BGG thing to our game shape", () => {
    const [catan] = parseThings(thingXml);
    expect(catan).toEqual({
      id: 13,
      name: "CATAN",
      year: 1995,
      description: "Trade & build.\n\nRoads — cities.",
      image: "https://cf.geekdo-images.com/catan.jpg",
      thumbnail: "https://cf.geekdo-images.com/catan_t.jpg",
      players: { min: 3, max: 4 },
      playTime: { min: 60, max: 120 },
      minAge: 10,
      rating: 7.09,
      weight: 2.29,
      rank: 560,
      categories: ["Economic"],
      mechanics: ["Dice Rolling"],
      designers: ["Klaus Teuber"],
    });
  });

  it("treats BGG's zeros and 'Not Ranked' as unknown", () => {
    const [, unknown] = parseThings(thingXml);
    expect(unknown).toMatchObject({ players: null, rating: null, weight: null, rank: null, image: null });
  });
});

describe("parseSearch", () => {
  it("returns ids in order", () => {
    const xml = `<items total="2"><item type="boardgame" id="230802"><name type="primary" value="Azul"/></item><item type="boardgame" id="1"><name type="primary" value="Azul: Mini"/></item></items>`;
    expect(parseSearch(xml)).toEqual([
      { id: 230802, name: "Azul" },
      { id: 1, name: "Azul: Mini" },
    ]);
  });
});

describe("decodeEntities", () => {
  it("decodes numeric, hex and double-encoded entities", () => {
    expect(decodeEntities("&#229;&#xE4;&amp;ouml; &amp;amp;")).toBe("åäö &");
  });
});
