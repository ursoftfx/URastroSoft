import { describe, expect, it } from "vitest";
import { compute10Porutham } from "@/lib/porutham";

const item = (girlNak: number, boyNak: number, girlRasi = 0, boyRasi = 0, name: string) =>
  compute10Porutham(boyNak, boyRasi, girlNak, girlRasi).items.find((entry) => entry.name === name);

describe("Tamil 10-porutham calculations", () => {
  it("counts Dina from the bride's star to the groom's star", () => {
    expect(item(0, 2, 0, 0, "தின பொருத்தம்")?.score).toBe(0);
    expect(item(2, 0, 0, 0, "தின பொருத்தம்")?.score).toBe(1);
  });

  it("uses the five traditional Rajju groups", () => {
    expect(item(0, 17, 0, 0, "ரஜ்ஜு பொருத்தம்")?.score).toBe(0); // Ashwini and Jyeshtha: Pada
    expect(item(4, 22, 0, 0, "ரஜ்ஜு பொருத்தம்")?.score).toBe(0); // Mrigashira and Dhanishta: Siro
    expect(item(0, 1, 0, 0, "ரஜ்ஜு பொருத்தம்")?.score).toBe(1); // Pada and Kati
  });

  it("recognizes the standard mutual Vedha pairs", () => {
    expect(item(0, 17, 0, 0, "வேத பொருத்தம்")?.score).toBe(0); // Ashwini–Jyeshtha
    expect(item(4, 22, 0, 0, "வேத பொருத்தம்")?.score).toBe(0); // Mrigashira–Dhanishta
    expect(item(4, 13, 0, 0, "வேத பொருத்தம்")?.score).toBe(1); // Not a Vedha pair
  });

  it("uses the standard star-to-animal table and hostile yoni pairs", () => {
    expect(item(0, 23, 0, 0, "யோனி பொருத்தம்")?.score).toBe(1); // Horse–horse
    expect(item(0, 12, 0, 0, "யோனி பொருத்தம்")?.score).toBe(0); // Horse–buffalo
  });

  it("checks Vasya from the bride's rasi toward the groom's rasi", () => {
    expect(item(0, 0, 0, 4, "வசிய பொருத்தம்")?.score).toBe(1); // Mesha draws Simha
    expect(item(0, 0, 0, 1, "வசிய பொருத்தம்")?.score).toBe(0); // Mesha–Rishabha is not a listed pair
  });

  it("uses the complete directional Vasya table", () => {
    const expectedGroomRasisByBride = [
      [4, 7], [3, 6], [5], [7, 8], [9], [1, 11],
      [9], [3, 5], [11], [10], [11], [9],
    ];
    expectedGroomRasisByBride.forEach((expected, brideRasi) => {
      const actual = Array.from({ length: 12 }, (_, groomRasi) => groomRasi)
        .filter((groomRasi) => item(0, 0, brideRasi, groomRasi, "வசிய பொருத்தம்")?.score === 1);
      expect(actual).toEqual(expected);
    });
  });

  it("labels the five Rajju groups consistently with their calculation groups", () => {
    const expected = [
      [0, 8, "பாத"], [1, 7, "ஊரு"], [2, 6, "நாபி"],
      [3, 5, "கண்ட"], [4, 13, "சிரோ"],
    ] as const;
    expected.forEach(([firstStar, secondStar, label]) => {
      expect(item(firstStar, secondStar, 0, 0, "ரஜ்ஜு பொருத்தம்")?.note).toContain(label);
    });
  });

  it("counts Mahendra and Stree Deergha in bride-to-groom order", () => {
    expect(item(0, 3, 0, 0, "மகேந்திர பொருத்தம்")?.score).toBe(1); // Count 4
    expect(item(0, 3, 0, 0, "ஸ்த்ரீ தீர்க்க பொருத்தம்")?.score).toBe(0);
    expect(item(0, 13, 0, 0, "ஸ்த்ரீ தீர்க்க பொருத்தம்")?.score).toBe(1); // Count 14
  });

  it("applies bride-to-groom Rasi positions and the same-star exception", () => {
    expect(item(0, 0, 0, 6, "ராசி பொருத்தம்")?.score).toBe(0.5); // 7th, moderate in the cited Hosur convention
    expect(item(0, 0, 0, 7, "ராசி பொருத்தம்")?.score).toBe(0.5); // 8th, moderate
    expect(item(0, 0, 0, 5, "ராசி பொருத்தம்")?.score).toBe(0); // 6th
    expect(item(0, 0, 0, 8, "ராசி பொருத்தம்")?.score).toBe(1); // 9th
    expect(item(0, 0, 0, 0, "ராசி பொருத்தம்")?.score).toBe(0); // same star and rasi
    expect(item(2, 2, 1, 0, "ராசி பொருத்தம்")?.score).toBe(1); // Krittika spans Mesha/Rishabha
    expect(item(2, 2, 0, 1, "தின பொருத்தம்")?.score).toBe(1); // Krittika same-star exception
  });

  it("flags Rajju or Vedha failures in the overall summary", () => {
    const result = compute10Porutham(17, 0, 0, 0); // Ashwini–Jyeshtha: both Rajju and Vedha fail
    expect(result.items.find((entry) => entry.name === "ரஜ்ஜு பொருத்தம்")?.score).toBe(0);
    expect(result.items.find((entry) => entry.name === "வேத பொருத்தம்")?.score).toBe(0);
    expect(result.verdict).toContain("ரஜ்ஜு / வேதை");
  });
});