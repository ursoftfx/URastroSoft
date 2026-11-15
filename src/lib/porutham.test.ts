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

  it("counts Mahendra and Stree Deergha in bride-to-groom order", () => {
    expect(item(0, 3, 0, 0, "மகேந்திர பொருத்தம்")?.score).toBe(1); // Count 4
    expect(item(0, 3, 0, 0, "ஸ்த்ரீ தீர்க்க பொருத்தம்")?.score).toBe(0);
    expect(item(0, 13, 0, 0, "ஸ்த்ரீ தீர்க்க பொருத்தம்")?.score).toBe(1); // Count 14
  });

  it("applies bride-to-groom Rasi positions and the same-star exception", () => {
    expect(item(0, 0, 0, 6, "ராசி பொருத்தம்")?.score).toBe(1); // 7th
    expect(item(0, 0, 0, 5, "ராசி பொருத்தம்")?.score).toBe(0); // 6th
    expect(item(0, 0, 0, 0, "ராசி பொருத்தம்")?.score).toBe(0); // same star and rasi
    expect(item(2, 2, 0, 1, "ராசி பொருத்தம்")?.score).toBe(1); // Krittika spans Mesha/Rishabha
    expect(item(2, 2, 0, 0, "தின பொருத்தம்")?.score).toBe(1); // Krittika same-star exception
  });
});