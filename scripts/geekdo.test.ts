import { describe, expect, it } from "vitest";
import { htmlToText, parseGeekdo } from "./geekdo.ts";

describe("htmlToText", () => {
  it("keeps paragraphs and decodes entities", () => {
    expect(htmlToText("<p>Build a zoo &amp; save animals.</p><p>Line<br/>break</p>")).toBe(
      "Build a zoo & save animals.\n\nLine\nbreak",
    );
  });
});

describe("parseGeekdo", () => {
  it("maps boardgamegeek.com's JSON to our game shape", () => {
    const game = parseGeekdo(
      342942,
      {
        objectid: "342942",
        name: "Ark Nova",
        yearpublished: "2021",
        minplayers: "1",
        maxplayers: "4",
        minplaytime: "90",
        maxplaytime: "150",
        minage: "14",
        description: "<p>Plan and design a modern zoo.</p>",
        images: { original: "https://cf.geekdo-images.com/original.jpg", square200: "https://cf.geekdo-images.com/sq.jpg" },
        links: {
          boardgamecategory: [{ name: "Animals" }],
          boardgamemechanic: [{ name: "Hand Management" }],
          boardgamedesigner: [{ name: "Mathias Wigge" }],
        },
      },
      { stats: { average: "8.5", avgweight: "3.77" }, rankinfo: [{ subdomain: null, rank: "3" }] },
    );
    expect(game).toEqual({
      bggId: 342942,
      name: "Ark Nova",
      year: 2021,
      description: "Plan and design a modern zoo.",
      image: "https://cf.geekdo-images.com/original.jpg",
      thumbnail: "https://cf.geekdo-images.com/sq.jpg",
      players: { min: 1, max: 4 },
      playTime: { min: 90, max: 150 },
      minAge: 14,
      rating: 8.5,
      weight: 3.77,
      rank: 3,
      categories: ["Animals"],
      mechanics: ["Hand Management"],
      designers: ["Mathias Wigge"],
    });
  });

  it("copes with missing stats", () => {
    expect(parseGeekdo(1, { name: "X" }, undefined)).toMatchObject({ rating: null, players: null, image: null });
  });
});
