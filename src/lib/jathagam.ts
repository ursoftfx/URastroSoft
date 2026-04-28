// Vedic astrology calculations - sidereal positions using Lahiri ayanamsa
// Uses astronomia for high-precision astronomical calculations

import { julian, moonposition, solar, planetposition, base, elliptic, coord } from "astronomia";
import vsop87Bmercury from "astronomia/data/vsop87Bmercury";
import vsop87Bvenus from "astronomia/data/vsop87Bvenus";
import vsop87Bearth from "astronomia/data/vsop87Bearth";
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
  phone?: string;
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

export const TITHIS_TAMIL = [
  "பிரதமை","துவிதியை","திருதியை","சதுர்த்தி","பஞ்சமி","சஷ்டி","சப்தமி","அஷ்டமி",
  "நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி","பௌர்ணமி",
  "பிரதமை","துவிதியை","திருதியை","சதுர்த்தி","பஞ்சமி","சஷ்டி","சப்தமி","அஷ்டமி",
  "நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி","அமாவாசை",
];

export const YOGAS_TAMIL = [
  "விஷ்கம்பம்","ப்ரீதி","ஆயுஷ்மான்","சௌபாக்கியம்","சோபனம்","அதிகண்டம்","சுகர்மம்","திருதி",
  "சூலம்","கண்டம்","விருத்தி","துருவம்","வியாகாதம்","ஹர்ஷணம்","வஜ்ரம்","சித்தி",
  "வியதீபாதம்","வரியான்","பரிகம்","சிவம்","சித்தம்","சாத்தியம்","சுபம்","சுக்லம்",
  "ப்ரம்மம்","ஐந்திரம்","வைதிருதி",
];

// 11 karanas: 7 movable repeat 8 times then 4 fixed at end of cycle (60 half-tithis)
export const KARANAS_TAMIL = [
  "பவ","பாலவ","கௌலவ","தைதுல","கரஜ","வணிஜ","விஷ்டி (பத்ரா)",
  "சகுனி","சதுஷ்பாத","நாகவ","கிம்ஸ்துக்னம்",
];

export interface PanchangamData {
  tithiIndex: number; // 0-29
  tithiTamil: string;
  paksha: "சுக்ல" | "கிருஷ்ண";
  yogaIndex: number; // 0-26
  yogaTamil: string;
  karanaIndex: number; // 0-10
  karanaTamil: string;
  vaaraTamil: string; // weekday
  sunriseLocal: Date;
  sunsetLocal: Date;
}

export interface MandiData {
  longitude: number;
  rasiIndex: number;
  rasiTamil: string;
  degreeInRasi: number;
  nakshatraTamil: string;
  pada: number;
}

export interface DashaNode {
  lord: string;
  startDate: Date;
  endDate: Date;
  children?: DashaNode[];
}

export interface AshtakavargaData {
  // Bhinna: per-planet bindus by rasi (7 planets x 12 rasis)
  bhinna: Record<string, number[]>;
  // Sarva: combined bindus per rasi
  sarva: number[];
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
  // Multi-level dasha tree (Maha → Bhukti → Antara → Sookshma → Athi-Sookshma)
  dashaTree: DashaNode[];
  currentDashaPath: { maha: string; bhukti: string; antara: string; sookshma: string; athiSookshma: string };
  // Rasi chart - 12 houses with planet keys
  rasiChart: string[][];
  // Navamsa chart D9 - 12 houses
  navamsaChart: string[][];
  navamsaPositions: { key: string; nameTamil: string; rasiIndex: number; rasiTamil: string }[];
  // Panchangam
  panchangam: PanchangamData;
  // Mandi / Gulika
  mandi: MandiData;
  gulika: MandiData;
  // Ashtakavarga
  ashtakavarga: AshtakavargaData;
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
  // Standard formula: λ_Asc = atan2(cos(LST), -(sin(LST)·cos(ε) + tan(φ)·sin(ε)))
  const y = Math.cos(lst);
  const x = -(Math.sin(lst) * Math.cos(obl) + Math.tan(lat) * Math.sin(obl));
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
  const sunLon = (solar.apparentLongitude(base.J2000Century(jd)) * 180) / Math.PI;

  // Moon
  const moonPos = moonposition.position(jd);
  const moonLon = (moonPos.lon * 180) / Math.PI;

  // Planets via VSOP87B - geocentric apparent ecliptic longitude using elliptic.position
  const earth = new planetposition.Planet(vsop87Bearth);
  const planetData: { key: string; data: any }[] = [
    { key: "mercury", data: vsop87Bmercury },
    { key: "venus", data: vsop87Bvenus },
    { key: "mars", data: vsop87Bmars },
    { key: "jupiter", data: vsop87Bjupiter },
    { key: "saturn", data: vsop87Bsaturn },
  ];

  const planetTropical: Record<string, number> = {
    sun: sunLon,
    moon: moonLon,
  };
  const planetRetro: Record<string, boolean> = {};

  // Convert equatorial -> ecliptic longitude (degrees, normalised)
  const eqToEclLon = (ra: number, dec: number) => {
    const eq = new coord.Equatorial(ra, dec);
    const ecl = eq.toEcliptic(base.SOblJ2000, base.COblJ2000);
    return norm360((ecl.lon * 180) / Math.PI);
  };

  for (const p of planetData) {
    try {
      const planet = new planetposition.Planet(p.data);
      const eq = elliptic.position(planet, earth, jd);
      const lon = eqToEclLon(eq.ra, eq.dec);
      // Retrograde detection: compare with position 1 day later
      const eq2 = elliptic.position(planet, earth, jd + 1);
      const lon2 = eqToEclLon(eq2.ra, eq2.dec);
      let delta = lon2 - lon;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      planetRetro[p.key] = delta < 0;
      planetTropical[p.key] = lon;
    } catch (e) {
      planetTropical[p.key] = 0;
      planetRetro[p.key] = false;
    }
  }

  // Rahu (Mean Lunar Node ascending) - always retrograde in Vedic
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
    getPlanetPosition(jd, ayanamsa, "mars", PLANETS_TAMIL.mars, planetTropical.mars, planetRetro.mars),
    getPlanetPosition(jd, ayanamsa, "mercury", PLANETS_TAMIL.mercury, planetTropical.mercury, planetRetro.mercury),
    getPlanetPosition(jd, ayanamsa, "jupiter", PLANETS_TAMIL.jupiter, planetTropical.jupiter, planetRetro.jupiter),
    getPlanetPosition(jd, ayanamsa, "venus", PLANETS_TAMIL.venus, planetTropical.venus, planetRetro.venus),
    getPlanetPosition(jd, ayanamsa, "saturn", PLANETS_TAMIL.saturn, planetTropical.saturn, planetRetro.saturn),
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
