import { describe, it, expect } from "vitest";
import { computeJathagam, navamsaRasi } from "@/lib/jathagam";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

describe("navamsa calculations", () => {
  it("keeps Rahu and Ketu opposite in D9 when retrograde-counted 180° apart", () => {
    for (let lon = 0; lon < 360; lon += 1.25) {
      expect(navamsaRasi(lon + 180, true)).toBe((navamsaRasi(lon, true) + 6) % 12);
    }
  });

  it("adds Mandi to both Rasi and Navamsa charts", () => {
    const result = computeJathagam({
      name: "Test",
      gender: "male",
      year: 1990,
      month: 5,
      day: 15,
      hour: 10,
      minute: 30,
      tzOffsetHours: 5.5,
      latitude: 13.0827,
      longitude: 80.2707,
      placeName: "Chennai",
    });

    const mandiNavamsa = result.navamsaPositions.find((p) => p.key === "mandi");
    expect(result.rasiChart[result.mandi.rasiIndex]).toContain("mandi");
    expect(mandiNavamsa).toBeDefined();
    expect(result.navamsaChart[mandiNavamsa!.rasiIndex]).toContain("mandi");
  });
});
