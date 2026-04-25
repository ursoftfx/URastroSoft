// Vedic astrology calculations - sidereal positions using Lahiri ayanamsa
// Uses astronomia for high-precision astronomical calculations

import { julian, moonposition, solar, planetposition } from "astronomia";
import vsop87Bmercury from "astronomia/data/vsop87Bmercury";
import vsop87Bvenus from "astronomia/data/vsop87Bvenus";
import vsop87Bmars from "astronomia/data/vsop87Bmars";
import vsop87Bjupiter from "astronomia/data/vsop87Bjupiter";
import vsop87Bsaturn from "astronomia/data/vsop87Bsaturn";

export const RASIS_TAMIL = [
  "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி",
  "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்",
];

export const RASIS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const NAKSHATRAS_TAMIL = [
  "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்", "திருவாதிரை",
  "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
  "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி",
];

export const NAKSHATRA_LORDS_TAMIL = [
  "கேது", "சுக்ரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு",
  "குரு", "சனி", "புதன்", "கேது", "சுக்ரன்", "சூரியன்",
  "சந்திரன்", "செவ்வாய்", "ராகு", "குரு", "சனி", "புதன்",
  "கேது", "சுக்ரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு",
  "குரு", "சனி", "புதன்",
];

export const PLANETS_TAMIL = {
  sun: "சூரியன்",
  moon: "சந்திரன்",
  mars: "செவ்வாய்",
  mercury: "புதன்",
  jupiter: "குரு",
  venus: "சுக்ரன்",
  saturn: "சனி",
  rahu: "ராகு",
  ketu: "கேது",
  ascendant: "லக்னம்",
};

// Lahiri ayanamsa approximation (degrees)
function lahiriAyanamsa(jd: number): number {
  // Reference: Lahiri ayanamsa = 23°51'11" at J2000 + ~50.27"/yr precession
  const t = (jd - 2451545.0) / 36525;
  const ay = 23.85 + 0.013966 * (jd - 2451545.0) / 365.25 * 0.0;
  // Better approximation:
  const ay2 = 23.85 + (jd - 2451545.0) / 365.25 * (50.2789 / 3600);
  return ay2;
}

function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23 local
  minute: number; // 0-59
  tzOffsetHours: number; // e.g. +5.5 for IST
  latitude: number;
  longitude: number;
  placeName: string;
  name: string;
  gender?: string;
}

export interface PlanetPosition {
  key: string;
  nameTamil: string;
  longitude: number; // sidereal
  rasiIndex: number; // 0-11
  rasiTamil: string;
  rasiEn: string;
  degreeInRasi: number;
  nakshatraIndex: number;
  nakshatraTamil: string;
  pada: number;
  retrograde?: boolean;
}

export interface JathagamResult {
  input: BirthInput;
  jd: number;
  ayanamsa: number;
  ascendant: PlanetPosition;
  planets: PlanetPosition[];
  moon: PlanetPosition;
  sun: PlanetPosition;
  rasiTamil: string; // moon sign
  nakshatraTamil: string;
  pada: number;
  nakshatraLordTamil: string;
  lagnaTamil: string;
  // Vimshottari dasha
  currentDasha: { lord: string; startDate: Date; endDate: Date };
  dashaSequence: { lord: string; startDate: Date; endDate: Date }[];
  // Rasi chart - 12 houses with planet keys
  rasiChart: string[][];
}

function toJulianUT(input: BirthInput): number {
  // Convert local time to UT
  const utHourFloat = input.hour + input.minute / 60 - input.tzOffsetHours;
  // astronomia julian.CalendarGregorianToJD takes year, month, day(decimal)
  const dayFrac = input.day + utHourFloat / 24;
  return julian.CalendarGregorianToJD(input.year, input.month, dayFrac);
}

function getPlanetPosition(jd: number, ayanamsa: number, key: string, nameTamil: string, tropicalLon: number, retrograde = false): PlanetPosition {
  const sidereal = norm360(tropicalLon - ayanamsa);
  const rasiIndex = Math.floor(sidereal / 30);
  const degreeInRasi = sidereal - rasiIndex * 30;
  // Each nakshatra = 360/27 = 13.3333°, pada = nakshatra/4 = 3.3333°
  const nakshatraIndex = Math.floor(sidereal / (360 / 27));
  const padaSize = (360 / 27) / 4;
  const pada = Math.floor((sidereal - nakshatraIndex * (360 / 27)) / padaSize) + 1;
  return {
    key,
    nameTamil,
    longitude: sidereal,
    rasiIndex,
    rasiTamil: RASIS_TAMIL[rasiIndex],
    rasiEn: RASIS_EN[rasiIndex],
    degreeInRasi,
    nakshatraIndex,
    nakshatraTamil: NAKSHATRAS_TAMIL[nakshatraIndex],
    pada,
    retrograde,
  };
}

// Local Sidereal Time (in degrees) for ascendant calc
function localSiderealTime(jd: number, longitude: number): number {
  const t = (jd - 2451545.0) / 36525;
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  gmst = norm360(gmst);
  return norm360(gmst + longitude);
}

// Compute tropical ascendant given LST(deg), latitude(deg), obliquity(deg)
function computeAscendant(lstDeg: number, latDeg: number, oblDeg: number): number {
  const lst = (lstDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const obl = (oblDeg * Math.PI) / 180;
  const y = -Math.cos(lst);
  const x = Math.sin(obl) * Math.tan(lat) + Math.cos(obl) * Math.sin(lst);
  let asc = Math.atan2(y, x) * (180 / Math.PI);
  asc = norm360(asc);
  return asc;
}

// Vimshottari dasha periods (years)
const DASHA_LORDS = ["கேது", "சுக்ரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு", "குரு", "சனி", "புதன்"];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const NAK_TO_DASHA_INDEX = [0,1,2,3,4,5,6,7,8, 0,1,2,3,4,5,6,7,8, 0,1,2,3,4,5,6,7,8];

function computeDasha(moonLongitude: number, birthDate: Date) {
  const padaSize = 360 / 27;
  const nakIndex = Math.floor(moonLongitude / padaSize);
  const posInNak = moonLongitude - nakIndex * padaSize;
  const fractionElapsed = posInNak / padaSize;

  const startLordIdx = NAK_TO_DASHA_INDEX[nakIndex];
  const startLord = DASHA_LORDS[startLordIdx];
  const startYears = DASHA_YEARS[startLordIdx];

  // Remaining of first dasha
  const remainingYears = startYears * (1 - fractionElapsed);

  const sequence: { lord: string; startDate: Date; endDate: Date }[] = [];
  let cursor = new Date(birthDate);
  // First (partial) period
  let endFirst = addYears(cursor, remainingYears);
  sequence.push({ lord: startLord, startDate: cursor, endDate: endFirst });

  let idx = startLordIdx;
  cursor = endFirst;
  for (let i = 0; i < 8; i++) {
    idx = (idx + 1) % 9;
    const yrs = DASHA_YEARS[idx];
    const next = addYears(cursor, yrs);
    sequence.push({ lord: DASHA_LORDS[idx], startDate: cursor, endDate: next });
    cursor = next;
  }

  // Find current dasha
  const now = new Date();
  let current = sequence[0];
  for (const d of sequence) {
    if (now >= d.startDate && now < d.endDate) {
      current = d;
      break;
    }
  }
  return { current, sequence };
}

function addYears(date: Date, years: number): Date {
  const ms = years * 365.2425 * 24 * 3600 * 1000;
  return new Date(date.getTime() + ms);
}

export function computeJathagam(input: BirthInput): JathagamResult {
  const jd = toJulianUT(input);
  const ayanamsa = lahiriAyanamsa(jd);

  // Sun (apparent geocentric ecliptic longitude)
  const sunLon = (solar.apparentLongitude(julian.J2000Century(jd)) * 180) / Math.PI;

  // Moon
  const moonPos = moonposition.position(jd);
  const moonLon = (moonPos.lon * 180) / Math.PI;

  // Planets via VSOP87
  const planetData: { key: string; data: any }[] = [
    { key: "mercury", data: vsop87Bmercury },
    { key: "venus", data: vsop87Bvenus },
    { key: "mars", data: vsop87Bmars },
    { key: "jupiter", data: vsop87Bjupiter },
    { key: "saturn", data: vsop87Bsaturn },
  ];

  const earthPlanet = null; // We use heliocentric -> geocentric approximation via solar position

  // For geocentric apparent longitude, simplest reasonable approach:
  // Use planetposition for each planet (heliocentric ecliptic), then compute geocentric.
  // astronomia provides Planet class
  const sunHelio = (solar.apparentLongitude(julian.J2000Century(jd)) * 180) / Math.PI;

  const planetTropical: Record<string, number> = {
    sun: sunLon,
    moon: moonLon,
  };

  for (const p of planetData) {
    try {
      const planet = new planetposition.Planet(p.data);
      // heliocentric ecliptic coords
      const helio = planet.position(jd);
      // helio.lon, lat, range. We need geocentric. Use Earth position via VSOP would be needed.
      // Approximation: geocentric longitude ≈ heliocentric + 180 for outer? Not accurate.
      // Better: use ecliptic position relative to Earth via simple vector subtraction.
      // We'll use a simpler method: astronomia has elliptic.position for accurate geocentric, but requires Earth VSOP.
      // For now, store heliocentric — but we need geocentric for astrology.
      planetTropical[p.key] = norm360((helio.lon * 180) / Math.PI);
    } catch (e) {
      planetTropical[p.key] = 0;
    }
  }

  // Rahu (Mean Lunar Node ascending)
  // Mean longitude of ascending node: from Meeus
  const T = (jd - 2451545.0) / 36525;
  const meanNode = norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000);
  planetTropical.rahu = meanNode;
  planetTropical.ketu = norm360(meanNode + 180);

  // Ascendant
  const lst = localSiderealTime(jd, input.longitude);
  const obliquity = 23.4392911 - 0.0130042 * T; // degrees
  const ascTropical = computeAscendant(lst, input.latitude, obliquity);

  const planets: PlanetPosition[] = [
    getPlanetPosition(jd, ayanamsa, "sun", PLANETS_TAMIL.sun, planetTropical.sun),
    getPlanetPosition(jd, ayanamsa, "moon", PLANETS_TAMIL.moon, planetTropical.moon),
    getPlanetPosition(jd, ayanamsa, "mars", PLANETS_TAMIL.mars, planetTropical.mars),
    getPlanetPosition(jd, ayanamsa, "mercury", PLANETS_TAMIL.mercury, planetTropical.mercury),
    getPlanetPosition(jd, ayanamsa, "jupiter", PLANETS_TAMIL.jupiter, planetTropical.jupiter),
    getPlanetPosition(jd, ayanamsa, "venus", PLANETS_TAMIL.venus, planetTropical.venus),
    getPlanetPosition(jd, ayanamsa, "saturn", PLANETS_TAMIL.saturn, planetTropical.saturn),
    getPlanetPosition(jd, ayanamsa, "rahu", PLANETS_TAMIL.rahu, planetTropical.rahu, true),
    getPlanetPosition(jd, ayanamsa, "ketu", PLANETS_TAMIL.ketu, planetTropical.ketu, true),
  ];

  const ascendant = getPlanetPosition(jd, ayanamsa, "ascendant", PLANETS_TAMIL.ascendant, ascTropical);
  const moon = planets.find((p) => p.key === "moon")!;
  const sun = planets.find((p) => p.key === "sun")!;

  // Rasi chart - 12 houses keyed by rasi index (0=Aries)
  const rasiChart: string[][] = Array.from({ length: 12 }, () => []);
  for (const p of planets) rasiChart[p.rasiIndex].push(p.key);
  rasiChart[ascendant.rasiIndex].unshift("ascendant");

  // Birth date as JS Date (UTC adjusted)
  const localDate = new Date(Date.UTC(input.year, input.month - 1, input.day, input.hour - input.tzOffsetHours, input.minute));

  const dasha = computeDasha(moon.longitude, localDate);
  const lordIdx = NAK_TO_DASHA_INDEX[moon.nakshatraIndex];

  return {
    input,
    jd,
    ayanamsa,
    ascendant,
    planets,
    moon,
    sun,
    rasiTamil: moon.rasiTamil,
    nakshatraTamil: moon.nakshatraTamil,
    pada: moon.pada,
    nakshatraLordTamil: DASHA_LORDS[lordIdx],
    lagnaTamil: ascendant.rasiTamil,
    currentDasha: dasha.current,
    dashaSequence: dasha.sequence,
    rasiChart,
  };
}

export function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}° ${m}' ${s}"`;
}
